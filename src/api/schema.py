from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


# Original Flood Prediction Schema
class FloodPredictionRequest(BaseModel):
    """Traditional flood risk prediction with weather and terrain parameters"""
    rainfall_3hr: float = Field(..., ge=0, description="3-hour rainfall in mm")
    rainfall_24hr: float = Field(..., ge=0, description="24-hour rainfall in mm")
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    elevation: float = Field(..., ge=0, description="Elevation in meters")
    slope: float = Field(..., ge=0, le=90, description="Slope in degrees")
    river_proximity: float = Field(..., ge=0, description="Distance to river in km")


class FloodPredictionResponse(BaseModel):
    """Flood risk prediction response"""
    risk_level: RiskLevel
    risk_score: float = Field(..., ge=0, le=1, description="Risk probability 0-1")


# AI District-Level Prediction Schema
class DistrictPredictionRequest(BaseModel):
    """District-level flood prediction using AI"""
    district: str = Field(..., description="District name in Karnataka")
    rainfall_24h_mm: float = Field(..., ge=0, description="24-hour rainfall forecast")
    river_risk: float = Field(..., ge=0, le=1, description="River risk factor 0-1")
    area: float = Field(default=1.0, ge=0.1, description="Area factor")


class DistrictPredictionResponse(BaseModel):
    """AI-based district flood prediction"""
    district: str
    rainfall_24h_mm: float
    river_risk: float
    flood_probability: float = Field(..., ge=0, le=1)
    risk_level: RiskLevel


# Live Flood Status Schema
class DistrictFloodStatus(BaseModel):
    """Current flood status for a district"""
    district: str
    rainfall_24h_mm: float
    risk_level: RiskLevel
    timestamp: Optional[str] = None


class LiveFloodStatusResponse(BaseModel):
    """All district flood statuses"""
    timestamp: str
    districts: List[DistrictFloodStatus]
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int


# River Alert Schema
class RiverAlert(BaseModel):
    """River water level alert"""
    district: str
    river: str
    current_level: float
    safe_level: float
    danger_level: float
    alert_status: RiskLevel


class RiverAlertsResponse(BaseModel):
    """All active river alerts"""
    timestamp: str
    alerts: List[RiverAlert]
    high_alerts_count: int


# AI Predictions Batch Schema
class AIFloodPredictionsResponse(BaseModel):
    """All district predictions from AI model"""
    timestamp: str
    total_districts: int
    predictions: List[DistrictPredictionResponse]
    high_risk_districts: List[str]


# Health Check Schema
class HealthCheckResponse(BaseModel):
    """System health status"""
    status: str
    model_loaded_traditional: bool
    model_loaded_ai: bool
    data_available: bool
    timestamp: str
