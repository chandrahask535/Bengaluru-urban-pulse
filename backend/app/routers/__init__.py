from .prediction import router as prediction_router
from .lake_monitoring import router as lake_monitoring_router
from .citizen_reports import router as citizen_reports_router

__all__ = ['prediction_router', 'lake_monitoring_router', 'citizen_reports_router']