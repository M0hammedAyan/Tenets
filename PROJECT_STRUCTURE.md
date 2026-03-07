# AI Flood Early Warning System - Integrated Project Structure

## Overview

This is a comprehensive flood early warning system combining **traditional ML** and **AI-based predictions** with real-time monitoring, geospatial visualization, and multi-channel alerting for Karnataka.

---

## Complete Directory Structure

```
Tenets/
│
├── src/
│   ├── monitoring/                          # Real-time monitoring engine
│   │   ├── live_monitor.py                     (Weather API + rainfall forecasts)
│   │   ├── river_monitor.py                    (River water level tracking)
│   │   └── auto_monitor.py                     (Main orchestration - 5min cycles)
│   │
│   ├── models/                              # ML models and training
│   │   ├── ai_predict.py                       (AI predictions engine)
│   │   ├── train_ai_model.py                   (XGBoost model training)
│   │   ├── create_training_data.py             (Synthetic data generation)
│   │   ├── predict.py                          (Traditional predictions)
│   │   ├── train_model.py                      (Original trainer)
│   │   └── evaluate_model.py                   (Model evaluation)
│   │
│   ├── api/                                 # REST API Backend
│   │   ├── main.py                             (FastAPI app + routes)
│   │   ├── routes.py                           (API endpoints)
│   │   └── schema.py                           (Pydantic request/response models)
│   │
│   ├── visualization/                       # Mapping & visualization
│   │   ├── live_map.py                         (Folium map generation)
│   │   ├── evacuation_routes.py                (OSMNX route planning)
│   │   ├── load_waterbodies.py                 (GeoJSON loading)
│   │   ├── flood_heatmap.py                    (Heatmap generation)
│   │   ├── heatmap.py                          (Alternative heatmap)
│   │   └── map_utils.py                        (Map utilities)
│   │
│   ├── alerts/                              # Alert systems
│   │   ├── alert_system.py                     (Console alerts)
│   │   ├── telegram_alert.py                   (Telegram bot notifications)
│   │   ├── twilio_alert.py                     (SMS alerts via Twilio)
│   │   └── sms_service.py                      (SMS service layer)
│   │
│   ├── data/                                # Data processing pipeline
│   │   ├── data_cleaning.py                    (Data cleaning utilities)
│   │   ├── data_loader.py                      (CSV/GeoJSON loading)
│   │   ├── elevation_processor.py              (Elevation data processing)
│   │   ├── weather_collector.py                (Weather data collection)
│   │   ├── soil_moisture_pipeline.py           (Soil moisture processing)
│   │   ├── river_proximity.py                  (River distance calculation)
│   │   ├── master_pipeline.py                  (Main data pipeline)
│   │   ├── feature_engineered_dataset.csv      (Engineered dataset)
│   │   └── fix_district_names.py               (Data validation)
│   │
│   ├── features/                            # Feature engineering
│   │   ├── feature_engineering.py              (Feature creation)
│   │   ├── feature_pipeline.py                 (Feature pipeline)
│   │   ├── feature_utils.py                    (Feature utilities)
│   │   └── flood_risk_calculator.py            (Risk scoring)
│   │
│   └── utils/                               # System utilities
│       ├── config.py                           (Configuration management)
│       ├── logger.py                           (Logging setup)
│       └── logging_system.py                   (Logging system)
│
├── models/                                  # Trained ML Models
│   ├── flood_xgb_model.pkl                     (XGBoost AI model - 200 estimators)
│   ├── flood_model.pkl                         (Traditional ML model)
│   └── scaler.pkl                              (Feature scaler)
│
├── data/                                    # Data directory
│   ├── raw/
│   │   ├── elevation_data.csv                  (Terrain elevation)
│   │   ├── flood_data.csv                      (Historical flood data)
│   │   ├── rainfall_data.csv                   (Rainfall records)
│   │   └── soil_moisture.csv                   (Soil moisture levels)
│   │
│   ├── processed/
│   │   └── feature_engineered_dataset.csv      (Processed features)
│   │
│   ├── external/
│   │   └── kaggle_flood_dataset.csv            (External dataset)
│   │
│   └── Live Data (Auto-generated every 5 min)
│       ├── ai_flood_predictions.csv            (District predictions)
│       ├── ai_training_data.csv                (Training dataset - 5K rows)
│       ├── live_flood_status.csv               (Current rainfall status)
│       ├── river_alerts.csv                    (River water level alerts)
│       ├── karnataka_rivers.csv                (River metadata)
│       ├── karnataka_waterbodies.geojson       (Water bodies polygons)
│       └── india_districts.geojson            (District boundaries)
│
├── frontend/                                # Streamlit Dashboard
│   ├── integrated_dashboard.py                 (Main dashboard - RECOMMENDED)
│   ├── streamlit_app.py                        (Alt: Basic dashboard)
│   ├── streamlit_with_alerts.py                (Alt: With alerts)
│   └── streamlit_with_map.py                   (Alt: With map)
│
├── backend/                                 # Original API files
│   ├── api.py                                  (Original FastAPI)
│   └── api_with_logging.py                    (API with logging)
│
├── scripts/                                 # Execution scripts
│   ├── start_api.py                            (Start API server)
│   ├── start_dashboard.bat                    (Launch dashboard)
│   ├── run_training.py                         (Train models)
│   └── start_server.py                         (Start server)
│
├── config/                                  # Configuration
│   └── config.py                              (Config settings)
│
├── components/                              # React components (Frontend)
│   ├── layout/
│   │   ├── Layout.js
│   │   └── Sidebar.js
│   └── prediction/
│       └── FloodPredictionForm.js
│
├── maps/                                    # Interactive maps
│   ├── OverviewFloodMap.js
│   ├── RainfallHeatmapMap.js
│   └── RiverStationsMap.js
│
├── charts/                                  # Chart components
│   ├── RainfallLineChart.js
│   ├── RiverLevelChart.js
│   └── [Other charts]
│
├── tables/                                  # Table components
│   ├── DistrictRainfallTable.js
│   ├── PredictionHistoryTable.js
│   └── StationStatusTable.js
│
├── pages/                                   # Next.js pages
│   ├── _app.js
│   ├── index.js
│   ├── prediction.js
│   ├── rainfall.js
│   └── rivers.js
│
├── notebooks/                               # Jupyter notebooks
│   └── exploration.ipynb                    (Data exploration)
│
├── styles/                                  # CSS Styles
│   └── globals.css
│
├── tests/                                   # Test suite
│   ├── test_api.py                          (API tests)
│   ├── test_model.py                        (Model tests)
│   └── alerts_page.py                       (Alert tests)
│
├── flood_prediction_system/                 # Integrated ML system
│   ├── dashboard/
│   │   └── app.py
│   ├── data/
│   │   └── [Live data files]
│   ├── models/
│   │   └── [Model files]
│   └── src/
│       └── [Integration scripts]
│
├── logs/                                    # System logs (auto-created)
│   ├── flood_system.log
│   └── [Timestamped logs]
│
├── .git/                                    # Git repository
├── .gitignore                               # Git ignore rules
├── .env                                     # Environment variables (local)
├── .env.example                             # Environment template
│
├── jsconfig.json                            # JavaScript config
├── next.config.js                           # Next.js config
├── postcss.config.js                        # PostCSS config  
├── tailwind.config.js                       # Tailwind CSS config
├── package.json                             # NPM dependencies
├── package-lock.json                        # NPM lock file
│
├── requirements.txt                         # Python dependencies
├── README.md                                # Main project README
├── INTEGRATION_GUIDE.md                     # Integration documentation
├── PROJECT_STRUCTURE.md                     # This file
├── DATA_PIPELINE.md                         # Data pipeline documentation
└── structure.txt                            # Text-based structure
```

