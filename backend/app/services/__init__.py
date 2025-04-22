
"""Service modules for Karnataka Urban Pulse."""

from .flood_prediction import predict_flood_risk, get_recent_predictions, retrain_model
from .lake_monitoring import assess_lake_health, get_all_lakes
from .urban_planning import get_insights
from .weather_service import WeatherService
from .data_scraper import DataScraper

