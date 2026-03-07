import pandas as pd
import joblib
import geopandas as gpd

print("Loading AI model...")

model = joblib.load("models/flood_xgb_model.pkl")
scaler = joblib.load("models/scaler.pkl")

print("Loading rainfall data...")

rain = pd.read_csv("data/live_flood_status.csv")

print("Loading river data...")

river = pd.read_csv("data/karnataka_rivers.csv")

# calculate river flood risk
river["RiverRisk"] = river["CurrentLevel"] / river["DangerLevel"]

data = rain.merge(river[["District","RiverRisk"]], on="District", how="left")

data["RiverRisk"] = data["RiverRisk"].fillna(0)

# terrain feature
geo = gpd.read_file("data/india_districts.geojson")

geo = geo[geo["state"].str.contains("Karnataka", case=False, na=False)]

geo["area"] = geo.geometry.area

terrain = geo[["district","area"]]

data = data.merge(
    terrain,
    left_on="District",
    right_on="district",
    how="left"
)

data = data.drop(columns=["district"])

# model features
features = data[[
    "Rainfall_24h_mm",
    "RiverRisk",
    "area"
]]

X = scaler.transform(features)

preds = model.predict(X)

data["FloodProbability"] = preds


def classify(p):

    if p > 0.7:
        return "HIGH"

    elif p > 0.4:
        return "MEDIUM"

    else:
        return "LOW"


data["RiskLevel"] = data["FloodProbability"].apply(classify)

data.to_csv("data/ai_flood_predictions.csv", index=False)

print("AI flood predictions generated")