---

## Component Overview

### 1. Monitoring Layer (`src/monitoring/`)

| Component | Purpose | Frequency |
|-----------|---------|-----------|
| `live_monitor.py` | Fetches rainfall forecasts from Open-Meteo API | Every 5 min |
| `river_monitor.py` | Checks river water levels against danger thresholds | Every 5 min |
| `auto_monitor.py` | Orchestrates all monitoring tasks | Every 5 min |

### 2. Data Pipeline (`src/data/`)

- **Data Loader**: Reads CSV and GeoJSON files
- **Weather Collector**: Fetches weather data
- **Elevation Processor**: Processes terrain data
- **River Proximity**: Calculates distance to rivers
- **Master Pipeline**: Coordinates entire pipeline

### 3. Feature Engineering (`src/features/`)

- **Feature Engineering**: Creates derived features
- **Feature Pipeline**: Main feature processing
- **Flood Risk Calculator**: Computes risk scores

### 4. Machine Learning (`src/models/`)

| Model | Training Data | Features | Output |
|-------|---------------|----------|--------|
| **AI XGBoost** | Synthetic (5K rows) | Rainfall, River Risk, Area | Probability (0-1) |
| **Traditional** | Real data | 6 weather/terrain features | Risk score + level |

### 5. API Endpoints (`src/api/`)

**Prediction Endpoints**:
- `POST /api/v1/predict` - Traditional ML prediction
- `POST /api/v1/predict-district` - AI district prediction
- `GET /api/v1/predictions/all` - All district predictions

**Monitoring Endpoints**:
- `GET /api/v1/status/live` - Current flood status
- `GET /api/v1/alerts/river` - River water alerts

**System Endpoints**:
- `GET /api/v1/health` - System health check
- `GET /api/v1/status/summary` - Complete status

