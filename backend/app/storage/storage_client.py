from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime
from app.config import settings

class StorageClient(ABC):
    @abstractmethod
    async def upload_file(self, file_name: str, content: bytes) -> bool:
        pass
    
    @abstractmethod
    async def list_files(self) -> List[Dict]:
        pass
    
    @abstractmethod
    async def get_file_content(self, file_name: str) -> Optional[bytes]:
        pass

def get_storage_client() -> StorageClient:
    """Factory function to get the appropriate storage client"""
    # Import here to avoid circular import
    if settings.STORAGE_TYPE.lower() == "gcs":
        from app.storage.gcs_client import GCSClient
        return GCSClient()
    elif settings.STORAGE_TYPE.lower() == "s3":
        from app.storage.s3_client import S3Client
        return S3Client()
    else:
        raise ValueError(f"Unsupported storage type: {settings.STORAGE_TYPE}")

