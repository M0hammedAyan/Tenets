from fastapi import APIRouter, HTTPException, BackgroundTasks
from pathlib import Path
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
import joblib
import os
import sys

from .schema import (
    FloodPredictionRequest, FloodPredictionResponse,
    DistrictPredictionRequest, DistrictPredictionResponse,
    LiveFloodStatusResponse, DistrictFloodStatus,
    RiverAlertsResponse, RiverAlert,
    AIFloodPredictionsResponse,
    RiskLevel, HealthCheckResponse
)

router = APIRouter(prefix="/api/v1", tags=["flood-prediction"])

# ============ MODEL LOADING ============

def load_models():
    """Load both traditional and AI flood prediction models"""
    models = {
        "traditional_model": None,
        "ai_model": None,
        "scaler": None
    }
    
    try:
        model_dir = Path(__file__).parent.parent.parent / "models"
        
        # Load traditional model
        traditional_path = model_dir / "flood_model.pkl"
        if traditional_path.exists():
            with open(traditional_path, 'rb') as f:
                models["traditional_model"] = pickle.load(f)
    except Exception as e:
        print(f"Warning: Traditional model not loaded - {e}")
    
    try:
        # Load AI model
        ai_path = model_dir / "flood_xgb_model.pkl"
        if ai_path.exists():
            models["ai_model"] = joblib.load(ai_path)
    except Exception as e:
        print(f"Warning: AI model not loaded - {e}")
    
    try:
        # Load scaler
        scaler_path = model_dir / "scaler.pkl"
        if scaler_path.exists():
            models["scaler"] = joblib.load(scaler_path)
    except Exception as e:
        print(f"Warning: Scaler not loaded - {e}")
    
    return models

# Load models on startup
MODELS = load_models()


def get_data_path(filename: str) -> Path:
    """Get data file path"""
    return Path(__file__).parent.parent.parent / "data" / filename


# ============ TRADITIONAL FLOOD PREDICTION ============

@router.post("/predict", response_model=FloodPredictionResponse)
async def predict_flood_risk(request: FloodPredictionRequest):
    """
    Traditional flood risk prediction based on weather and terrain parameters.
    
    Parameters:
    - rainfall_3hr: 3-hour rainfall in mm
    - rainfall_24hr: 24-hour rainfall in mm
    - soil_moisture: Soil moisture percentage (0-100)
    - elevation: Elevation in meters
    - slope: Slope in degrees (0-90)
    - river_proximity: Distance to river in km
    """
    try:
        if MODELS["traditional_model"] is None:
            raise HTTPException(status_code=503, detail="Traditional model not available")
        
        features = np.array([[
            request.rainfall_3hr,
            request.rainfall_24hr,
            request.soil_moisture,
            request.elevation,
            request.slope,
            request.river_proximity
        ]])
        
        risk_score = MODELS["traditional_model"].predict_proba(features)[0][1]
        
        if risk_score < 0.33:
            risk_level = RiskLevel.LOW
        elif risk_score < 0.66:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.HIGH
        
        return FloodPredictionResponse(risk_level=risk_level, risk_score=float(risk_score))
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# ============ AI DISTRICT-LEVEL PREDICTIONS ============

