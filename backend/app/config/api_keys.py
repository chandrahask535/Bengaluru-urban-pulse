from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

API_KEYS = {
    "openweathermap": os.getenv("OPENWEATHER_API_KEY"),
    "mapbox": os.getenv("MAPBOX_API_KEY"),
    "nasa_earth": os.getenv("NASA_EARTH_API_KEY"),
    "bhuvan": os.getenv("BHUVAN_API_KEY"),
}

API_ENDPOINTS = {
    "weather": os.getenv("API_WEATHER_URL"),
    "mapbox": os.getenv("API_MAPBOX_URL"),
    "nasa_earth": os.getenv("API_NASA_EARTH_URL"),
    "bhuvan": os.getenv("API_BHUVAN_URL"),
}

CONFIG = {
    "weather_update_interval": int(os.getenv("WEATHER_UPDATE_INTERVAL", 300000)),
    "flood_prediction_interval": int(os.getenv("FLOOD_PREDICTION_INTERVAL", 900000)),
    "lake_monitoring_interval": int(os.getenv("LAKE_MONITORING_INTERVAL", 1800000)),
    "max_retries": int(os.getenv("MAX_RETRIES", 3)),
    "request_timeout": int(os.getenv("REQUEST_TIMEOUT", 10000)),
}
