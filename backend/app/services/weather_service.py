import httpx
import json
import logging
from datetime import datetime
from typing import Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.base_url = settings.OPEN_METEO_BASE_URL
    
    async def fetch_weather_data(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: str, 
        end_date: str
    ) -> Dict[str, Any]:
        """
        Fetch historical weather data from Open-Meteo API
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily": [
                "temperature_2m_max",
                "temperature_2m_min",
                "apparent_temperature_max",
                "apparent_temperature_min"
            ],
            "timezone": "auto"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                logger.info(f"Fetching weather data for lat={latitude}, lon={longitude}, dates={start_date} to {end_date}")
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                logger.info(f"Successfully fetched weather data: {len(data.get('daily', {}).get('time', []))} days")
                return data
            except httpx.HTTPStatusError as e:
                logger.error(f"Open-Meteo API returned error {e.response.status_code} for lat={latitude}, lon={longitude}: {e.response.text}")
                raise Exception(f"Open-Meteo API error: {e.response.status_code} - {e.response.text[:100]}")
            except httpx.TimeoutException:
                logger.error(f"Timeout while fetching weather data from Open-Meteo API for lat={latitude}, lon={longitude}")
                raise Exception("Request timeout: Open-Meteo API did not respond in time")
            except Exception as e:
                logger.error(f"Failed to fetch weather data for lat={latitude}, lon={longitude}: {str(e)}", exc_info=True)
                raise Exception(f"Failed to fetch weather data: {str(e)}")

