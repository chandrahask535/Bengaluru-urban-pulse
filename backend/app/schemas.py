from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Base schemas
class Coordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)

class Region(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    radius: float = Field(..., gt=0)  # radius in kilometers

# User schemas
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Flood prediction schemas
class FloodPredictionRequest(BaseModel):
    location: Coordinates
    area_name: str

class FloodPrediction(BaseModel):
    risk_level: str
    probability: float

class WeatherData(BaseModel):
    rainfall: float

class FloodPredictionResponse(BaseModel):
    prediction: FloodPrediction
    weather: WeatherData
    timestamp: str

class FloodPredictionDB(BaseModel):
    id: int
    area_name: str
    prediction_date: datetime
    rainfall_forecast: float
    risk_level: str
    probability: float
    created_at: datetime

    class Config:
        from_attributes = True

# Lake monitoring schemas
class LakeHealthRequest(BaseModel):
    lake_id: int

class LakeHealthAssessment(BaseModel):
    water_quality: str
    encroachment_risk: str
    restoration_priority: str
    suggested_actions: List[str]

class LakeHealthResponse(BaseModel):
    lake: dict  # Lake data from database
    health_assessment: LakeHealthAssessment
    timestamp: str

class LakeDB(BaseModel):
    id: int
    name: str
    area: float
    depth: float
    water_quality: str
    pollution_level: str
    encroachment_status: str
    last_monitored: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Urban planning schemas
class UrbanInsightsRequest(BaseModel):
    region: Region

class UrbanInsights(BaseModel):
    green_cover_percentage: float
    drainage_efficiency: str
    flood_prone_zones: int
    suggested_improvements: List[str]

class UrbanInsightsResponse(BaseModel):
    insights: UrbanInsights
    timestamp: str

# Citizen report schemas
class CitizenReportCreate(BaseModel):
    report_type: str
    location: Coordinates
    description: str
    image_urls: Optional[List[str]] = []

class CitizenReportResponse(BaseModel):
    id: int
    report_type: str
    description: str
    status: str
    image_urls: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True