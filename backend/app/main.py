
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from sqlalchemy import inspect
import uvicorn

from .database import get_db, engine, Base
from .routers.prediction import router as prediction_router
from .routers.lake_monitoring import router as lake_monitoring_router
from .routers.citizen_reports import router as citizen_reports_router
from .models import User, Lake, FloodPrediction, CitizenReport, UrbanZone

@asynccontextmanager
async def lifespan(app: FastAPI):
    inspector = inspect(engine)
    # Only create tables if they don't exist
    if not inspector.get_table_names():
        Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Bangalore Lake and Flood Management API",
    description="API for managing lake health, flood predictions, and citizen reports",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
allow_origins=["https://yourfrontend.com"]
allow_credentials=True
allow_methods=["GET","POST"]
allow_headers=["Authorization","Content-Type"]
)

# Include routers
app.include_router(prediction_router, prefix="/api/v1", tags=["predictions"])
app.include_router(lake_monitoring_router, prefix="/api/v1", tags=["lakes"])
app.include_router(citizen_reports_router, prefix="/api/v1", tags=["citizen-reports"])

@app.get("/")
async def root():
    return {"message": "Bangalore Lake and Flood Management API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8081, reload=True)
