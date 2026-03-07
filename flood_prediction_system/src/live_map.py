import folium
import pandas as pd
import geopandas as gpd

print("Generating AI Flood Risk Map...")

# Load AI predictions
pred = pd.read_csv("data/ai_flood_predictions.csv")

# Load district map
geo = gpd.read_file("data/india_districts.geojson")

# Filter Karnataka
geo = geo[geo["state"].str.contains("Karnataka", case=False, na=False)]

# Merge predictions with map
geo = geo.merge(
    pred,
    left_on="district",
    right_on="District",
    how="left"
)

# Create map centered on Karnataka
m = folium.Map(
    location=[15.3, 75.7],
    zoom_start=7,
    tiles="cartodbpositron"
)

# Risk color function
def get_color(risk):

    if risk == "HIGH":
        return "red"

    elif risk == "MEDIUM":
        return "orange"

    else:
        return "green"

# Draw districts
for _, row in geo.iterrows():

    color = get_color(row["RiskLevel"])

    folium.GeoJson(
        row["geometry"],
        style_function=lambda x, color=color: {
            "fillColor": color,
            "color": "black",
            "weight": 1,
            "fillOpacity": 0.6
        },
        tooltip=folium.Tooltip(
            f"""
            District: {row['District']}<br>
            Rainfall: {row['Rainfall_24h_mm']} mm<br>
            Flood Probability: {round(row['FloodProbability'],2)}<br>
            Risk: {row['RiskLevel']}
            """
        )
    ).add_to(m)

# Save map
m.save("karnataka_live_flood_map.html")

print("Flood map updated")