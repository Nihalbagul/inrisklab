"""
Vercel serverless function entry point for FastAPI
This file is required for Vercel to deploy FastAPI as a serverless function.
"""
from mangum import Mangum
from app.main import app

# Create Mangum handler for Vercel serverless functions
# Mangum is an ASGI-to-AWS-Lambda/Vercel adapter
handler = Mangum(app, lifespan="off")

