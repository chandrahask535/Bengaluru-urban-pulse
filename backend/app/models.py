from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)  # admin, government, public
    created_at = Column(DateTime, default=datetime.utcnow)

class FloodPrediction(Base):
    __tablename__ = "flood_predictions"

    id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String)
    location = Column(Geometry('POINT'))
    prediction_date = Column(DateTime, default=datetime.utcnow)
    rainfall_forecast = Column(Float)
    risk_level = Column(String)
    probability = Column(Float)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class Lake(Base):
    __tablename__ = "lakes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(Geometry('POLYGON'))
    area = Column(Float)  # in square kilometers
    depth = Column(Float)  # in meters
    water_quality = Column(String)
    pollution_level = Column(String)
    encroachment_status = Column(String)
    last_monitored = Column(DateTime)
    historical_data = Column(JSON)  # Store historical measurements
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UrbanZone(Base):
    __tablename__ = "urban_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    zone_type = Column(String)  # residential, commercial, industrial, etc.
    boundary = Column(Geometry('POLYGON'))
    population_density = Column(Float)
    green_cover_percentage = Column(Float)
    flood_risk_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String)  # flood, encroachment, water_quality, etc.
    location = Column(Geometry('POINT'))
    description = Column(String)
    image_urls = Column(JSON)  # Array of image URLs
    status = Column(String)  # pending, verified, resolved
    reported_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")