import uvicorn
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

if __name__ == "__main__":
    uvicorn.run(
        "backend.api_with_logging:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
