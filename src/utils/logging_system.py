import logging
from pathlib import Path
from datetime import datetime

def setup_logger(name="flood_prediction", log_dir="logs"):
    """Setup logging system for flood prediction backend."""
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    log_file = log_path / f"flood_prediction_{datetime.now().strftime('%Y%m%d')}.log"
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if logger.handlers:
        return logger
    
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

def log_api_request(logger, endpoint, params):
    """Log API request details."""
    logger.info(f"API Request - Endpoint: {endpoint}, Params: {params}")

def log_prediction(logger, result):
    """Log prediction results."""
    logger.info(f"Prediction Result: {result}")

def log_error(logger, error):
    """Log system errors."""
    logger.error(f"Error: {str(error)}", exc_info=True)
