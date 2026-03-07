# 🌊 AI Flood Early Warning System - Integrated Documentation

## Project Overview

This is a **comprehensive flood early warning system** for Karnataka that combines **traditional ML** and **AI-based predictions** with real-time monitoring, geospatial visualization, and multi-channel alerting.

### Key Features

✅ **Dual Prediction Models**
- Traditional ML (Scikit-learn) based on terrain, weather, and hydrology
- AI XGBoost Model for district-level predictions

✅ **Real-Time Monitoring** (5-minute intervals)
- Live rainfall forecasts via Open-Meteo API
- River water level tracking
- Automated continuous monitoring loop

✅ **Multi-Channel Alerts**
- Dashboard alerts (Streamlit)
- Console warnings
- Telegram notifications
- SMS alerts (Twilio)

✅ **Geospatial Visualization**
- Interactive Folium maps with district risk coloring
- Water bodies and river network mapping
- Evacuation route planning using road networks

✅ **REST API**
- FastAPI backend with comprehensive endpoints
- Traditional and AI prediction endpoints
- Live status and alert endpoints
- Health checks and system monitoring

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Data Collection Layer                   │
│  (Open-Meteo API, River Monitors, Geospatial Data)     │
└────────────┬──────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              Processing & Analysis Layer                │
│  ├─ Live Monitor (rainfall forecasting)                │
│  ├─ River Monitor (water level tracking)              │
│  ├─ AI Prediction Model (XGBoost)                     │
│  └─ Traditional Model (Scikit-learn)                  │
└────────────┬──────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│            Output & Notification Layer                  │
│  ├─ Rest API (FastAPI)                                │
│  ├─ Dashboard (Streamlit)                            │
│  ├─ Alerts (Telegram, SMS, Console)                  │
│  └─ Maps (Folium HTML)                               │
└─────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
Tenets/
│
├── src/
│   ├── monitoring/              # Real-time monitoring scripts
│   │   ├── live_monitor.py         (Weather API integration)
│   │   ├── river_monitor.py        (River water levels)
│   │   └── auto_monitor.py         (Main orchestration loop)
│   │
│   ├── models/                  # ML models and training
│   │   ├── ai_predict.py           (AI predictions engine)
│   │   ├── train_ai_model.py       (Model training)
│   │   ├── create_training_data.py (Synthetic data generation)
│   │   └── predict.py              (Original prediction)
│   │
│   ├── api/                     # REST API endpoints
│   │   ├── main.py                 (FastAPI app)
│   │   ├── routes.py               (API routes)
│   │   └── schema.py               (Pydantic schemas)
│   │
│   ├── visualization/           # Mapping & visualization
│   │   ├── live_map.py            (Folium map generation)
│   │   ├── evacuation_routes.py   (Route planning)
│   │   └── load_waterbodies.py    (GeoJSON loading)
│   │
│   ├── alerts/                  # Alerting systems
│   │   ├── alert_system.py        (Console alerts)
│   │   ├── telegram_alert.py      (Telegram notifications)
│   │   └── twilio_alert.py        (SMS alerts)
│   │
│   ├── data/                    # Data pipeline
│   │   └── [Data processing utilities]
│   │
│   └── utils/                   # Utilities
│       └── [Logging, config, helpers]
│
├── models/
│   ├── flood_xgb_model.pkl        (XGBoost AI model)
│   ├── flood_model.pkl            (Traditional ML model)
│   └── scaler.pkl                 (Feature scaler)
│
├── data/
│   ├── ai_flood_predictions.csv        (Latest predictions)
│   ├── ai_training_data.csv            (Training dataset)
│   ├── live_flood_status.csv           (Current status)
│   ├── river_alerts.csv                (River alerts)
│   ├── karnataka_rivers.csv            (River metadata)
│   ├── karnataka_waterbodies.geojson  (Water bodies map)
│   ├── india_districts.geojson        (District boundaries)
│   ├── raw/                            (Original datasets)
│   ├── processed/                      (Processed datasets)
│   └── external/                       (External datasets)
│
├── frontend/
│   ├── integrated_dashboard.py         (Main Streamlit dashboard)
│   ├── streamlit_with_alerts.py        (Alt: Dashboard with alerts)
│   └── streamlit_with_map.py           (Alt: Dashboard with map)
│
├── backend/
│   └── api.py                         (Original FastAPI)
│
├── scripts/
│   ├── start_api.py                   (Start API server)
│   ├── run_training.py                (Train models)
│   └── start_dashboard.bat            (Launch dashboard)
│
├── config/
│   ├── config.py                      (Main config)
│   └── .env.example                   (Environment template)
│
├── tests/
│   ├── test_api.py
│   ├── test_model.py
│   └── alerts_page.py
│
├── requirements.txt                  (Python dependencies)
├── .env                              (Environment variables)
└── README.md                         (This file)
```

---

## Getting Started

### 1. Installation

```bash
# Clone repository
git clone <repository-url>
cd Tenets

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

