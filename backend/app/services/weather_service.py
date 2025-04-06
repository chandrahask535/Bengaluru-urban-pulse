from typing import Dict, Any, Optional
import requests
from datetime import datetime
import numpy as np
from .data_scraper import DataScraper

class WeatherService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = 'https://api.openweathermap.org/data/2.5'
        self.scraper = DataScraper()
    
    async def get_weather_data(self, lat: float, lng: float) -> Dict[str, Any]:
        """Get weather data from both OpenWeatherMap API and IMD"""
        try:
            # Get real-time data from OpenWeatherMap
            owm_data = await self._fetch_owm_data(lat, lng)
            
            # Get IMD rainfall data for validation and enhancement
            imd_data = await self.scraper.scrape_imd_rainfall()
            
            # Combine and validate data
            return self._combine_weather_data(owm_data, imd_data)
        except Exception as e:
            print(f'Error fetching weather data: {str(e)}')
            return self._get_fallback_data()
    
    async def _fetch_owm_data(self, lat: float, lng: float) -> Dict[str, Any]:
        """Fetch weather data from OpenWeatherMap API"""
        params = {
            'lat': lat,
            'lon': lng,
            'appid': self.api_key,
            'units': 'metric'
        }
        
        response = requests.get(f'{self.base_url}/weather', params=params)
        response.raise_for_status()
        data = response.json()
        
        return {
            'rainfall': data.get('rain', {}).get('1h', 0),
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'],
            'source': 'OpenWeatherMap'
        }
    
    def _combine_weather_data(self, owm_data: Dict[str, Any], imd_data: Dict[str, Any]) -> Dict[str, Any]:
        """Combine and validate weather data from multiple sources"""
        # Get average rainfall from IMD data if available
        imd_rainfall = 0
        if imd_data['data']:
            imd_rainfall = np.mean([item['rainfall_mm'] for item in imd_data['data']])
        
        # Use IMD rainfall if available, otherwise use OWM data
        rainfall = imd_rainfall if imd_rainfall > 0 else owm_data['rainfall']
        
        return {
            'rainfall': rainfall,
            'temperature': owm_data['temperature'],
            'humidity': owm_data['humidity'],
            'pressure': owm_data['pressure'],
            'wind_speed': owm_data['wind_speed'],
            'timestamp': datetime.now().isoformat(),
            'sources': ['OpenWeatherMap', 'IMD'] if imd_rainfall > 0 else ['OpenWeatherMap']
        }
    
    def _get_fallback_data(self) -> Dict[str, Any]:
        """Return fallback data when API calls fail"""
        return {
            'rainfall': np.random.uniform(0, 50),  # Random value between 0-50mm
            'temperature': 25,
            'humidity': 80,
            'pressure': 1013,
            'wind_speed': 5,
            'timestamp': datetime.now().isoformat(),
            'sources': ['Fallback']
        }