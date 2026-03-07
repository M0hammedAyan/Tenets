import pandas as pd

def calculate_flood_risk_index(df):
    """Calculate flood risk index using weighted environmental factors."""
    weights = {
        'rainfall_3hr': 0.25,
        'rainfall_24hr': 0.20,
        'soil_moisture': 0.20,
        'elevation': 0.15,
        'slope': 0.10,
        'river_proximity': 0.10
    }
    
    normalized = df.copy()
    normalized['rainfall_3hr'] = df['rainfall_3hr'] / df['rainfall_3hr'].max()
    normalized['rainfall_24hr'] = df['rainfall_24hr'] / df['rainfall_24hr'].max()
    normalized['soil_moisture'] = df['soil_moisture'] / 100
    normalized['elevation'] = 1 - (df['elevation'] / df['elevation'].max())
    normalized['slope'] = 1 - (df['slope'] / df['slope'].max())
    normalized['river_proximity'] = 1 - (df['river_proximity'] / df['river_proximity'].max())
    
    df['flood_risk_index'] = sum(normalized[col] * weights[col] for col in weights.keys())
    return df
