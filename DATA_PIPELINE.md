# Data Collection & Processing Pipeline

## Overview
Complete data pipeline for flood prediction system covering weather data collection, soil moisture integration, elevation processing, and feature engineering.

## Components

### 1. Weather Data Collection
**File:** `src/data/weather_collector.py`

Collects real-time weather data from OpenWeather API:
- Rainfall (mm)
- Humidity (%)
- Temperature (°C)

**Usage:**
```python
from src.data.weather_collector import collect_weather_data

locations = [(40.7128, -74.0060), (34.0522, -118.2437)]
df = collect_weather_data(locations, api_key='YOUR_API_KEY')
```

### 2. Soil Moisture Pipeline
**File:** `src/data/soil_moisture_pipeline.py`

Processes and merges soil moisture data with weather data:
- Handles missing values
- Normalizes soil moisture (0-1)
- Merges by location and timestamp

### 3. Elevation Processing
**File:** `src/data/elevation_processor.py`

Extracts elevation and slope from SRTM raster data:
- Elevation extraction
- Slope calculation using gradient method
- Requires rasterio library

### 4. River Proximity
**File:** `src/data/river_proximity.py`

Calculates distance to nearest river:
- Uses geopandas for spatial operations
- Returns distance in meters
- Requires river network shapefile

### 5. Data Cleaning
**File:** `src/data/data_cleaning.py`

Comprehensive cleaning pipeline:
- Missing value imputation
- Duplicate removal
- Timestamp conversion
- Feature normalization
- Categorical encoding

### 6. Feature Engineering
**File:** `src/features/feature_engineering.py`

Generates ML-ready features:
- `rainfall_3hr` - 3-hour cumulative rainfall
- `rainfall_24hr` - 24-hour cumulative rainfall
- `rainfall_intensity` - Rainfall rate
- `soil_moisture_index` - Normalized soil moisture
- `flood_risk_index` - Weighted risk score

### 7. Master Pipeline
**File:** `src/data/master_pipeline.py`

Orchestrates entire pipeline:
```python
python src/data/master_pipeline.py
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure API keys in `.env`:
```
OPENWEATHER_API_KEY=your_key_here
```

3. Run pipeline:
```bash
python src/data/master_pipeline.py
```

## Output
Processed data saved to: `data/processed/feature_engineered_dataset.csv`
