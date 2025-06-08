from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.flood_prediction import FloodPredictionService

router = APIRouter(
    prefix="/prediction",
    tags=["prediction"],
    responses={404: {"description": "Not found"}},
)

@router.get("/flood")
async def get_flood_prediction(db: Session = Depends(get_db)):
    """Get flood prediction for Bengaluru"""
    try:
        prediction_service = FloodPredictionService()
        prediction = await prediction_service.predict_flood()
        return {"prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))