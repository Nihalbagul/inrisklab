from typing import List, Dict, Optional
from datetime import datetime
import boto3
import logging
from botocore.exceptions import ClientError
from app.config import settings
from app.storage.storage_client import StorageClient

logger = logging.getLogger(__name__)

class S3Client(StorageClient):
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
    
    async def upload_file(self, file_name: str, content: bytes) -> bool:
        """Upload a file to S3 bucket"""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=content,
                ContentType="application/json"
            )
            return True
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            logger.error(f"Failed to upload file '{file_name}' to S3 bucket '{self.bucket_name}': {error_code} - {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error uploading file '{file_name}' to S3: {str(e)}", exc_info=True)
            return False
    
    async def list_files(self) -> List[Dict]:
        """List all files in the bucket"""
        try:
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        "name": obj['Key'],
                        "size": obj['Size'],
                        "created_at": obj['LastModified'].isoformat() if 'LastModified' in obj else None
                    })
            return files
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            logger.error(f"Failed to list files from S3 bucket '{self.bucket_name}': {error_code} - {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error listing files from S3 bucket '{self.bucket_name}': {str(e)}", exc_info=True)
            return []
    
    async def get_file_content(self, file_name: str) -> Optional[bytes]:
        """Get file content from S3 bucket"""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=file_name
            )
            return response['Body'].read()
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            if error_code == 'NoSuchKey':
                logger.info(f"File '{file_name}' not found in S3 bucket '{self.bucket_name}'")
                return None
            logger.error(f"Failed to get file '{file_name}' from S3 bucket '{self.bucket_name}': {error_code} - {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting file '{file_name}' from S3: {str(e)}", exc_info=True)
            return None