Create `.env` file:

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Twilio SMS Alert (optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE=your_phone_number

# Data paths
DATA_DIR=./data
MODELS_DIR=./models
```

### 3. Initialize Models & Data

### 3.1 Standalone Alert Script

The script `src/alerts/flood_message.py` can be executed directly to run a single
prediction and push a Telegram message when the risk is High.  It is primarily a
convenience wrapper around the same model and alert logic used by the API.

```bash
python -m src.alerts.flood_message 10 50 30 100 5 2 12.0 77.0
```

Arguments are the same six hydrometeorological features followed optionally by
latitude and longitude for the current location (a safe location link will be
included in the alert).


### 3. Initialize Models & Data

```bash
# Create training data
python src/models/create_training_data.py

# Train AI model
python src/models/train_ai_model.py

# Generate initial predictions
python src/models/ai_predict.py

# Create map
python src/visualization/live_map.py
```

### 4. Start Monitoring & API

**Option A: Terminal Windows (Recommended for testing)**

```bash
# Terminal 1: Start API server
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start auto-monitoring loop
python src/monitoring/auto_monitor.py

# Terminal 3: Start Streamlit dashboard
streamlit run frontend/integrated_dashboard.py
```

**Option B: Background Process (Production)**

```bash
# Run auto-monitor in background
python src/monitoring/auto_monitor.py &

# Run API server with uvicorn
uvicorn src.api.main:app --host 0.0.0.0 --port 8000

# In another terminal, run Streamlit
streamlit run frontend/integrated_dashboard.py
```

---

## API Documentation

### Base URL
```
http://localhost:8000
```

### Key Endpoints

#### 1. Traditional Flood Prediction
```
POST /api/v1/predict

Request:
{
  "rainfall_3hr": 25.0,
  "rainfall_24hr": 75.0,
  "soil_moisture": 60,
  "elevation": 500.0,
  "slope": 15,
  "river_proximity": 5.0
}

Response:
{
  "risk_level": "MEDIUM",
  "risk_score": 0.52
}
```

#### 2. AI District Prediction
```
POST /api/v1/predict-district

Request:
{
  "district": "Bengaluru",
  "rainfall_24h_mm": 75.0,
  "river_risk": 0.6,
  "area": 1.0
}

Response:
{
  "district": "Bengaluru",
  "rainfall_24h_mm": 75.0,
  "river_risk": 0.6,
  "flood_probability": 0.45,
  "risk_level": "MEDIUM"
}
```

#### 3. Get All Predictions
```
GET /api/v1/predictions/all

Response:
{
  "timestamp": "2024-03-06T10:30:00",
  "total_districts": 30,
  "predictions": [...],
  "high_risk_districts": ["Uttara Kannada", "Kodagu"]
}
```

#### 4. Live Flood Status
```
GET /api/v1/status/live

Response:
{
  "timestamp": "2024-03-06T10:30:00",
  "districts": [...],
  "high_risk_count": 2,
  "medium_risk_count": 8,
  "low_risk_count": 20
}
```

#### 5. River Alerts
```
GET /api/v1/alerts/river

Response:
{
  "timestamp": "2024-03-06T10:30:00",
  "alerts": [...],
  "high_alerts_count": 1
}
```

#### 6. System Health
```
GET /api/v1/health

Response:
{
  "status": "healthy",
  "model_loaded_traditional": true,
  "model_loaded_ai": true,
  "data_available": true,
  "timestamp": "2024-03-06T10:30:00"
}
```

### Interactive API Docs
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Dashboard Usage

1. **Open Dashboard**
   ```bash
   streamlit run frontend/integrated_dashboard.py
   ```

2. **Access URL**
   - Browser opens automatically (usually `http://localhost:8501`)

3. **Available Tabs**
   - 🎯 **AI Predictions**: District-level predictions with filtering
   - ⚠️ **Live Alerts**: Active flood and river alerts
   - 🗺️ **Flood Map**: Interactive risk visualization
   - 🔬 **Traditional Prediction**: Manual prediction input
   - 📊 **Analytics**: Performance charts and trends

---

## Monitoring System

### Auto-Monitor Loop (src/monitoring/auto_monitor.py)

Runs continuously every 5 minutes:

1. **Live Monitor** - Fetches rainfall forecasts
2. **River Monitor** - Checks water levels
3. **AI Predictions** - Generates predictions
4. **Map Generation** - Updates flood map
5. **Alerts** - Sends notifications if HIGH risk detected
6. **Logging** - Records all activities

### Running Auto-Monitor

```bash
# Run indefinitely
python src/monitoring/auto_monitor.py

# Check logs in logs/ directory
tail -f logs/flood_system.log
```

---

## Model Information

### AI Model (XGBoost)

**File**: `models/flood_xgb_model.pkl`

**Training Features**:
- Rainfall 24-hour forecast (mm)
- River risk factor (0-1)
- Area factor (terrain)

**Output**:
- Flood probability (0-1)
- Risk classification (LOW/MEDIUM/HIGH)

**Training Process**:
```bash
python src/models/train_ai_model.py
```

### Traditional Model (Scikit-learn)

**File**: `models/flood_model.pkl`

**Training Features**:
- 3-hour rainfall (mm)
- 24-hour rainfall (mm)
- Soil moisture (%)
- Elevation (m)
- Slope (degrees)
- River proximity (km)

---

## Data Files

All data is automatically generated and maintained:

| File | Source | Update Frequency | Purpose |
|------|--------|------------------|---------|
| `ai_flood_predictions.csv` | AI Model | Every 5 min | District predictions |
| `live_flood_status.csv` | Weather API | Every 5 min | Current rainfall |
| `river_alerts.csv` | River Monitor | Every 5 min | Water level status |
| `india_districts.geojson` | Static | One-time | Geographic boundaries |
| `karnataka_waterbodies.geojson` | Static | One-time | Water bodies |
| `karnataka_rivers.csv` | Static | One-time | River metadata |

---

## Troubleshooting

### Issue: API won't start
```bash
# Check if port 8000 is in use
netstat -tuln | grep 8000

# Use different port
uvicorn src.api.main:app --port 8001
```

### Issue: Models not loading
```bash
# Verify model files exist
ls models/

# Retrain models
python src/models/create_training_data.py
python src/models/train_ai_model.py
```

### Issue: Dashboard not updating
```bash
# Check data files
ls -la data/*.csv

# Rerun monitoring
python src/models/ai_predict.py
python src/visualization/live_map.py
```

### Issue: Alerts not sending
```bash
# Check .env file for credentials
cat .env

# Test Telegram alert
python -c "from src.alerts.telegram_alert import send_telegram_alert; send_telegram_alert('Test')"
```

---

## Performance Notes

- **API Response Time**: < 200ms per prediction
- **Monitor Cycle**: 5 minutes (configurable)  
- **Dashboard Refresh**: Near real-time (< 1s)
- **Model Training**: ~30 seconds for 5K samples
- **Map Generation**: ~10-15 seconds

---

## Integration Points

### Adding New Predictions
1. Create feature in `src/data/`
2. Add to training pipeline
3. Retrain model `train_ai_model.py`
4. Predictions auto-included in next cycle

### Adding New Alerts
1. Create alert function in `src/alerts/`
2. Call from `auto_monitor.py`
3. Add to dashboard alerts section

### Adding Data Sources
1. Add data fetching to `src/monitoring/`
2. Process in `src/data/`
3. Include in training pipeline

---

## Development Tips

### Adding Feature
1. Add new column to CSV
2. Update schema in `src/api/schema.py`
3. Update route handler in `src/api/routes.py`
4. Test via API docs or dashboard

### Debugging
```python
# Enable verbose logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Test individual components
from src.models.ai_predict import predict_all_districts
predictions = predict_all_districts()
print(predictions)
```

---

## Production Deployment

### Using Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Using Systemd Service

```ini
[Unit]
Description=Flood Prediction API
After=network.target

[Service]
Type=simple
User=flood-user
WorkingDirectory=/opt/flood-system
ExecStart=/opt/flood-system/venv/bin/python -m uvicorn src.api.main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## License & Attribution

This system integrates:
- XGBoost ML predictions
- Folium map visualization
- Streamlit dashboard interface
- FastAPI REST framework
- Open-Meteo weather data

---

## Support & Contact

For issues, bugs, or feature requests: Create an issue in the GitHub repository.

**Last Updated**: March 6, 2024
**Status**: Production Ready
