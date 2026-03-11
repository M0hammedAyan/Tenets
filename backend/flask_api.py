"""
Flask API Server for Flood Prediction System
Integrates the beautiful Next.js UI with ML model and Telegram alerts
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import os
import sys
import pickle
import json
from datetime import datetime
import requests
from dotenv import load_dotenv
import numpy as np

# Fix JSON serialization for numpy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
# Accept TELEGRAM_TOKEN or the legacy TELEGRAM_BOT_TOKEN name interchangeably.
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN') or os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'flood_model.pkl')

# Global variables
model = None
safe_locations = [
    {
        "id": 1,
        "name": "Kodagu High School - Evacuation Center",
        "location": [12.4392, 75.4991],
        "capacity": 500,
        "type": "Educational Building"
    },
    {
        "id": 2,
        "name": "Hassan District Hospital",
        "location": [13.3346, 75.9352],
        "capacity": 300,
        "type": "Hospital"
    },
    {
        "id": 3,
        "name": "Uttara Kannada Community Center",
        "location": [14.5199, 74.6572],
        "capacity": 400,
        "type": "Community Center"
    },
    {
        "id": 4,
        "name": "Chikmagalur National Park Office",
        "location": [13.3181, 75.4619],
        "capacity": 200,
        "type": "Government Building"
    },
    {
        "id": 5,
        "name": "Dakshina Kannada Stadium",
        "location": [12.8476, 75.3736],
        "capacity": 1000,
        "type": "Sports Complex"
    }
]

def load_model():
    """Load the ML model from pickle file"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            print(f"Model loaded successfully from {MODEL_PATH}")
            return True
        else:
            print(f"Model file not found at {MODEL_PATH}")
            return False
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def send_telegram_alert(message, location_data=None):
    """
    Send alert message to Telegram with optional safe location.
    Returns False (without raising) if credentials are not configured.
    """
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        print("Warning: Telegram credentials not configured; alert not sent")
        return False

    try:
        # Build message with safe location if provided
        full_message = message

        if location_data:
            full_message += f"\n\n🚨 SAFE EVACUATION LOCATION:\n"
            full_message += f"📍 {location_data['name']}\n"
            full_message += f"📊 Capacity: {location_data['capacity']} people\n"
            full_message += f"🗺️ Coordinates: {location_data['location'][0]}, {location_data['location'][1]}\n"
            full_message += f"ℹ️ Type: {location_data['type']}"

        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": full_message,
            "parse_mode": "HTML"
        }

        response = requests.post(url, json=payload)

        if response.status_code == 200:
            print("Telegram alert sent successfully")
            return True
        else:
            print(f"Failed to send Telegram alert: {response.text}")
            return False

    except Exception as e:
        print(f"Error sending Telegram alert: {e}")
        return False

def classify_risk(risk_score):
    """Classify risk level from normalized score (0-1)."""
    if risk_score >= 0.75:
        return "critical"
    elif risk_score >= 0.55:
        return "high"
    elif risk_score >= 0.35:
        return "medium"
    else:
        return "low"


def clamp(value, min_value, max_value):
    """Clamp numeric value into the provided bounds."""
    return max(min_value, min(max_value, value))


def district_factor(district):
    """District susceptibility factor used in flood scoring."""
    high_risk = {
        "Kodagu", "Uttara Kannada", "Dakshina Kannada", "Udupi", "Shivamogga", "Chikmagalur"
    }
    medium_risk = {
        "Hassan", "Mysuru", "Mandya", "Belagavi", "Dharwad", "Davangere"
    }
    if district in high_risk:
        return 1.0
    if district in medium_risk:
        return 0.8
    return 0.65


