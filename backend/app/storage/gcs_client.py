from typing import List, Dict, Optional
from datetime import datetime
import logging
from google.cloud import storage
from google.cloud.exceptions import NotFound
from app.config import settings
from app.storage.storage_client import StorageClient

logger = logging.getLogger(__name__)

class GCSClient(StorageClient):
    def __init__(self):
        if settings.GOOGLE_APPLICATION_CREDENTIALS:
            self.client = storage.Client.from_service_account_json(
                settings.GOOGLE_APPLICATION_CREDENTIALS
            )
        else:
            # Try default credentials
            self.client = storage.Client()
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.bucket = self.client.bucket(self.bucket_name)
    
    async def upload_file(self, file_name: str, content: bytes) -> bool:
        """Upload a file to GCS bucket"""
        try:
            blob = self.bucket.blob(file_name)
            blob.upload_from_string(content, content_type="application/json")
            return True
        except Exception as e:
            logger.error(f"Failed to upload file '{file_name}' to GCS bucket '{self.bucket_name}': {str(e)}", exc_info=True)
            return False
    
    async def list_files(self) -> List[Dict]:
        """List all files in the bucket"""
        try:
            blobs = self.bucket.list_blobs()
            files = []
            for blob in blobs:
                files.append({
                    "name": blob.name,
                    "size": blob.size,
                    "created_at": blob.time_created.isoformat() if blob.time_created else None
                })
            return files
        except Exception as e:
            logger.error(f"Failed to list files from GCS bucket '{self.bucket_name}': {str(e)}", exc_info=True)
            return []
    
    async def get_file_content(self, file_name: str) -> Optional[bytes]:
        """Get file content from GCS bucket"""
        try:
            blob = self.bucket.blob(file_name)
            if not blob.exists():
                return None
            return blob.download_as_bytes()
        except NotFound:
            logger.info(f"File '{file_name}' not found in GCS bucket '{self.bucket_name}'")
            return None
        except Exception as e:
            logger.error(f"Failed to get file '{file_name}' from GCS bucket '{self.bucket_name}': {str(e)}", exc_info=True)
            return None