### 6. Visualization (`src/visualization/`)

- **live_map.py**: Creates color-coded Folium map (Red=HIGH, Orange=MEDIUM, Green=LOW)
- **evacuation_routes.py**: Computes escape routes using OSMNX
- **flood_heatmap.py**: Generates density heatmaps

### 7. Alerting (`src/alerts/`)

- **Console Alerts**: Print warnings to terminal
- **Telegram Alerts**: Send bot notifications (requires token)
- **SMS Alerts**: Send SMS via Twilio (requires credentials)

### 8. Frontend Dashboard

**Primary**: `frontend/integrated_dashboard.py` (Streamlit)
- **Tab 1**: AI district predictions with filtering
- **Tab 2**: Live alerts (HIGH risk districts)
- **Tab 3**: Interactive flood map
- **Tab 4**: Manual prediction input
- **Tab 5**: Analytics and trends

---

## Data Flow Pipeline

```
Open-Meteo API ──────────┐
                         ├──→ live_monitor.py ────────┐
River Monitors ──────────┘                           │
                                                      ├──→ CSV files (live_flood_status.csv)
                                                      │
District Data ────┐                                  │
                  ├──→ ai_predict.py ─────────────┐ │
Models ───────────┘                               │ │
                  ├──→ ai_flood_predictions.csv ──┤ │
                  │                                 │ │
                  ├──→ live_map.py ────────────────┤─┼──→ karnataka_live_flood_map.html
                  │                                 │ │
                  ├──→ telegram_alert.py ──────────┘ │
                  │                                   │
                  └──→ FastAPI ─────────────────────  ├──→ REST API
                                                      │
                                                      └──→ Streamlit Dashboard
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Local environment variables (⚠️ Add to .gitignore) |
| `.env.example` | Template for required env vars |
| `config/config.py` | Application configuration |
| `jsconfig.json` | JavaScript paths |
| `next.config.js` | Next.js build config |
| `postcss.config.js` | PostCSS plugins |
| `tailwind.config.js` | Tailwind CSS config |
| `package.json` | Node.js dependencies |
| `requirements.txt` | Python dependencies |

---

## Key Files to Understand

### Starting Points

1. **`src/api/main.py`** - FastAPI application entry point
2. **`frontend/integrated_dashboard.py`** - Dashboard entry point
3. **`src/monitoring/auto_monitor.py`** - Monitoring orchestrator
4. **`src/models/ai_predict.py`** - AI prediction engine

### Configuration

1. **`.env`** - API port, data dirs, alert credentials
2. **`requirements.txt`** - All Python packages
3. **`package.json`** - Node.js packages

### Data

1. **`data/ai_flood_predictions.csv`** - Latest predictions
2. **`models/flood_xgb_model.pkl`** - AI model
3. **`karnataka_live_flood_map.html`** - Interactive map

---

## Quick Start Commands

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create and train models
python src/models/create_training_data.py
python src/models/train_ai_model.py

# 3. Generate initial predictions
python src/models/ai_predict.py
python src/visualization/live_map.py

# 4. Start API (Terminal 1)
python -m uvicorn src.api.main:app --port 8000 --reload

# 5. Start monitoring (Terminal 2)
python src/monitoring/auto_monitor.py

# 6. Start dashboard (Terminal 3)
streamlit run frontend/integrated_dashboard.py
```

---

## Deployment Checklist

- [ ] Copy `.env.example` to `.env` and fill values
- [ ] Run `pip install -r requirements.txt`
- [ ] Train models: `python src/models/train_ai_model.py`
- [ ] Test API: Visit `http://localhost:8000/docs`
- [ ] Test Dashboard: Visit `http://localhost:8501`
- [ ] Configure alerts (Telegram/SMS if needed)
- [ ] Enable auto-monitor for production

---

## Integration Points

### Adding New Data Source
1. Create fetcher in `src/data/`
2. Integrate into `src/data/master_pipeline.py`
3. Add to features if needed

### Adding New Alert Type
1. Create handler in `src/alerts/`
2. Call from `src/monitoring/auto_monitor.py`
3. Add UI in dashboard

### Adding New Visualization
1. Create script in `src/visualization/`
2. Generate output (HTML/GeoJSON)
3. Display in dashboard

---

## Troubleshooting

**Issue**: Models not loading
```bash
python src/models/train_ai_model.py  # Retrain
```

**Issue**: API not responding
```bash
netstat -tuln | grep 8000  # Check port
ps aux | grep python  # Check processes
```

**Issue**: No alerts being sent
```bash
# Check .env configuration
cat .env | grep TELEGRAM
# Test manually
python -c "from src.alerts.telegram_alert import send_telegram_alert; send_telegram_alert('Test')"
```

---

**Last Updated**: March 6, 2024
**Integration Status**: ✅ Complete

