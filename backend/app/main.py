from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os # Import os module

from .database import SessionLocal, engine, Base
from .models import *  # Import all models
from .schemas import *  # Import all schemas
from .services import flood_prediction, lake_monitoring, urban_planning
from .auth import get_current_user
# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI()

# Add CORS middleware to allow React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
app = FastAPI(
    title="Karnataka Urban Pulse API",
    description="Backend API for flood prediction, lake monitoring, and urban planning",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/")
def read_root():
    return {"message": "Connected to Supabase PostgreSQL!"}

# Flood Prediction endpoints
@app.post("/api/flood-prediction", response_model=FloodPredictionResponse)
async def predict_flood(
    request: FloodPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await flood_prediction.predict_flood_risk(
            db,
            request.location,
            request.area_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Lake Monitoring endpoints
@app.post("/api/lake-health", response_model=LakeHealthResponse)
async def assess_lake_health(
    request: LakeHealthRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await lake_monitoring.assess_lake_health(
            db,
            request.lake_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Urban Planning endpoints
@app.post("/api/urban-insights", response_model=UrbanInsightsResponse)
async def get_urban_insights(
    request: UrbanInsightsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await urban_planning.get_insights(
            db,
            request.region
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Data retrieval endpoints
@app.get("/api/flood-predictions/recent", response_model=List[FloodPredictionDB])
async def get_recent_predictions(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        predictions = await flood_prediction.get_recent_predictions(db, limit)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lakes", response_model=List[LakeDB])
async def get_all_lakes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        lakes = await lake_monitoring.get_all_lakes(db)
        return lakes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)