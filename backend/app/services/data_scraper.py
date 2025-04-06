import requests
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime
import time
import json
import os
from typing import Dict, List, Any
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

class DataScraper:
    def __init__(self):
        self.chrome_options = Options()
        self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.geolocator = Nominatim(user_agent='karnataka_urban_pulse')
        
    def _get_driver(self):
        return webdriver.Chrome(options=self.chrome_options)
    
    async def scrape_imd_rainfall(self) -> Dict[str, Any]:
        """Scrape rainfall data from IMD website"""
        try:
            url = 'https://mausam.imd.gov.in/Bangalore/rainfall_data.php'
            headers = {
                'User-Agent': 'KarnatakaUrbanPulse/1.0',
                'Accept': 'text/html,application/xhtml+xml'
            }
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract rainfall data from table
            rainfall_data = {
                'timestamp': datetime.now().isoformat(),
                'data': []
            }
            
            table = soup.find('table', {'class': 'rainfall-data'})
            if table:
                rows = table.find_all('tr')
                for row in rows[1:]:  # Skip header row
                    cols = row.find_all('td')
                    if len(cols) >= 3:
                        rainfall_data['data'].append({
                            'station': cols[0].text.strip(),
                            'rainfall_mm': float(cols[1].text.strip() or 0),
                            'date': cols[2].text.strip()
                        })
            
            return rainfall_data
        except Exception as e:
            print(f'Error scraping IMD data: {str(e)}')
            return {'timestamp': datetime.now().isoformat(), 'data': []}
    
    async def scrape_bbmp_complaints(self) -> Dict[str, Any]:
        """Scrape urban complaints data from BBMP Sahaaya dashboard"""
        try:
            driver = self._get_driver()
            driver.get('http://bbmp.sahaaya.in')
            
            # Wait for table to load
            wait = WebDriverWait(driver, 10)
            table = wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'complaints-table')))
            
            # Extract complaint data
            complaints_data = {
                'timestamp': datetime.now().isoformat(),
                'data': []
            }
            
            rows = table.find_elements(By.TAG_NAME, 'tr')
            for row in rows[1:]:  # Skip header
                cols = row.find_elements(By.TAG_NAME, 'td')
                if len(cols) >= 4:
                    complaint = {
                        'id': cols[0].text.strip(),
                        'type': cols[1].text.strip(),
                        'ward': cols[2].text.strip(),
                        'status': cols[3].text.strip()
                    }
                    
                    # Geocode ward location
                    try:
                        location = self.geolocator.geocode(f'{complaint["ward"]}, Bangalore, Karnataka')
                        if location:
                            complaint['coordinates'] = {
                                'lat': location.latitude,
                                'lng': location.longitude
                            }
                    except GeocoderTimedOut:
                        pass
                    
                    complaints_data['data'].append(complaint)
            
            driver.quit()
            return complaints_data
        except Exception as e:
            print(f'Error scraping BBMP data: {str(e)}')
            if 'driver' in locals():
                driver.quit()
            return {'timestamp': datetime.now().isoformat(), 'data': []}
    
    def save_to_geojson(self, data: Dict[str, Any], filename: str):
        """Convert data to GeoJSON format and save to file"""
        features = []
        
        for item in data['data']:
            if 'coordinates' in item:
                feature = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [item['coordinates']['lng'], item['coordinates']['lat']]
                    },
                    'properties': {k: v for k, v in item.items() if k != 'coordinates'}
                }
                features.append(feature)
        
        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }
        
        with open(filename, 'w') as f:
            json.dump(geojson, f)

# Usage example:
# scraper = DataScraper()
# rainfall_data = await scraper.scrape_imd_rainfall()
# complaints_data = await scraper.scrape_bbmp_complaints()
# scraper.save_to_geojson(complaints_data, 'bbmp_complaints.geojson')