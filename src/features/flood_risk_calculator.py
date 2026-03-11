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

    for col in ('rainfall_3hr', 'rainfall_24hr', 'elevation', 'slope', 'river_proximity'):
        if col in df.columns:
            max_val = df[col].max()
            if max_val > 0:
                if col in ('elevation', 'slope', 'river_proximity'):
                    normalized[col] = 1 - (df[col] / max_val)
                else:
                    normalized[col] = df[col] / max_val
            else:
                normalized[col] = 0.0

    if 'soil_moisture' in df.columns:
        normalized['soil_moisture'] = df['soil_moisture'] / 100

    df['flood_risk_index'] = sum(normalized[col] * weights[col] for col in weights.keys() if col in normalized.columns)
    return df
