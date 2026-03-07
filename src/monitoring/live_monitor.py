import pandas as pd
import requests

print("Generating Karnataka rainfall data...")

# Official Karnataka districts
districts = [
"Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban",
"Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga",
"Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri",
"Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur",
"Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada",
"Vijayapura","Yadgir"
]

# Approximate coordinates for Karnataka center
lat = 15.3173
lon = 75.7139

url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=precipitation"

try:
    weather = requests.get(url,timeout=10).json()
    rainfall_24h = sum(weather["hourly"]["precipitation"][:24])
except:
    rainfall_24h = 0

results = []

for d in districts:

    if rainfall_24h > 100:
        risk = "HIGH"
    elif rainfall_24h > 50:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    results.append({
        "District": d,
        "Rainfall_24h_mm": round(rainfall_24h,2),
        "RiskLevel": risk
    })

df = pd.DataFrame(results)

df.to_csv("data/live_flood_status.csv",index=False)

print("Rainfall forecast updated for Karnataka districts")