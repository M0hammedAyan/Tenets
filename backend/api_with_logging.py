from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pickle
import numpy as np
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))
from src.utils.logging_system import setup_logger, log_api_request, log_prediction, log_error

app = FastAPI(title="Flood Prediction API with Logging")
logger = setup_logger()

class FloodPredictionRequest(BaseModel):
    rainfall_3hr: float = Field(..., ge=0)
    rainfall_24hr: float = Field(..., ge=0)
    soil_moisture: float = Field(..., ge=0, le=100)
    elevation: float = Field(..., ge=0)
    slope: float = Field(..., ge=0, le=90)
    river_proximity: float = Field(..., ge=0)

try:
    model_path = Path(__file__).parent.parent / "models" / "flood_model.pkl"
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    logger.info("Model loaded successfully")
except Exception as e:
    model = None
    log_error(logger, e)

@app.post("/predict")
async def predict_flood_risk(request: FloodPredictionRequest):
    try:
        log_api_request(logger, "/predict", request.dict())
        
        if model is None:
            raise HTTPException(status_code=503, detail="Model not available")
        
        features = np.array([[
            request.rainfall_3hr, request.rainfall_24hr, request.soil_moisture,
            request.elevation, request.slope, request.river_proximity
        ]])
        
        risk_score = model.predict_proba(features)[0][1]
        risk_level = "Low" if risk_score < 0.33 else "Medium" if risk_score < 0.66 else "High"
        
        result = {"risk_level": risk_level, "risk_score": float(risk_score)}
        log_prediction(logger, result)
        
        return result
    except Exception as e:
        log_error(logger, e)
        raise HTTPException(status_code=500, detail=str(e))
