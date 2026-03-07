import geopandas as gpd
import pandas as pd

ph1 = gpd.read_file("data/karnataka_waterbodies_ph1.geojson")
ph2 = gpd.read_file("data/karnataka_waterbodies_ph2.geojson")

waterbodies = pd.concat([ph1, ph2], ignore_index=True)

waterbodies.to_file("data/karnataka_waterbodies.geojson", driver="GeoJSON")

print("Merged waterbodies dataset created")