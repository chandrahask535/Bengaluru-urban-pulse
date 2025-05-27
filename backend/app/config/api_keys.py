
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

API_KEYS = {
    "openweathermap": "31e340cdda515ddd9ae5cc476eeba7b6",
    "mapbox": "sk.eyJ1IjoiY2hhbmRyYWhhc2s1MzUiLCJhIjoiY21iNjMzd2VqMmZzcjJrcXpsNmoyZmxuNCJ9.BhF06QDz8fii1_HaypnBGw",
    "nasa_earth": "3zJgwMNFnYFGmqqjdyqg7wWdOhYRFs0TMpNZI6F4",
    "nasa_techport": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZWNoUG9ydCIsImV4cCI6MTc0ODQxMTcyOSwibmJmIjoxNzQ4MzI1MzI5LCJTRVNTSU9OX0lEIjoiaVM5TG9vdHFycWI1YUlNdHFpOUY1TkpMU25LTE1jNUpjdEtYIiwiRklOR0VSUFJJTlRfSEFTSCI6IjAxOUY4N0U3REI4MzgzOUJEQjlFQUIxN0M3QUJDOEFCRDZBOUE3RDdBOTBCQjA5QThDRTJBOTQ3MTAxMUI5RDYifQ.kgE-wVx-s2-D4DYwIEARVxe8rm0Kuz6Ap1R4fC_1YaQ",
    "bhuvan": "21dee4e5f0d489d5108b8c68a4e0037edc310cff",
    "geoid": "fde004c6ed39d1ce608d6a4b9b50727d7c7916b9",
    "routing": "58b719d62c0449bd65623eecbeb00bf54820ec2f",
    "lulc_aoi": "6dbf5cfa63faf8cc18abc46bfa59e66abdd6ae13",
    "lulc_statistics": "e1d917de03a931f88b9d8dec761df10e1fa80158"
}

API_ENDPOINTS = {
    "weather": "https://api.openweathermap.org/data/2.5",
    "mapbox": "https://api.mapbox.com/v2",
    "nasa_earth": "https://api.nasa.gov/planetary/earth",
    "nasa_techport": "https://api.nasa.gov/techport/api",
    "bhuvan": "https://bhuvan.nrsc.gov.in/api",
    "geoid": "https://bhuvan.nrsc.gov.in/api/geoid",
    "routing": "https://bhuvan.nrsc.gov.in/api/routing",
    "lulc": "https://bhuvan.nrsc.gov.in/api/lulc"
}

CONFIG = {
    "weather_update_interval": int(os.getenv("WEATHER_UPDATE_INTERVAL", 300000)),
    "flood_prediction_interval": int(os.getenv("FLOOD_PREDICTION_INTERVAL", 900000)),
    "lake_monitoring_interval": int(os.getenv("LAKE_MONITORING_INTERVAL", 1800000)),
    "max_retries": int(os.getenv("MAX_RETRIES", 3)),
    "request_timeout": int(os.getenv("REQUEST_TIMEOUT", 10000)),
}