@router.post("/predict-district", response_model=DistrictPredictionResponse)
async def predict_district_flood(request: DistrictPredictionRequest):
    """
    AI-based district-level flood prediction using XGBoost model.
    
    Parameters:
    - district: District name in Karnataka
    - rainfall_24h_mm: 24-hour rainfall forecast
    - river_risk: River risk factor (0-1)
    - area: Area factor (default: 1.0)
    """
    try:
        if MODELS["ai_model"] is None:
            raise HTTPException(status_code=503, detail="AI model not available")
        
        if MODELS["scaler"] is None:
            raise HTTPException(status_code=503, detail="Scaler not available")
        
        # Prepare features
        features = np.array([[request.rainfall_24h_mm, request.river_risk, request.area]])
        
        # Scale features
        features_scaled = MODELS["scaler"].transform(features)
        
        # Get prediction
        flood_probability = MODELS["ai_model"].predict(features_scaled)[0]
        flood_probability = float(np.clip(flood_probability, 0, 1))
        
        # Determine risk level
        if flood_probability < 0.33:
            risk_level = RiskLevel.LOW
        elif flood_probability < 0.66:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.HIGH
        
        return DistrictPredictionResponse(
            district=request.district,
            rainfall_24h_mm=request.rainfall_24h_mm,
            river_risk=request.river_risk,
            flood_probability=flood_probability,
            risk_level=risk_level
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/predictions/all", response_model=AIFloodPredictionsResponse)
async def get_all_predictions():
    """
    Get all AI flood predictions for all districts.
    Reads from ai_flood_predictions.csv
    """
    try:
        data_file = get_data_path("ai_flood_predictions.csv")
        
        if not data_file.exists():
            raise HTTPException(status_code=404, detail="Predictions file not found. Run ai_predict.py first.")
        
        df = pd.read_csv(data_file)
        
        predictions = []
        high_risk_districts = []
        
        for _, row in df.iterrows():
            risk_level = RiskLevel.HIGH if row['RiskLevel'] == 'HIGH' else (
                RiskLevel.MEDIUM if row['RiskLevel'] == 'MEDIUM' else RiskLevel.LOW
            )
            
            pred = DistrictPredictionResponse(
                district=row['District'],
                rainfall_24h_mm=float(row['Rainfall_24h_mm']),
                river_risk=float(row['RiverRisk']),
                flood_probability=float(row['FloodProbability']),
                risk_level=risk_level
            )
            predictions.append(pred)
            
            if risk_level == RiskLevel.HIGH:
                high_risk_districts.append(row['District'])
        
        return AIFloodPredictionsResponse(
            timestamp=datetime.now().isoformat(),
            total_districts=len(predictions),
            predictions=predictions,
            high_risk_districts=high_risk_districts
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching predictions: {str(e)}")


# ============ LIVE FLOOD STATUS ============

@router.get("/status/live", response_model=LiveFloodStatusResponse)
async def get_live_flood_status():
    """
    Get live flood status for all districts.
    Reads from live_flood_status.csv
    """
    try:
        data_file = get_data_path("live_flood_status.csv")
        
        if not data_file.exists():
            raise HTTPException(status_code=404, detail="Live status file not found. Run live_monitor.py first.")
        
        df = pd.read_csv(data_file)
        
        districts = []
        high_count = medium_count = low_count = 0
        
        for _, row in df.iterrows():
            risk_level = RiskLevel.HIGH if row['RiskLevel'] == 'HIGH' else (
                RiskLevel.MEDIUM if row['RiskLevel'] == 'MEDIUM' else RiskLevel.LOW
            )
            
            district = DistrictFloodStatus(
                district=row['District'],
                rainfall_24h_mm=float(row['Rainfall_24h_mm']),
                risk_level=risk_level
            )
            districts.append(district)
            
            if risk_level == RiskLevel.HIGH:
                high_count += 1
            elif risk_level == RiskLevel.MEDIUM:
                medium_count += 1
            else:
                low_count += 1
        
        return LiveFloodStatusResponse(
            timestamp=datetime.now().isoformat(),
            districts=districts,
            high_risk_count=high_count,
            medium_risk_count=medium_count,
            low_risk_count=low_count
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live status: {str(e)}")


# ============ RIVER MONITORING ============

@router.get("/alerts/river", response_model=RiverAlertsResponse)
async def get_river_alerts():
    """
    Get active river water level alerts.
    Reads from river_alerts.csv
    """
    try:
        data_file = get_data_path("river_alerts.csv")
        
        if not data_file.exists():
            raise HTTPException(status_code=404, detail="River alerts file not found. Run river_monitor.py first.")
        
        df = pd.read_csv(data_file)
        
        alerts = []
        high_count = 0
        
        for _, row in df.iterrows():
            alert_status = RiskLevel.HIGH if row['Alert'] == 'HIGH' else RiskLevel.MEDIUM
            
            alert = RiverAlert(
                district=row['District'],
                river=row['River'],
                current_level=float(row.get('CurrentLevel', 0)),
                safe_level=float(row.get('SafeLevel', 0)),
                danger_level=float(row.get('DangerLevel', 0)),
                alert_status=alert_status
            )
            alerts.append(alert)
            
            if alert_status == RiskLevel.HIGH:
                high_count += 1
        
        return RiverAlertsResponse(
            timestamp=datetime.now().isoformat(),
            alerts=alerts,
            high_alerts_count=high_count
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching river alerts: {str(e)}")


# ============ HEALTH & STATUS ============

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Check system health and model availability
    """
    data_dir = Path(__file__).parent.parent.parent / "data"
    data_available = (data_dir / "ai_flood_predictions.csv").exists()
    
    return HealthCheckResponse(
        status="healthy",
        model_loaded_traditional=MODELS["traditional_model"] is not None,
        model_loaded_ai=MODELS["ai_model"] is not None,
        data_available=data_available,
        timestamp=datetime.now().isoformat()
    )


@router.get("/status/summary")
async def get_system_summary():
    """
    Get comprehensive system summary with all available data
    """
    try:
        summary = {
            "timestamp": datetime.now().isoformat(),
            "models": {
                "traditional": MODELS["traditional_model"] is not None,
                "ai_xgboost": MODELS["ai_model"] is not None,
                "scaler": MODELS["scaler"] is not None
            },
            "data_files": {}
        }
        
        data_dir = Path(__file__).parent.parent.parent / "data"
        
        for file in ["ai_flood_predictions.csv", "live_flood_status.csv", "river_alerts.csv", 
                     "karnataka_rivers.csv", "india_districts.geojson", "karnataka_waterbodies.geojson"]:
            summary["data_files"][file] = (data_dir / file).exists()
        
        return summary
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")