def calculate_risk_score(data):
    """Deterministic risk score based on user-entered prediction parameters."""
    rainfall_24h = float(data["rainfall_24h"])
    rainfall_3h = float(data["rainfall_3h"])
    river_level = float(data["river_level"])
    elevation = float(data["elevation"])
    soil_moisture = float(data["soil_moisture"])
    district = str(data["district"])

    # Normalize each driver into [0, 1].
    rain24_score = clamp(rainfall_24h / 250.0, 0.0, 1.0)
    rain3_score = clamp(rainfall_3h / 80.0, 0.0, 1.0)
    river_score = clamp(river_level / 8.0, 0.0, 1.0)
    elevation_score = 1.0 - clamp(elevation / 1200.0, 0.0, 1.0)
    soil_score = clamp(soil_moisture / 100.0, 0.0, 1.0)
    district_score = district_factor(district)

    # Weighted base score.
    base_score = (
        0.28 * rain24_score
        + 0.16 * rain3_score
        + 0.30 * river_score
        + 0.12 * elevation_score
        + 0.10 * soil_score
        + 0.04 * district_score
    )

    # Interaction bonuses for realistic flood escalation conditions.
    interaction_bonus = 0.0
    if rainfall_24h >= 120 and river_level >= 5.0:
        interaction_bonus += 0.12
    if rainfall_3h >= 35 and soil_moisture >= 70:
        interaction_bonus += 0.10
    if elevation <= 250 and river_level >= 4.0:
        interaction_bonus += 0.08

    # Apply minimum-risk floors for severe single-parameter events.
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


def find_nearest_safe_location(latitude, longitude):
    """Find nearest safe evacuation location"""
    min_distance = float('inf')
    nearest_location = None

    for location in safe_locations:
        lat, lon = location['location']
        # Simple Euclidean distance (can be replaced with Haversine for accuracy)
        distance = math.sqrt((lat - latitude)**2 + (lon - longitude)**2)

        if distance < min_distance:
            min_distance = distance
            nearest_location = location

    return nearest_location

