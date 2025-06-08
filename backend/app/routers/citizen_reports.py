from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CitizenReport
from app.schemas import CitizenReportCreate, CitizenReportResponse

router = APIRouter(
    prefix="/citizen-reports",
    tags=["citizen_reports"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=CitizenReportResponse)
async def create_report(report: CitizenReportCreate = Body(...), db: Session = Depends(get_db)):
    """Create a new citizen report"""
    try:
        db_report = CitizenReport(**report.dict())
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        return db_report
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[CitizenReportResponse])
async def get_reports(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get list of citizen reports"""
    try:
        reports = db.query(CitizenReport).offset(skip).limit(limit).all()
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}", response_model=CitizenReportResponse)
async def get_report(report_id: int, db: Session = Depends(get_db)):
    """Get a specific citizen report by ID"""
    try:
        report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{report_id}")
async def delete_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a citizen report"""
    try:
        report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        db.delete(report)
        db.commit()
        return {"message": "Report deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))