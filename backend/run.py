import uvicorn
import sys

if __name__ == "__main__":
    # Always disable reload on Windows to avoid multiprocessing issues
    # Windows has known issues with uvicorn's reload feature
    # For development, manually restart the server after code changes
    # Or use: uvicorn app.main:app --host 0.0.0.0 --port 8000 (without --reload)
    
    reload_enabled = False
    if sys.platform != "win32":
        # Only enable reload on non-Windows systems
        reload_enabled = True
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=reload_enabled
    )

