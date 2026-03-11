"""
Flask API Server for Flood Prediction System.
Integrates the Next.js UI with flood risk scoring and Telegram alerts.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import logging
import math
import os
import pickle
from typing import Any, Dict, Optional, Tuple

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests


class ValidationError(Exception):
    """Raised when request payload validation fails."""


load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
LOGGER = logging.getLogger("flood_api")


app = Flask(__name__)

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "").strip()
if allowed_origins_raw:
    allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]
    CORS(app, resources={r"/*": {"origins": allowed_origins}})
else:
    CORS(app)


TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
TELEGRAM_TIMEOUT_SECONDS = float(os.getenv("TELEGRAM_TIMEOUT_SECONDS", "8"))
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "flood_model.pkl")

RISK_CRITICAL = "critical"
RISK_HIGH = "high"
RISK_MEDIUM = "medium"
RISK_LOW = "low"
HIGH_RISK_LEVELS = {RISK_HIGH, RISK_CRITICAL}

DISTRICTS = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bijapur", "Chikballapur", "Chikmagalur", "Chitradurga", "Dakshina Kannada",
    "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu",
    "Kolar", "Koppal", "Mandya", "Mangaluru", "Mysuru", "Raichur", "Ramanagara",
    "Shivamogga", "Tumkur", "Udupi", "Uttara Kannada", "Vikarabad", "Vijayapura", "Yadgir",
]

SAFE_LOCATIONS = [
    {
        "id": 1,
        "name": "Kodagu High School - Evacuation Center",
        "location": [12.4392, 75.4991],
        "capacity": 500,
        "type": "Educational Building",
    },
    {
        "id": 2,
        "name": "Hassan District Hospital",
        "location": [13.3346, 75.9352],
        "capacity": 300,
        "type": "Hospital",
    },
    {
        "id": 3,
        "name": "Uttara Kannada Community Center",
        "location": [14.5199, 74.6572],
        "capacity": 400,
        "type": "Community Center",
    },
    {
        "id": 4,
        "name": "Chikmagalur National Park Office",
        "location": [13.3181, 75.4619],
        "capacity": 200,
        "type": "Government Building",
    },
    {
        "id": 5,
        "name": "Dakshina Kannada Stadium",
        "location": [12.8476, 75.3736],
        "capacity": 1000,
        "type": "Sports Complex",
    },
]


MODEL = None
ALERT_EXECUTOR = ThreadPoolExecutor(max_workers=4)


def json_error(message: str, status: int = 400, details: Optional[Any] = None):
    payload: Dict[str, Any] = {"error": message}
    if details is not None:
        payload["details"] = details
    return jsonify(payload), status


def load_model() -> bool:
    """Load the ML model from pickle file for health visibility."""
    global MODEL
    try:
        if not os.path.exists(MODEL_PATH):
            LOGGER.warning("Model file not found at %s", MODEL_PATH)
            return False
        with open(MODEL_PATH, "rb") as file:
            MODEL = pickle.load(file)
        LOGGER.info("Model loaded successfully from %s", MODEL_PATH)
        return True
    except Exception:
        LOGGER.exception("Failed to load model from %s", MODEL_PATH)
        return False


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def parse_bool_env(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def parse_float_field(
    payload: Dict[str, Any],
    key: str,
    *,
    default: Optional[float] = None,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
) -> float:
    raw_value = payload.get(key, default)
    if raw_value is None:
        raise ValidationError(f"Missing parameter: {key}")
    try:
        parsed = float(raw_value)
    except (TypeError, ValueError):
        raise ValidationError(f"Invalid numeric value for {key}")

    if math.isnan(parsed) or math.isinf(parsed):
        raise ValidationError(f"Invalid numeric value for {key}")
    if min_value is not None and parsed < min_value:
        raise ValidationError(f"{key} must be >= {min_value}")
    if max_value is not None and parsed > max_value:
        raise ValidationError(f"{key} must be <= {max_value}")
    return parsed


def normalize_prediction_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    district = str(data.get("district", "Kodagu")).strip() or "Kodagu"
    if len(district) > 64:
        raise ValidationError("district is too long")

    normalized = {
        "district": district,
        "rainfall_24h": data.get("rainfall_24h", data.get("rainfall")),
        "rainfall_3h": data.get("rainfall_3h", data.get("discharge")),
        "river_level": data.get("river_level", 0),
        "elevation": data.get("elevation", 300),
        "soil_moisture": data.get("soil_moisture", 0),
        "latitude": data.get("latitude", 12.97),
        "longitude": data.get("longitude", 77.59),
    }

    validated = {
        "district": normalized["district"],
        "rainfall_24h": parse_float_field(normalized, "rainfall_24h", min_value=0, max_value=1000),
        "rainfall_3h": parse_float_field(normalized, "rainfall_3h", min_value=0, max_value=500),
        "river_level": parse_float_field(normalized, "river_level", min_value=0, max_value=50),
        "elevation": parse_float_field(normalized, "elevation", min_value=-500, max_value=9000),
        "soil_moisture": parse_float_field(normalized, "soil_moisture", min_value=0, max_value=100),
        "latitude": parse_float_field(normalized, "latitude", min_value=-90, max_value=90),
        "longitude": parse_float_field(normalized, "longitude", min_value=-180, max_value=180),
    }
    return validated


def district_factor(district: str) -> float:
    high_risk = {
        "Kodagu", "Uttara Kannada", "Dakshina Kannada", "Udupi", "Shivamogga", "Chikmagalur",
    }
    medium_risk = {
        "Hassan", "Mysuru", "Mandya", "Belagavi", "Dharwad", "Davangere",
    }
    if district in high_risk:
        return 1.0
    if district in medium_risk:
        return 0.8
    return 0.65


def classify_risk(risk_score: float) -> str:
    if risk_score >= 0.75:
        return RISK_CRITICAL
    if risk_score >= 0.55:
        return RISK_HIGH
    if risk_score >= 0.35:
        return RISK_MEDIUM
    return RISK_LOW


def calculate_risk_score(data: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
    rainfall_24h = float(data["rainfall_24h"])
    rainfall_3h = float(data["rainfall_3h"])
    river_level = float(data["river_level"])
    elevation = float(data["elevation"])
    soil_moisture = float(data["soil_moisture"])
    district = str(data["district"])

    rain24_score = clamp(rainfall_24h / 250.0, 0.0, 1.0)
    rain3_score = clamp(rainfall_3h / 80.0, 0.0, 1.0)
    river_score = clamp(river_level / 8.0, 0.0, 1.0)
    elevation_score = 1.0 - clamp(elevation / 1200.0, 0.0, 1.0)
    soil_score = clamp(soil_moisture / 100.0, 0.0, 1.0)
    district_score = district_factor(district)

    base_score = (
        0.28 * rain24_score
        + 0.16 * rain3_score
        + 0.30 * river_score
        + 0.12 * elevation_score
        + 0.10 * soil_score
        + 0.04 * district_score
    )

    interaction_bonus = 0.0
    if rainfall_24h >= 120 and river_level >= 5.0:
        interaction_bonus += 0.12
    if rainfall_3h >= 35 and soil_moisture >= 70:
        interaction_bonus += 0.10
    if elevation <= 250 and river_level >= 4.0:
        interaction_bonus += 0.08

    risk_floor = 0.0
    if rainfall_24h >= 130:
        risk_floor = max(risk_floor, 0.40)
    if rainfall_3h >= 35:
        risk_floor = max(risk_floor, 0.38)
    if river_level >= 5.5:
        risk_floor = max(risk_floor, 0.55)
    if elevation <= 250 and river_level >= 4.0:
        risk_floor = max(risk_floor, 0.60)
    if soil_moisture >= 80 and rainfall_24h >= 90:
        risk_floor = max(risk_floor, 0.55)

    risk_score = clamp(max(base_score + interaction_bonus, risk_floor), 0.0, 1.0)

    components = {
        "rainfall_24h_score": round(rain24_score, 3),
        "rainfall_3h_score": round(rain3_score, 3),
        "river_level_score": round(river_score, 3),
        "elevation_score": round(elevation_score, 3),
        "soil_moisture_score": round(soil_score, 3),
        "district_score": round(district_score, 3),
        "interaction_bonus": round(interaction_bonus, 3),
        "risk_floor": round(risk_floor, 3),
    }
    return risk_score, components


def find_nearest_safe_location(latitude: float, longitude: float) -> Dict[str, Any]:
    nearest = min(
        SAFE_LOCATIONS,
        key=lambda location: math.hypot(location["location"][0] - latitude, location["location"][1] - longitude),
    )
    return nearest


def build_alert_message(data: Dict[str, Any], risk_level: str, confidence: float) -> str:
    return (
        f"FLOOD ALERT - HIGH RISK DETECTED\n\n"
        f"Risk Level: {risk_level.upper()}\n"
        f"Risk Score: {confidence:.1f}%\n\n"
        f"District: {data['district']}\n"
        f"Location: Lat {data['latitude']}, Lon {data['longitude']}\n\n"
        f"Environmental Parameters:\n"
        f"- Rainfall (24h): {data['rainfall_24h']} mm\n"
        f"- Rainfall (3h): {data['rainfall_3h']} mm\n"
        f"- River Level: {data['river_level']} m\n"
        f"- Elevation: {data['elevation']} m\n"
        f"- Soil Moisture: {data['soil_moisture']}%\n\n"
        "ACTION REQUIRED: EVACUATE IMMEDIATELY!"
    )


def send_telegram_alert(message: str, location_data: Optional[Dict[str, Any]] = None) -> bool:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        LOGGER.warning("Telegram alert skipped: TELEGRAM_TOKEN/TELEGRAM_CHAT_ID not configured")
        return False

    full_message = message
    if location_data:
        full_message += (
            "\n\nSAFE EVACUATION LOCATION:\n"
            f"- {location_data['name']}\n"
            f"- Capacity: {location_data['capacity']} people\n"
            f"- Coordinates: {location_data['location'][0]}, {location_data['location'][1]}\n"
            f"- Type: {location_data['type']}"
        )

    try:
        response = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": full_message},
            timeout=TELEGRAM_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return True
    except requests.RequestException:
        LOGGER.exception("Telegram alert failed")
        return False


def queue_telegram_alert(message: str, location_data: Optional[Dict[str, Any]]) -> bool:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        LOGGER.warning("Telegram alert skipped: TELEGRAM_TOKEN/TELEGRAM_CHAT_ID not configured")
        return False
    try:
        ALERT_EXECUTOR.submit(send_telegram_alert, message, location_data)
        return True
    except RuntimeError:
        LOGGER.exception("Failed to queue Telegram alert")
        return False


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "status": "healthy",
            "model_loaded": MODEL is not None,
            "telegram_configured": bool(TELEGRAM_TOKEN and TELEGRAM_CHAT_ID),
            "timestamp": datetime.now().isoformat(),
        }
    ), 200


@app.route("/api/predict", methods=["POST"])
def predict_flood_risk():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return json_error("Invalid JSON payload", 400)

        normalized = normalize_prediction_payload(data)
        risk_score, components = calculate_risk_score(normalized)
        risk_level = classify_risk(risk_score)
        confidence = risk_score * 100.0
        is_high_risk = risk_level in HIGH_RISK_LEVELS

        safe_location = None
        alert_sent = False
        if is_high_risk:
            safe_location = find_nearest_safe_location(normalized["latitude"], normalized["longitude"])
            alert_message = build_alert_message(normalized, risk_level, confidence)
            alert_sent = queue_telegram_alert(alert_message, safe_location)

        response = {
            "prediction": float(risk_score),
            "rule_score": float(risk_score),
            "risk_level": risk_level,
            "confidence": float(confidence),
            "parameters": {
                "district": str(normalized["district"]),
                "rainfall_24h": float(normalized["rainfall_24h"]),
                "rainfall_3h": float(normalized["rainfall_3h"]),
                "river_level": float(normalized["river_level"]),
                "elevation": float(normalized["elevation"]),
                "soil_moisture": float(normalized["soil_moisture"]),
                "latitude": float(normalized["latitude"]),
                "longitude": float(normalized["longitude"]),
            },
            "score_breakdown": components,
            "safe_location": safe_location,
            "alert_sent": alert_sent,
            "timestamp": datetime.now().isoformat(),
        }
        return jsonify(response), 200
    except ValidationError as error:
        return json_error(str(error), 400)
    except Exception:
        LOGGER.exception("Error in /api/predict")
        return json_error("Internal server error", 500)


@app.route("/api/alerts", methods=["GET"])
def get_recent_alerts():
    try:
        alerts = [
            {
                "id": 1,
                "type": "flood_prediction",
                "title": "High Flood Risk Detected",
                "location": "Kodagu District",
                "message": "Risk model predicts high flood probability based on current parameters",
                "severity": "high",
                "timestamp": datetime.now().isoformat(),
                "risk_level": "high",
                "confidence": 75.5,
            }
        ]
        return jsonify(alerts), 200
    except Exception:
        LOGGER.exception("Error in /api/alerts")
        return json_error("Internal server error", 500)


@app.route("/api/safe-locations", methods=["GET"])
def get_safe_locations():
    try:
        latitude = request.args.get("latitude", type=float)
        longitude = request.args.get("longitude", type=float)

        if (latitude is None) != (longitude is None):
            return json_error("latitude and longitude must be provided together", 400)

        if latitude is None or longitude is None:
            return jsonify(SAFE_LOCATIONS), 200

        if latitude < -90 or latitude > 90 or longitude < -180 or longitude > 180:
            return json_error("latitude/longitude out of range", 400)

        locations = sorted(
            SAFE_LOCATIONS,
            key=lambda item: math.hypot(item["location"][0] - latitude, item["location"][1] - longitude),
        )
        return jsonify(locations), 200
    except Exception:
        LOGGER.exception("Error in /api/safe-locations")
        return json_error("Internal server error", 500)


@app.route("/api/send-alert", methods=["POST"])
def send_alert():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return json_error("Invalid JSON payload", 400)

        message = str(data.get("message", "")).strip()
        if not message:
            return json_error("message is required", 400)
        if len(message) > 4000:
            return json_error("message exceeds Telegram length limit", 400)

        include_safe_location = bool(data.get("include_safe_location"))
        safe_location = None
        if include_safe_location:
            latitude = parse_float_field(data, "latitude", min_value=-90, max_value=90)
            longitude = parse_float_field(data, "longitude", min_value=-180, max_value=180)
            safe_location = find_nearest_safe_location(latitude, longitude)

        success = queue_telegram_alert(message, safe_location)
        status_code = 202 if success else 500
        return jsonify({"success": success, "message": "Alert queued" if success else "Failed to queue alert"}), status_code
    except ValidationError as error:
        return json_error(str(error), 400)
    except Exception:
        LOGGER.exception("Error in /api/send-alert")
        return json_error("Internal server error", 500)


@app.route("/api/districts", methods=["GET"])
def get_districts():
    return jsonify(DISTRICTS), 200


@app.errorhandler(404)
def not_found(_error):
    return json_error("Endpoint not found", 404)


@app.errorhandler(500)
def internal_error(_error):
    return json_error("Internal server error", 500)


if __name__ == "__main__":
    if not load_model():
        LOGGER.warning("Starting without a model loaded")

    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "5000"))
    debug = parse_bool_env("API_DEBUG", False)

    LOGGER.info("Flood Prediction API Server Starting")
    LOGGER.info("Server: http://%s:%s", host, port)
    LOGGER.info("Model: %s", "Loaded" if MODEL is not None else "Not loaded")
    LOGGER.info("Telegram: %s", "Configured" if TELEGRAM_TOKEN and TELEGRAM_CHAT_ID else "Not configured")

    app.run(host=host, port=port, debug=debug, use_reloader=False)
