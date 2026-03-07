import pandas as pd
import numpy as np

def calculate_rainfall_features(df):
    """Calculate rainfall-based features."""
    df = df.sort_values(['latitude', 'longitude', 'timestamp'])
    
    df['rainfall_3hr'] = df.groupby(['latitude', 'longitude'])['rainfall_mm'].rolling(
        window=3, min_periods=1
    ).sum().reset_index(drop=True)
    
    df['rainfall_24hr'] = df.groupby(['latitude', 'longitude'])['rainfall_mm'].rolling(
        window=24, min_periods=1
    ).sum().reset_index(drop=True)
    
    df['rainfall_intensity'] = df['rainfall_mm'] / 1  # mm per hour
    
    return df

def calculate_soil_moisture_index(df):
    """Calculate soil moisture index."""
    if 'soil_moisture' in df.columns:
        df['soil_moisture_index'] = df['soil_moisture'] / 100
    return df

def calculate_flood_risk_index(df):
    """Calculate comprehensive flood risk index."""
    weights = {
        'rainfall_3hr': 0.25,
        'rainfall_24hr': 0.20,
        'soil_moisture_index': 0.20,
        'elevation': 0.15,
        'slope': 0.10,
        'river_proximity': 0.10
    }
    
    normalized = df.copy()
    
    for col in weights.keys():
        if col in df.columns:
            max_val = df[col].max()
            if max_val > 0:
                if col in ['elevation', 'slope']:
                    normalized[col] = 1 - (df[col] / max_val)
                elif col == 'river_proximity':
                    normalized[col] = 1 - (df[col] / max_val)
                else:
                    normalized[col] = df[col] / max_val
    
    df['flood_risk_index'] = sum(
        normalized[col] * weights[col] 
        for col in weights.keys() 
        if col in normalized.columns
    )
    
    return df

def engineer_features(df):
    """Complete feature engineering pipeline."""
    df = calculate_rainfall_features(df)
    df = calculate_soil_moisture_index(df)
    df = calculate_flood_risk_index(df)
    
    feature_cols = [
        'rainfall_3hr', 'rainfall_24hr', 'rainfall_intensity',
        'soil_moisture_index', 'elevation', 'slope', 
        'river_proximity', 'flood_risk_index'
    ]
    
    return df[[col for col in feature_cols if col in df.columns] + ['latitude', 'longitude', 'timestamp']]
