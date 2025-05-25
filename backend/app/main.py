
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import uvicorn

from app.database import get_db, engine, Base
from app.routers import prediction, lake_monitoring, citizen_reports
from app.models import User, Lake, FloodPrediction, CitizenReport, UrbanZone

# Only create tables if they don't exist (don't reset on every startup)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables only if they don't exist
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Bangalore Lake and Flood Management API",
    description="API for managing lake health, flood predictions, and citizen reports",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prediction.router, prefix="/api/v1", tags=["predictions"])
app.include_router(lake_monitoring.router, prefix="/api/v1", tags=["lakes"])
app.include_router(citizen_reports.router, prefix="/api/v1", tags=["citizen-reports"])

@app.get("/")
async def root():
    return {"message": "Bangalore Lake and Flood Management API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
