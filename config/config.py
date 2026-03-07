import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent.parent

API_CONFIG = {
    'host': os.getenv('API_HOST', 'localhost'),
    'port': int(os.getenv('API_PORT', 8000))
}

TWILIO_CONFIG = {
    'account_sid': os.getenv('TWILIO_ACCOUNT_SID'),
    'auth_token': os.getenv('TWILIO_AUTH_TOKEN'),
    'phone_number': os.getenv('TWILIO_PHONE_NUMBER')
}

MODEL_PATH = BASE_DIR / 'models' / 'flood_model.pkl'
LOG_DIR = BASE_DIR / 'logs'

RISK_THRESHOLDS = {
    'low': 0.33,
    'medium': 0.66
}

# alerting configuration loaded from environment variables
TELEGRAM_CONFIG = {
    # allow either TELEGRAM_TOKEN or TELEGRAM_BOT_TOKEN for historical reasons
    'token': os.getenv('TELEGRAM_TOKEN') or os.getenv('TELEGRAM_BOT_TOKEN'),
    'chat_id': os.getenv('TELEGRAM_CHAT_ID')
}

# safe place coordinates (fallbacks can be overridden via env)
SAFE_LOCATION = {
    'latitude': os.getenv('SAFE_LATITUDE', '12.9716'),  # default to Bangalore center
    'longitude': os.getenv('SAFE_LONGITUDE', '77.5946'),
    'name': os.getenv('SAFE_PLACE_NAME', 'Central Safe Zone')
}
