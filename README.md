# 🌤️ Weather Explorer - Full Stack Application

<div align="center">

**A modern, full-stack weather data explorer application built with FastAPI and Next.js**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Frontend Features](#-frontend-features)
- [Running the Application](#-running-the-application)
- [Docker Deployment](#-docker-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Weather Explorer** is a comprehensive full-stack application that enables users to:

- 📡 **Fetch** historical weather data from the Open-Meteo API
- 💾 **Store** weather data in cloud storage (AWS S3 or Google Cloud Storage)
- 📊 **Visualize** weather trends with interactive charts and data tables
- 🔍 **Explore** stored weather files with advanced filtering and sorting

Built with modern technologies and best practices, featuring a responsive design that works seamlessly on desktop, tablet, and mobile devices.

---

## ✨ Features

### 🎨 Frontend Features

- **🌍 Interactive Input Panel**
  - Quick location buttons (Berlin, New York, Tokyo, London)
  - Real-time coordinate validation
  - Date range picker with "Last 7 days" shortcut
  - Beautiful gradient UI with glassmorphism effects
  - Loading states with animated spinners

- **📁 File Management**
  - Scrollable file list (shows 3 files initially)
  - Sort by: Newest, Oldest, or Name (A-Z)
  - File metadata display (size, creation date)
  - One-click file selection
  - Refresh functionality with loading overlay

- **📊 Data Visualization**
  - Interactive line charts (Recharts)
  - Temperature trends (Max/Min, Apparent Max/Min)
  - Premium statistics cards with gradients
  - Paginated data table (10/20/50 rows per page)
  - Custom tooltips with detailed information
  - Responsive chart heights

- **🎭 UI/UX Excellence**
  - Fully responsive design (mobile/tablet/desktop)
  - Vibrant gradient backgrounds with animated orbs
  - Smooth animations and transitions
  - Glassmorphism effects
  - Professional loading states
  - Error handling with user-friendly messages

### ⚙️ Backend Features

- **🔌 RESTful API**
  - FastAPI with automatic OpenAPI documentation
  - Async/await for high performance
  - Comprehensive input validation
  - Structured error responses

- **☁️ Cloud Storage Support**
  - Google Cloud Storage (GCS) integration
  - AWS S3 integration
  - Factory pattern for easy storage switching
  - File name sanitization

- **🛡️ Security & Validation**
  - Coordinate range validation (-90 to 90, -180 to 180)
  - Date range validation (max 31 days, no future dates)
  - File name sanitization
  - CORS configuration
  - Environment variable management

- **📝 Logging & Monitoring**
  - Structured logging with Python's logging module
  - Detailed error tracking
  - Request/response logging
  - Health check endpoint

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** 0.104.1 - Modern, fast web framework
- **Python** 3.9+ - Programming language
- **Uvicorn** - ASGI server
- **Pydantic** 2.5.0 - Data validation
- **httpx** 0.25.2 - Async HTTP client
- **Google Cloud Storage** / **AWS S3** - Cloud storage
- **python-dotenv** - Environment variable management

### Frontend
- **Next.js** 14.0.4 - React framework with App Router
- **TypeScript** 5.3.3 - Type safety
- **React** 18.2.0 - UI library
- **Tailwind CSS** 3.4.0 - Utility-first CSS
- **Recharts** 2.10.3 - Charting library
- **Axios** 1.6.2 - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.9 or higher
- **Node.js** 18 or higher and **npm**
- **Docker** and **Docker Compose** (optional, for containerized deployment)
- **Cloud Storage Account**:
  - Google Cloud Storage bucket, OR
  - AWS S3 bucket

### Cloud Storage Setup

#### Option 1: Google Cloud Storage (GCS)

1. Create a GCS bucket in Google Cloud Console
2. Create a service account with Storage Admin role
3. Download the service account JSON key file

#### Option 2: AWS S3

1. Create an S3 bucket in AWS Console
2. Create an IAM user with S3 access permissions
3. Generate Access Key ID and Secret Access Key

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inriskfullstackdeveloper
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Configure Environment Variables

#### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Storage Configuration (choose one: 'gcs' or 's3')
STORAGE_TYPE=gcs

# For Google Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# For AWS S3 (alternative)
# STORAGE_TYPE=s3
# AWS_ACCESS_KEY_ID=your-access-key-id
# AWS_SECRET_ACCESS_KEY=your-secret-access-key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your-bucket-name

# CORS Configuration (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Open-Meteo API (no API key required)
OPEN_METEO_BASE_URL=https://archive-api.open-meteo.com/v1/archive
```

#### Frontend Configuration

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 5. Run the Application

#### Start Backend

```bash
cd backend
python run.py
```

The API will be available at:
- **API**: `http://localhost:8000`
- **Docs**: `http://localhost:8000/docs`
- **Health**: `http://localhost:8000/health`

#### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at:
- **Application**: `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `STORAGE_TYPE` | Storage provider: `gcs` or `s3` | Yes | - |
| `GCS_BUCKET_NAME` | GCS bucket name | If using GCS | - |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCS service account JSON | If using GCS | - |
| `AWS_ACCESS_KEY_ID` | AWS access key | If using S3 | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | If using S3 | - |
| `AWS_REGION` | AWS region | If using S3 | - |
| `S3_BUCKET_NAME` | S3 bucket name | If using S3 | - |
| `CORS_ORIGINS` | Comma-separated allowed origins | Yes | - |
| `OPEN_METEO_BASE_URL` | Open-Meteo API URL | No | `https://archive-api.open-meteo.com/v1/archive` |

#### Frontend (`.env.local`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `http://localhost:8000/api` |

---

## 📁 Project Structure

```
inriskfullstackdeveloper/
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration & settings
│   │   ├── routes/              # API routes
│   │   │   ├── __init__.py
│   │   │   └── weather.py       # Weather API endpoints
│   │   ├── services/            # Business logic
│   │   │   ├── __init__.py
│   │   │   └── weather_service.py  # Open-Meteo API client
│   │   ├── storage/             # Cloud storage clients
│   │   │   ├── __init__.py
│   │   │   ├── storage_client.py   # Abstract storage interface
│   │   │   ├── gcs_client.py      # Google Cloud Storage
│   │   │   └── s3_client.py        # AWS S3
│   │   └── utils/               # Utilities
│   │       ├── __init__.py
│   │       └── validation.py    # Input validation
│   ├── Dockerfile               # Backend Docker image
│   ├── requirements.txt        # Python dependencies
│   ├── run.py                  # Development server
│   └── run.bat                 # Windows run script
│
├── frontend/                    # Next.js Frontend
│   ├── app/
│   │   ├── globals.css         # Global styles & animations
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main dashboard page
│   ├── components/
│   │   ├── WeatherInputPanel.tsx    # Input form component
│   │   ├── WeatherFileList.tsx      # File list component
│   │   └── WeatherVisualization.tsx # Chart & table component
│   ├── lib/
│   │   └── api.ts              # API client & error handling
│   ├── Dockerfile              # Frontend Docker image
│   ├── package.json            # Node.js dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── next.config.js          # Next.js configuration
│
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # This file
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Interactive API Docs

FastAPI provides automatic interactive documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Endpoints

#### `POST /api/store-weather-data`

Fetch weather data from Open-Meteo API and store it in cloud storage.

**Request Body:**
```json
{
  "latitude": 52.52,
  "longitude": 13.41,
  "start_date": "2024-12-01",
  "end_date": "2024-12-07"
}
```

**Validation:**
- `latitude`: -90 to 90
- `longitude`: -180 to 180
- `start_date`: YYYY-MM-DD format, not in future
- `end_date`: YYYY-MM-DD format, not in future
- Date range: ≤ 31 days
- `start_date` ≤ `end_date`

**Success Response (200):**
```json
{
  "status": "ok",
  "file": "weather_52.52_13.41_2024-12-01_2024-12-07_20241209_123456.json"
}
```

**Error Response (400):**
```json
{
  "detail": {
    "status": "error",
    "message": "Date range must be 31 days or less"
  }
}
```

#### `GET /api/list-weather-files`

List all weather files stored in cloud storage.

**Response (200):**
```json
{
  "files": [
    {
      "name": "weather_52.52_13.41_2024-12-01_2024-12-07_20241209_123456.json",
      "size": 1234,
      "created_at": "2024-12-09T12:34:56.789Z"
    }
  ]
}
```

#### `GET /api/weather-file-content/{file_name}`

Retrieve the content of a specific weather file.

**Path Parameters:**
- `file_name`: The name of the file (URL encoded)

**Response (200):**
```json
{
  "latitude": 52.52,
  "longitude": 13.41,
  "daily": {
    "time": ["2024-12-01", "2024-12-02", ...],
    "temperature_2m_max": [5.2, 6.1, ...],
    "temperature_2m_min": [1.3, 2.0, ...],
    "apparent_temperature_max": [4.8, 5.7, ...],
    "apparent_temperature_min": [0.9, 1.6, ...]
  }
}
```

**Error Response (404):**
```json
{
  "detail": {
    "status": "error",
    "message": "File 'filename.json' not found in storage"
  }
}
```

#### `GET /health`

Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy"
}
```

---

## 🎨 Frontend Features

### Input Panel

- **Quick Location Buttons**: One-click selection for popular cities
- **Coordinate Inputs**: Latitude and longitude with validation
- **Date Range Picker**: Start and end date selection
- **Last 7 Days Shortcut**: Quick date range selection
- **Real-time Validation**: Immediate feedback on input errors
- **Loading States**: Animated spinner during data fetch
- **Success/Error Messages**: Clear feedback with auto-dismiss

### File List

- **Scrollable Container**: Shows 3 files initially, scrollable for more
- **Sort Options**: Sort by newest, oldest, or name (A-Z)
- **File Metadata**: Display file size and creation date
- **File Selection**: Click to view file content
- **Refresh Button**: Update file list with loading overlay
- **Statistics Card**: Total files and total size display
- **Empty State**: Helpful message when no files exist

### Visualization

- **Interactive Line Chart**: 
  - Max/Min Temperature lines
  - Apparent Max/Min Temperature lines (dashed)
  - Custom tooltips with detailed information
  - Responsive height (mobile/tablet/desktop)
  
- **Statistics Cards**:
  - Highest temperature
  - Average maximum temperature
  - Average minimum temperature
  - Lowest temperature
  
- **Data Table**:
  - Paginated display (10/20/50 rows per page)
  - Previous/Next navigation
  - Row count display
  - Responsive design with horizontal scroll on mobile

---

## 🏃 Running the Application

### Development Mode

#### Backend (Terminal 1)

```bash
cd backend
python run.py
```

**Note for Windows Users**: The `run.py` script automatically disables reload to avoid multiprocessing issues. For manual restart, use:

```bash
python run.py
# Or
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

### Production Mode

#### Backend

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Frontend

```bash
cd frontend
npm run build
npm start
```

---

## 🐳 Docker Deployment

### Using Docker Compose

1. **Configure environment variables** in `.env` files (see Configuration section)

2. **Build and start services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

### Individual Docker Containers

#### Backend

```bash
cd backend
docker build -t weather-backend .
docker run -p 8000:8000 --env-file .env weather-backend
```

#### Frontend

```bash
cd frontend
docker build -t weather-frontend .
docker run -p 3000:3000 --env-file .env.local weather-frontend
```

---

## 🔧 Troubleshooting

### Backend Issues

#### Import Errors
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows
```

#### Storage Connection Errors
- Verify bucket name is correct
- Check credentials file path (GCS) or access keys (S3)
- Ensure bucket exists and has proper permissions
- For GCS: Verify service account has Storage Admin role
- For S3: Verify IAM user has S3 read/write permissions

#### CORS Errors
- Check `CORS_ORIGINS` in `.env` includes your frontend URL
- Ensure no trailing slashes in CORS origins
- Restart backend after changing CORS settings

#### Port Already in Use
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000
# macOS/Linux:
lsof -i :8000

# Kill the process or use a different port
```

### Frontend Issues

#### API Connection Errors
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on the specified port
- Check browser console for CORS errors
- Verify backend CORS configuration

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Chart Not Rendering
- Check browser console for errors
- Verify data format matches expected structure
- Ensure Recharts is properly installed

### Common Solutions

1. **Clear caches:**
   ```bash
   # Backend
   rm -rf backend/__pycache__ backend/**/__pycache__
   
   # Frontend
   rm -rf frontend/.next frontend/node_modules/.cache
   ```

2. **Reinstall dependencies:**
   ```bash
   # Backend
   pip install -r requirements.txt --force-reinstall
   
   # Frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check logs:**
   - Backend: Check terminal output for error messages
   - Frontend: Check browser console (F12) for errors

---

## 🧪 Testing

### Manual Testing

1. **Test Backend API:**
   - Visit `http://localhost:8000/docs`
   - Use Swagger UI to test all endpoints
   - Verify responses and error handling

2. **Test Frontend:**
   - Open `http://localhost:3000`
   - Test weather data fetching with different locations
   - Verify file listing and visualization
   - Test responsive design on different screen sizes

### Example Test Data

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Berlin, Germany | 52.52 | 13.41 |
| New York, USA | 40.71 | -74.01 |
| Tokyo, Japan | 35.68 | 139.69 |
| London, UK | 51.51 | -0.13 |

---

## 🚢 Deployment

### Backend Deployment (GCP Cloud Run)

1. **Build Docker image:**
   ```bash
   cd backend
   docker build -t gcr.io/PROJECT_ID/weather-api .
   ```

2. **Push to Google Container Registry:**
   ```bash
   docker push gcr.io/PROJECT_ID/weather-api
   ```

3. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy weather-api \
     --image gcr.io/PROJECT_ID/weather-api \
     --platform managed \
     --region us-central1 \
     --set-env-vars STORAGE_TYPE=gcs,GCS_BUCKET_NAME=your-bucket
   ```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL

### Alternative: Self-Hosted

1. **Backend**: Deploy to any server supporting Python/Docker
2. **Frontend**: Build static files and serve with Nginx/Apache

---

## 🔒 Security Considerations

- ✅ Environment variables for sensitive credentials
- ✅ Input validation on all endpoints
- ✅ CORS configuration for frontend access
- ✅ File name sanitization
- ✅ Error messages don't expose internal details
- ✅ Request timeout handling (30 seconds)
- ✅ Proper error logging without exposing secrets

---

## 📝 Design Decisions

1. **Modular Architecture**: Separated concerns (routes, services, storage)
2. **Storage Abstraction**: Factory pattern for easy GCS/S3 switching
3. **Type Safety**: TypeScript in frontend, Pydantic models in backend
4. **Responsive Design**: Mobile-first approach with Tailwind CSS
5. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
6. **Request Cancellation**: Prevents memory leaks and race conditions
7. **Logging**: Structured logging for better debugging and monitoring
8. **Validation**: Client and server-side validation for data integrity

---

## 🎯 Key Improvements Implemented

- ✅ **Proper Logging**: Replaced all `print()` with structured logging
- ✅ **File Name Sanitization**: Handles special characters safely
- ✅ **Future Date Validation**: Prevents invalid date ranges
- ✅ **Enhanced Error Messages**: More descriptive and user-friendly
- ✅ **Request Cancellation**: Prevents memory leaks on component unmount
- ✅ **Request Timeout**: 30-second timeout for all API calls
- ✅ **Consistent Error Handling**: Unified error extraction and display
- ✅ **Enhanced Loading States**: Beautiful, animated loading indicators
- ✅ **Responsive Design**: Optimized for all screen sizes
- ✅ **Accessibility**: ARIA labels and semantic HTML

---

## 📄 License

This project is created for **InRisk Labs** case study.

---

## 👤 Author

Built for **InRisk Labs** Full Stack Developer position.

---

## 🙏 Acknowledgments

- **Open-Meteo** - Free weather API (no API key required)
- **FastAPI** - Modern Python web framework
- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review API documentation at `http://localhost:8000/docs`
3. Check browser console and backend logs for errors

---

<div align="center">

**Made with ❤️ for InRisk Labs**

⭐ Star this repo if you find it helpful!

</div>
