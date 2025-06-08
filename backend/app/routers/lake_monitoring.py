from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.lake_monitoring import LakeMonitoringService
from app.services.lake_data_scraper import LakeDataScraperService

router = APIRouter(
    prefix="/lake-monitoring",
    tags=["lake_monitoring"],
    responses={404: {"description": "Not found"}},
)

@router.get("/lakes")
async def get_lakes_data(db: Session = Depends(get_db)):
    """Get data for all monitored lakes"""
    try:
        lake_service = LakeMonitoringService()
        lakes_data = await lake_service.get_all_lakes()
        return {"lakes": lakes_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/lakes/{lake_id}")
async def get_lake_details(lake_id: int, db: Session = Depends(get_db)):
    """Get detailed data for a specific lake"""
    try:
        lake_service = LakeMonitoringService()
        lake_data = await lake_service.get_lake_by_id(lake_id)
        if not lake_data:
            raise HTTPException(status_code=404, detail="Lake not found")
        return lake_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/realtime-data")
async def get_realtime_lake_data(db: Session = Depends(get_db)):
    """Get real-time monitoring data for lakes"""
    try:
        scraper_service = LakeDataScraperService()
        realtime_data = await scraper_service.get_realtime_data()
        return {"realtime_data": realtime_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))