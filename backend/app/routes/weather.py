from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import json
import logging

from app.services.weather_service import WeatherService
from app.storage.storage_client import get_storage_client
from app.utils.validation import validate_weather_request

router = APIRouter()
logger = logging.getLogger(__name__)

class WeatherRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude between -180 and 180")
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")

class WeatherResponse(BaseModel):
    status: str
    file: Optional[str] = None
    message: Optional[str] = None

class FileInfo(BaseModel):
    name: str
    size: int
    created_at: Optional[str] = None

class FileListResponse(BaseModel):
    files: list[FileInfo]

@router.post("/store-weather-data", response_model=WeatherResponse)
async def store_weather_data(request: WeatherRequest):
    """
    Fetch weather data from Open-Meteo API and store it in cloud storage
    """
    # Validate inputs
    is_valid, error_message = validate_weather_request(
        request.latitude,
        request.longitude,
        request.start_date,
        request.end_date
    )
    
    if not is_valid:
        logger.warning(f"Invalid weather request: lat={request.latitude}, lon={request.longitude}, dates={request.start_date} to {request.end_date}, error={error_message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"status": "error", "message": error_message}
        )
    
    try:
        # Fetch weather data
        weather_service = WeatherService()
        weather_data = await weather_service.fetch_weather_data(
            request.latitude,
            request.longitude,
            request.start_date,
            request.end_date
        )
        
        # Generate and sanitize file name
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_name = f"weather_{request.latitude}_{request.longitude}_{request.start_date}_{request.end_date}_{timestamp}.json"
        # Sanitize file name to handle special characters
        file_name = file_name.replace('/', '_').replace('\\', '_').replace(' ', '_')
        
        # Store in cloud storage
        storage_client = get_storage_client()
        json_content = json.dumps(weather_data, indent=2).encode('utf-8')
        logger.info(f"Storing weather data to file: {file_name} ({len(json_content)} bytes)")
        success = await storage_client.upload_file(file_name, json_content)
        
        if not success:
            logger.error(f"Failed to store file '{file_name}' in cloud storage")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"status": "error", "message": f"Failed to store file '{file_name}' in cloud storage. Please check storage configuration."}
            )
        
        logger.info(f"Successfully stored weather data to file: {file_name}")
        return WeatherResponse(status="ok", file=file_name)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in store_weather_data: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Internal server error: {str(e)}"}
        )

@router.get("/list-weather-files", response_model=FileListResponse)
async def list_weather_files():
    """
    List all weather files stored in cloud storage
    """
    try:
        logger.info("Listing weather files from cloud storage")
        storage_client = get_storage_client()
        files = await storage_client.list_files()
        
        # Filter only weather files (optional, or return all)
        file_list = [
            FileInfo(
                name=file["name"],
                size=file["size"],
                created_at=file.get("created_at")
            )
            for file in files
        ]
        
        logger.info(f"Successfully listed {len(file_list)} files")
        return FileListResponse(files=file_list)
    
    except Exception as e:
        logger.error(f"Error listing weather files: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Failed to list files: {str(e)}"}
        )

@router.get("/weather-file-content/{file_name:path}")
async def get_weather_file_content(file_name: str):
    """
    Get the content of a specific weather file from cloud storage
    """
    try:
        logger.info(f"Fetching content for file: {file_name}")
        storage_client = get_storage_client()
        content = await storage_client.get_file_content(file_name)
        
        if content is None:
            logger.warning(f"File not found: {file_name}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"status": "error", "message": f"File '{file_name}' not found in storage"}
            )
        
        # Parse and return JSON
        json_data = json.loads(content.decode('utf-8'))
        logger.info(f"Successfully retrieved content for file: {file_name} ({len(content)} bytes)")
        return json_data
    
    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in file '{file_name}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Invalid JSON format in file '{file_name}': {str(e)}"}
        )
    except Exception as e:
        logger.error(f"Error getting file content for '{file_name}': {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Failed to retrieve file '{file_name}': {str(e)}"}
        )

