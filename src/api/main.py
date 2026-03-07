from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

from .routes import router

# Initialize FastAPI app
app = FastAPI(
    title="AI Flood Prediction System",
    description="Comprehensive flood early warning system with AI predictions for Karnataka",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": "AI Flood Prediction System API",
        "version": "1.0.0",
        "description": "Comprehensive flood early warning system with AI predictions",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "traditional_prediction": "/api/v1/predict",
            "ai_district_prediction": "/api/v1/predict-district",
            "all_predictions": "/api/v1/predictions/all",
            "live_status": "/api/v1/status/live",
            "river_alerts": "/api/v1/alerts/river",
            "health": "/api/v1/health",
            "summary": "/api/v1/status/summary",
            "docs": "/docs",
            "openapi": "/openapi.json"
        }
    }


@app.get("/api/v1/info")
async def api_info():
    """
    Detailed API information and available endpoints
    """
    return {
        "system": "AI Flood Prediction System",
        "version": "1.0.0",
        "region": "Karnataka, India",
        "prediction_models": {
            "traditional": "Scikit-learn ML model trained on terrain, weather, and hydrological data",
            "ai": "XGBoost model trained on synthetic flood data with rainfall, river risk, and terrain factors"
        },
        "data_sources": {
            "weather": "Open-Meteo API",
            "river_levels": "Live river monitoring data",
            "geospatial": "GeoJSON files with district and waterbody boundaries"
        },
        "endpoints_by_category": {
            "predictions": [
                "POST /api/v1/predict - Traditional flood risk prediction",
                "POST /api/v1/predict-district - AI-based district prediction",
                "GET /api/v1/predictions/all - Get all district predictions"
            ],
            "monitoring": [
                "GET /api/v1/status/live - Live flood status across districts",
                "GET /api/v1/alerts/river - Active river level alerts"
            ],
            "system": [
                "GET /api/v1/health - System health check",
                "GET /api/v1/status/summary - Complete system status"
            ]
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000))
    )
