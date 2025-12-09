from datetime import datetime, date
from typing import Tuple, Optional

def validate_coordinates(latitude: float, longitude: float) -> Tuple[bool, Optional[str]]:
    """Validate latitude and longitude ranges"""
    if not (-90 <= latitude <= 90):
        return False, "Latitude must be between -90 and 90"
    if not (-180 <= longitude <= 180):
        return False, "Longitude must be between -180 and 180"
    return True, None

def validate_date_range(start_date: str, end_date: str) -> Tuple[bool, Optional[str]]:
    """Validate date range format and constraints"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        today = date.today()
        
        # Check if dates are in the future
        if start > today:
            return False, f"Start date ({start_date}) cannot be in the future. Historical data only."
        if end > today:
            return False, f"End date ({end_date}) cannot be in the future. Historical data only."
        
        if start > end:
            return False, "start_date must be less than or equal to end_date"
        
        # Check if range is <= 31 days
        days_diff = (end - start).days
        if days_diff > 31:
            return False, "Date range must be 31 days or less"
        
        return True, None
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD"

def validate_weather_request(
    latitude: float, 
    longitude: float, 
    start_date: str, 
    end_date: str
) -> Tuple[bool, Optional[str]]:
    """Validate all weather request parameters"""
    # Validate coordinates
    valid_coords, coord_error = validate_coordinates(latitude, longitude)
    if not valid_coords:
        return False, coord_error
    
    # Validate dates
    valid_dates, date_error = validate_date_range(start_date, end_date)
    if not valid_dates:
        return False, date_error
    
    return True, None

