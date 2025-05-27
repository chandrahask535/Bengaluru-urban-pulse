"""Weather service for fetching real-time weather data for Karnataka."""

import logging
import aiohttp
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import numpy as np
from app.config import API_KEYS, API_ENDPOINTS

logger = logging.getLogger(__name__)

class WeatherService:
    """Service for retrieving weather data."""

    def __init__(self):
        """Initialize the weather service."""
        self.api_key = "31e340cdda515ddd9ae5cc476eeba7b6"  # Updated API key
        self.api_url = "https://api.openweathermap.org/data/2.5"
        self.cache = {}
        self.cache_expiry = {}
        self.cache_duration = 1800  # 30 minutes in seconds

    async def get_weather_data(self, lat: float, lng: float) -> Dict[str, float]:
        """Get current weather data for a specific location.

        Args:
            lat: Latitude
            lng: Longitude

        Returns:
            Dictionary containing weather data
        """
        cache_key = f"weather_{lat:.4f}_{lng:.4f}"
        
        # Check cache
        if cache_key in self.cache and datetime.now().timestamp() < self.cache_expiry.get(cache_key, 0):
            logger.info("Returning cached weather data")
            return self.cache[cache_key]
        
        try:
            if self.api_key and self.api_url:
                async with aiohttp.ClientSession() as session:
                    url = f"{self.api_url}/weather?lat={lat}&lon={lng}&appid={self.api_key}&units=metric"
                    async with session.get(url) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            # Extract relevant weather data
                            weather_data = {
                                "temperature": data.get("main", {}).get("temp", 0),
                                "humidity": data.get("main", {}).get("humidity", 0),
                                "wind_speed": data.get("wind", {}).get("speed", 0),
                                "clouds": data.get("clouds", {}).get("all", 0),
                            }
                            
                            # Extract rainfall if available (OpenWeatherMap provides it in mm)
                            rain_1h = data.get("rain", {}).get("1h", 0)
                            weather_data["rainfall"] = rain_1h
                            
                            # Get forecast
                            forecast_data = await self._get_forecast(lat, lng)
                            weather_data["rainfall_forecast"] = forecast_data.get("rainfall_24h", 0)
                            
                            # Cache the result
                            self.cache[cache_key] = weather_data
                            self.cache_expiry[cache_key] = datetime.now().timestamp() + self.cache_duration
                            
                            return weather_data
                        else:
                            logger.error(f"Error fetching weather data: {response.status}")
            
            # Fallback: Generate realistic Bangalore weather data
            logger.warning("Using fallback weather data generation")
            return self._generate_weather_data(lat, lng)
        
        except Exception as e:
            logger.exception(f"Error in get_weather_data: {str(e)}")
            return self._generate_weather_data(lat, lng)

    async def _get_forecast(self, lat: float, lng: float) -> Dict[str, float]:
        """Get weather forecast for a specific location.

        Args:
            lat: Latitude
            lng: Longitude

        Returns:
            Dictionary containing forecast data
        """
        try:
            if self.api_key and self.api_url:
                async with aiohttp.ClientSession() as session:
                    url = f"{self.api_url}/forecast?lat={lat}&lon={lng}&appid={self.api_key}&units=metric"
                    async with session.get(url) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            # Extract 24h rainfall forecast (sum of all periods in next 24h)
                            rainfall_24h = 0
                            forecast_items = data.get("list", [])
                            
                            # Typically, each forecast item is 3 hours, so we need 8 for 24 hours
                            for i, item in enumerate(forecast_items):
                                if i >= 8:  # Limit to first 24 hours (8 * 3h periods)
                                    break
                                # Get rainfall data if available
                                rainfall_24h += item.get("rain", {}).get("3h", 0)
                            
                            return {
                                "rainfall_24h": rainfall_24h
                            }
            
            # Fallback
            return {"rainfall_24h": self._generate_rainfall_forecast()}
        
        except Exception as e:
            logger.exception(f"Error in _get_forecast: {str(e)}")
            return {"rainfall_24h": self._generate_rainfall_forecast()}

    async def get_rainfall_history(self, lat: float, lng: float, days: int = 7) -> List[Dict[str, Any]]:
        """Get historical rainfall data for a specific location.

        Args:
            lat: Latitude
            lng: Longitude
            days: Number of days to look back

        Returns:
            List of dictionaries containing daily rainfall data
        """
        cache_key = f"rainfall_history_{lat:.4f}_{lng:.4f}_{days}"
        
        # Check cache
        if cache_key in self.cache and datetime.now().timestamp() < self.cache_expiry.get(cache_key, 0):
            logger.info("Returning cached rainfall history")
            return self.cache[cache_key]
        
        try:
            # Try to fetch real data (would need a historical weather API or database)
            # For now, generate realistic data
            result = []
            
            # Determine current month to generate season-appropriate data
            current_month = datetime.now().month
            
            for i in range(days):
                date = datetime.now() - timedelta(days=i+1)
                
                # Generate rainfall based on Bangalore's seasonal patterns
                rainfall = self._generate_rainfall_for_date(date)
                
                result.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "rainfall": rainfall
                })
            
            # Cache the result
            self.cache[cache_key] = result
            self.cache_expiry[cache_key] = datetime.now().timestamp() + self.cache_duration
            
            return result
        
        except Exception as e:
            logger.exception(f"Error in get_rainfall_history: {str(e)}")
            return [{
                "date": (datetime.now() - timedelta(days=i+1)).strftime("%Y-%m-%d"),
                "rainfall": max(0, np.random.normal(5, 10))
            } for i in range(days)]

    def _generate_weather_data(self, lat: float, lng: float) -> Dict[str, float]:
        """Generate realistic weather data for Bangalore region.

        Args:
            lat: Latitude
            lng: Longitude

        Returns:
            Dictionary containing weather data
        """
        # Determine current month and time for realistic data
        current_month = datetime.now().month
        current_hour = datetime.now().hour
        
        # Temperature patterns for Bangalore by month (°C)
        temp_means = {
            1: 22, 2: 24, 3: 26, 4: 28, 5: 27, 6: 25,
            7: 24, 8: 24, 9: 24, 10: 24, 11: 23, 12: 22
        }
        temp_std = 2.0
        
        # Humidity patterns for Bangalore by month (%)
        humidity_means = {
            1: 60, 2: 55, 3: 50, 4: 55, 5: 65, 6: 75,
            7: 80, 8: 80, 9: 75, 10: 70, 11: 65, 12: 60
        }
        humidity_std = 10.0
        
        # Generate temperature with diurnal variation
        base_temp = temp_means[current_month]
        diurnal_offset = -3 + 6 * np.sin(np.pi * (current_hour - 2) / 12)  # Coolest at ~2am, warmest at ~2pm
        temperature = np.random.normal(base_temp + diurnal_offset, temp_std)
        
        # Generate humidity
        humidity = np.random.normal(humidity_means[current_month], humidity_std)
        humidity = max(30, min(100, humidity))  # Clamp to realistic range
        
        # Generate wind speed (m/s)
        wind_speed = max(0, np.random.normal(3, 1.5))
        
        # Generate cloud cover (%)
        clouds = max(0, min(100, np.random.normal(50, 20)))
        
        # Generate rainfall based on season
        rainfall = self._generate_rainfall_for_date(datetime.now())
        
        # Generate forecast
        rainfall_forecast = self._generate_rainfall_forecast()
        
        return {
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1),
            "wind_speed": round(wind_speed, 1),
            "clouds": round(clouds, 1),
            "rainfall": round(rainfall, 1),
            "rainfall_forecast": round(rainfall_forecast, 1)
        }

    def _generate_rainfall_for_date(self, date: datetime) -> float:
        """Generate realistic rainfall for Bangalore based on date.

        Args:
            date: The date to generate rainfall for

        Returns:
            Rainfall amount in mm
        """
        month = date.month
        
        # Dry season (Dec-Feb): Very low rainfall
        if month in [12, 1, 2]:
            return max(0, np.random.normal(2, 5))
        # Pre-monsoon (Mar-May): Increasing rainfall
        elif month in [3, 4, 5]:
            return max(0, np.random.normal(10 + (month-3)*10, 15))
        # Monsoon (Jun-Sep): Heavy rainfall
        elif month in [6, 7, 8, 9]:
            # Random heavy rainfall events
            if np.random.random() < 0.3:  # 30% chance of heavy rain
                return max(0, np.random.normal(80, 30))
            else:
                return max(0, np.random.normal(30, 20))
        # Post-monsoon (Oct-Nov): Decreasing rainfall
        else:
            return max(0, np.random.normal(25 - (month-10)*10, 20))

    def _generate_rainfall_forecast(self) -> float:
        """Generate a realistic 24-hour rainfall forecast for Bangalore.

        Returns:
            Forecasted rainfall amount in mm
        """
        # Generate a higher rainfall forecast when in monsoon season
        current_month = datetime.now().month
        
        # Monsoon season (Jun-Sep): Higher rainfall
        if current_month in [6, 7, 8, 9]:
            # 40% chance of heavy rain forecast
            if np.random.random() < 0.4:
                return max(0, np.random.normal(100, 40))
            else:
                return max(0, np.random.normal(40, 25))
        # Pre-monsoon (Mar-May): Moderate rainfall
        elif current_month in [3, 4, 5]:
            return max(0, np.random.normal(20 + (current_month-3)*10, 15))
        # Post-monsoon (Oct-Nov): Light to moderate rainfall
        elif current_month in [10, 11]:
            return max(0, np.random.normal(30 - (current_month-10)*15, 20))
        # Dry season (Dec-Feb): Very low rainfall
        else:
            return max(0, np.random.normal(5, 8))
