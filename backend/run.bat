@echo off
REM Windows batch file to run the FastAPI server without reload
REM This avoids multiprocessing issues on Windows

echo Starting FastAPI server on http://localhost:8000
echo.
echo Note: Auto-reload is disabled on Windows due to compatibility issues.
echo Manually restart the server after code changes.
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

pause

