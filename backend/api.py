from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pickle
import numpy as np
from pathlib import Path
import sys

# allow imports from top‑level src package when running from backend folder
sys.path.append(str(Path(__file__).parent.parent))
from src.alerts import alert_high_risk

app = FastAPI(title="Flood Prediction API")

from typing import Optional

class FloodPredictionRequest(BaseModel):
    rainfall_3hr: float = Field(..., ge=0, description="3-hour rainfall in mm")
    rainfall_24hr: float = Field(..., ge=0, description="24-hour rainfall in mm")
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    elevation: float = Field(..., ge=0, description="Elevation in meters")
    slope: float = Field(..., ge=0, le=90, description="Slope in degrees")
    river_proximity: float = Field(..., ge=0, description="Distance to river in km")
    latitude: Optional[float] = Field(None, description="Latitude of the location (optional)")
    longitude: Optional[float] = Field(None, description="Longitude of the location (optional)")

class FloodPredictionResponse(BaseModel):
    risk_level: str
    risk_score: float

try:
    model_path = Path(__file__).parent.parent / "models" / "flood_model.pkl"
    try:
        # first try pickle
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
    except Exception as e_pickle:
        # fallback to joblib (sklearn models often use this)
        try:
            import joblib
            model = joblib.load(model_path)
        except Exception as e_joblib:
            raise RuntimeError(f"Pickle failed: {e_pickle}; Joblib failed: {e_joblib}")
except Exception as e:
    model = None
    print(f"Warning: Model not loaded - {e}")

@app.post("/predict", response_model=FloodPredictionResponse)
async def predict_flood_risk(request: FloodPredictionRequest):
    try:
        if model is None:
            raise HTTPException(status_code=503, detail="Model not available")
        
        features = np.array([[
            request.rainfall_3hr,
            request.rainfall_24hr,
            request.soil_moisture,
            request.elevation,
            request.slope,
            request.river_proximity
        ]])
        
        risk_score = model.predict_proba(features)[0][1]
        
        if risk_score < 0.33:
            risk_level = "Low"
        elif risk_score < 0.66:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        # send a telegram alert if the model flags high risk
        if risk_level == "High":
            try:
                # decide what safe location to share: use coordinates from the request
                if request.latitude is not None and request.longitude is not None:
                    # simple offset for demonstration (~5km NE)
                    safe_lat = request.latitude + 0.05
                    safe_lon = request.longitude + 0.05
                    alert_high_risk(safe_lat=safe_lat, safe_lon=safe_lon)
                else:
                    alert_high_risk()
            except Exception as e:
                # failure to notify should not break prediction API
                print(f"warning: telegram alert failed: {e}")
        
        return FloodPredictionResponse(risk_level=risk_level, risk_score=float(risk_score))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}