# ==================== API ENDPOINTS ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "telegram_configured": bool(TELEGRAM_TOKEN and TELEGRAM_CHAT_ID),
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/api/predict', methods=['POST'])
def predict_flood_risk():
    """
    Predict flood risk based on district and hydrology inputs.
    Expected JSON:
    {
        "district": "Kodagu",
        "rainfall_24h": 85,
        "rainfall_3h": 15,
        "river_level": 4.9,
        "elevation": 800,
        "soil_moisture": 78.2,
        "latitude": 12.97,
        "longitude": 77.59
    }
    """
    try:
        data = request.get_json() or {}

        # Accept either new explicit keys or legacy keys for compatibility.
        normalized = {
            "district": data.get("district", "Kodagu"),
            "rainfall_24h": data.get("rainfall_24h", data.get("rainfall")),
            "rainfall_3h": data.get("rainfall_3h", data.get("discharge", 0)),
            "river_level": data.get("river_level", 0),
            "elevation": data.get("elevation", 300),
            "soil_moisture": data.get("soil_moisture", 0),
            "latitude": data.get("latitude", 12.97),
            "longitude": data.get("longitude", 77.59),
        }

        required_params = [
            "district", "rainfall_24h", "rainfall_3h", "river_level", "elevation", "soil_moisture"
        ]
        for param in required_params:
            if normalized.get(param) is None:
                return jsonify({"error": f"Missing parameter: {param}"}), 400

        risk_score, components = calculate_risk_score(normalized)
        risk_level = classify_risk(risk_score)
        confidence = risk_score * 100.0
        is_high_risk = risk_level in ['high', 'critical']
        
        # Share nearest safe location only for high-risk cases.
        safe_location = None
        if is_high_risk:
            safe_location = find_nearest_safe_location(float(normalized['latitude']), float(normalized['longitude']))
        
        # If high risk, send Telegram alert
        if is_high_risk:
            alert_message = f"""
🚨 <b>FLOOD ALERT - HIGH RISK DETECTED</b>

📊 <b>Risk Level:</b> {risk_level.upper()}
⚠️ <b>Risk Score:</b> {confidence:.1f}%

📍 <b>District:</b> {normalized['district']}
📍 <b>Location:</b> Lat {normalized['latitude']}, Lon {normalized['longitude']}

🌧️ <b>Environmental Parameters:</b>
• Rainfall (24h): {normalized['rainfall_24h']} mm
• Rainfall (3h): {normalized['rainfall_3h']} mm
• River Level: {normalized['river_level']} m
• Elevation: {normalized['elevation']} m
• Soil Moisture: {normalized['soil_moisture']}%

<b>⚠️ ACTION REQUIRED: EVACUATE IMMEDIATELY!</b>
"""
            send_telegram_alert(alert_message, safe_location)
        
        response = {
            "prediction": float(risk_score),
            "rule_score": float(risk_score),
            "risk_level": risk_level,
            "confidence": float(confidence),
            "parameters": {
                "district": str(normalized['district']),
                "rainfall_24h": float(normalized['rainfall_24h']),
                "rainfall_3h": float(normalized['rainfall_3h']),
                "river_level": float(normalized['river_level']),
                "elevation": float(normalized['elevation']),
                "soil_moisture": float(normalized['soil_moisture']),
                "latitude": float(normalized['latitude']),
                "longitude": float(normalized['longitude'])
            },
            "score_breakdown": components,
            "safe_location": safe_location,
            "alert_sent": is_high_risk,
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error in predict endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/alerts', methods=['GET'])
def get_recent_alerts():
    """Get recent alert history"""
    try:
        # This would connect to a database in production
        alerts = [
            {
                "id": 1,
                "type": "flood_prediction",
                "title": "High Flood Risk Detected",
                "location": "Kodagu District",
                "message": "ML model predicts 75% flood probability based on current parameters",
                "severity": "high",
                "timestamp": datetime.now().isoformat(),
                "risk_level": "high",
                "confidence": 75.5
            }
        ]
        
        return jsonify(alerts), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/safe-locations', methods=['GET'])
def get_safe_locations():
    """Get all safe evacuation locations"""
    try:
        # Optional filtering by latitude/longitude
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        
        locations = safe_locations.copy()
        
        if latitude and longitude:
            # Sort by distance
            locations = sorted(
                locations,
                key=lambda x: math.sqrt((x['location'][0] - latitude)**2 + (x['location'][1] - longitude)**2)
            )
        
        return jsonify(locations), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/send-alert', methods=['POST'])
def send_alert():
    """
    Manually send alert to Telegram
    Expected JSON:
    {
        "message": "Alert message",
        "include_safe_location": true,
        "latitude": 12.97,
        "longitude": 77.59
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
        if not data.get('message'):
            return jsonify({"error": "Missing required field: message"}), 400

        safe_location = None
        if data.get('include_safe_location') and data.get('latitude') and data.get('longitude'):
            safe_location = find_nearest_safe_location(data['latitude'], data['longitude'])

        success = send_telegram_alert(data['message'], safe_location)

        return jsonify({
            "success": success,
            "message": "Alert sent" if success else "Failed to send alert"
        }), 200 if success else 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/districts', methods=['GET'])
def get_districts():
    """Get all Karnataka districts"""
    districts = [
        'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
        'Bijapur', 'Chikballapur', 'Chikmagalur', 'Chitradurga', 'Dakshina Kannada',
        'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu',
        'Kolar', 'Koppal', 'Mandya', 'Mangaluru', 'Mysuru', 'Raichur', 'Ramanagara',
        'Shivamogga', 'Tumkur', 'Udupi', 'Uttara Kannada', 'Vikarabad', 'Vijayapura', 'Yadgir'
    ]
    return jsonify(districts), 200

@app.route('/api/telegram/test', methods=['POST'])
def test_telegram():
    """
    Send a test message to the configured Telegram bot to verify the integration
    works on the deployed instance.

    Returns 200 with success=true on success, 503 when credentials are missing,
    or 500 when the Telegram API call fails.
    """
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return jsonify({
            "success": False,
            "error": (
                "Telegram credentials not configured. "
                "Set the TELEGRAM_TOKEN and TELEGRAM_CHAT_ID environment variables."
            )
        }), 503

    test_message = (
        "✅ <b>Telegram integration test</b>\n"
        "Your Flood Early Warning System is correctly configured to send Telegram alerts."
    )
    success = send_telegram_alert(test_message)
    if success:
        return jsonify({"success": True, "message": "Test message sent to Telegram"}), 200
    return jsonify({"success": False, "error": "Failed to send test message; check server logs"}), 500

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ==================== MAIN ====================

if __name__ == '__main__':
    # Load model on startup
    if not load_model():
        print("Warning: Starting without model. Predictions will fail.")
    
    print("\n" + "="*50)
    print("Flood Prediction API Server Starting")
    print("="*50)
    print("Server: http://localhost:5000")
    print(f"Model: {'Loaded' if model else 'Not loaded'}")
    print(f"Telegram: {'Configured' if TELEGRAM_TOKEN else 'Not configured'}")
    print("="*50 + "\n")
    
    # Run Flask server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False
    )
