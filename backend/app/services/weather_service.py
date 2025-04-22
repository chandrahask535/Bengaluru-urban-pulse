
"""Weather data service for fetching real-time weather information."""

from typing import Dict, Any, Optional, List
import requests
import logging
from datetime import datetime, timedelta
import aiohttp
import numpy as np
import os
from app.config import API_KEYS, API_ENDPOINTS

logger = logging.getLogger(__name__)

class WeatherService:
    """Service for fetching weather data from OpenWeatherMap API and other sources."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the weather service with an API key."""
        self.api_key = api_key or API_KEYS.get("openweathermap")
        self.base_url = API_ENDPOINTS.get("weather", "https://api.openweathermap.org/data/2.5")
        
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not found. Using dummy data.")
    
    async def get_weather_data(self, lat: float, lng: float) -> Dict[str, Any]:
        """Get current weather data for the specified location.
        
        Args:
            lat: Latitude of the location
            lng: Longitude of the location
            
        Returns:
            Dictionary containing weather data including rainfall, temperature, humidity, etc.
        """
        try:
            if not self.api_key:
                return self._get_fallback_data()
                
            async with aiohttp.ClientSession() as session:
                # Get current weather data
                params = {
                    'lat': lat,
                    'lon': lng,
                    'appid': self.api_key,
                    'units': 'metric'
                }
                
                async with session.get(f'{self.base_url}/weather', params=params) as response:
                    if response.status != 200:
                        logger.error(f"Error fetching weather data: {await response.text()}")
                        return self._get_fallback_data()
                    
                    data = await response.json()
                
                # Get rainfall forecast (5 day / 3 hour forecast)
                forecast_params = {
                    'lat': lat,
                    'lon': lng,
                    'appid': self.api_key,
                    'units': 'metric'
                }
                
                async with session.get(f'{self.base_url}/forecast', params=forecast_params) as response:
                    if response.status != 200:
                        logger.error(f"Error fetching forecast data: {await response.text()}")
                        forecast_data = {"list": []}
                    else:
                        forecast_data = await response.json()
                
                # Process current weather
                current_rainfall = data.get('rain', {}).get('1h', 0)
                if current_rainfall == 0:
                    current_rainfall = data.get('rain', {}).get('3h', 0) / 3
                
                # Calculate rainfall forecast for next 24 hours
                rainfall_forecast = 0
                forecast_count = 0
                
                for item in forecast_data.get('list', [])[:8]:  # Next 24 hours (8 x 3-hour intervals)
                    rain = item.get('rain', {}).get('3h', 0)
                    rainfall_forecast += rain
                    forecast_count += 1
                
                avg_rainfall_forecast = rainfall_forecast / max(forecast_count, 1)
                
                # Create weather data object
                weather_data = {
                    'rainfall': current_rainfall,
                    'rainfall_forecast': avg_rainfall_forecast,
                    'temperature': data['main']['temp'],
                    'humidity': data['main']['humidity'],
                    'pressure': data['main']['pressure'],
                    'wind_speed': data['wind']['speed'],
                    'weather_condition': data['weather'][0]['main'],
                    'weather_description': data['weather'][0]['description'],
                    'timestamp': datetime.utcnow().isoformat(),
                    'location': {
                        'lat': lat,
                        'lng': lng,
                        'name': data.get('name', 'Unknown')
                    }
                }
                
                return weather_data
                
        except Exception as e:
            logger.exception(f"Error in get_weather_data: {str(e)}")
            return self._get_fallback_data()
    
    async def get_rainfall_history(self, lat: float, lng: float, days: int = 30) -> List[Dict[str, Any]]:
        """Get historical rainfall data for the specified location.
        
        In a production environment, this would query a database of stored weather data.
        For this implementation, we'll generate realistic random data based on Bengaluru's
        rainfall patterns.
        
        Args:
            lat: Latitude of the location
            lng: Longitude of the location
            days: Number of days of history to retrieve
            
        Returns:
            List of daily rainfall records
        """
        # In a real implementation, this would fetch historical data from a database
        # or from a weather API that provides historical data
        
        # For now, generate realistic data based on Bengaluru's rainfall patterns
        # Bengaluru's rainy season is from June to October
        now = datetime.utcnow()
        month = now.month
        
        # Adjust rainfall probability and intensity based on season
        if 6 <= month <= 10:  # Rainy season
            rain_probability = 0.7
            max_rainfall = 50.0  # mm
        else:  # Dry season
            rain_probability = 0.2
            max_rainfall = 10.0  # mm
        
        history = []
        for i in range(days):
            date = now - timedelta(days=i)
            
            # Randomize rainfall based on season
            has_rain = np.random.random() < rain_probability
            rainfall = np.random.exponential(max_rainfall / 5) if has_rain else 0
            rainfall = min(rainfall, max_rainfall)  # Cap the rainfall amount
            
            # Add some autocorrelation - rainy days tend to cluster
            if i > 0 and history[-1]['rainfall'] > 5:
                rainfall = max(rainfall, history[-1]['rainfall'] * 0.7)
            
            history.append({
                'date': date.isoformat(),
                'rainfall': round(rainfall, 2),
                'location': {'lat': lat, 'lng': lng}
            })
        
        return sorted(history, key=lambda x: x['date'])
    
    def _get_fallback_data(self) -> Dict[str, Any]:
        """Return fallback weather data when API calls fail.
        
        Returns:
            Dictionary containing placeholder weather data
        """
        # For Bangalore, create realistic fallback data
        is_rainy_season = 6 <= datetime.utcnow().month <= 10
        
        # Generate realistic rainfall based on season
        if is_rainy_season:
            rainfall = np.random.exponential(5.0)  # Higher in rainy season
            rainfall = min(rainfall, 30.0)  # Cap at 30mm/hour
        else:
            rainfall = np.random.exponential(0.5)  # Lower in dry season
            rainfall = min(rainfall, 5.0)  # Cap at 5mm/hour
        
        return {
            'rainfall': round(rainfall, 2),
            'rainfall_forecast': round(rainfall * 0.8, 2),  # Slight decrease forecast
            'temperature': np.random.normal(25, 3),  # Around 25°C with some variation
            'humidity': np.random.normal(70, 10),  # Around 70% with some variation
            'pressure': np.random.normal(1013, 2),  # Around 1013 hPa with some variation
            'wind_speed': np.random.exponential(2),  # Low wind speed typically
            'weather_condition': 'Rain' if rainfall > 1.0 else 'Clouds' if rainfall > 0.1 else 'Clear',
            'weather_description': 'Moderate rain' if rainfall > 5.0 else 'Light rain' if rainfall > 1.0 else 'Partly cloudy' if rainfall > 0.1 else 'Clear sky',
            'timestamp': datetime.utcnow().isoformat(),
            'location': {
                'lat': 12.9716,
                'lng': 77.5946,
                'name': 'Bengaluru'
            }
        }
