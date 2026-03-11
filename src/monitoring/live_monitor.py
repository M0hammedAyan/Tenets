import sys
import pandas as pd
import requests

# Official Karnataka districts
DISTRICTS = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
    "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
    "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada",
    "Vijayapura", "Yadgir",
]

# Approximate coordinates for Karnataka center
_LAT = 15.3173
_LON = 75.7139


def fetch_rainfall_24h(lat: float = _LAT, lon: float = _LON) -> float:
    """Fetch 24-hour accumulated rainfall from Open-Meteo. Returns 0.0 on failure."""
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}&hourly=precipitation"
    )
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return sum(data["hourly"]["precipitation"][:24])
    except Exception as e:
        print(f"Warning: could not fetch rainfall data: {e}", file=sys.stderr)
        return 0.0


def classify_risk(rainfall_24h: float) -> str:
    """Classify flood risk level from 24-hour rainfall total (mm)."""
    if rainfall_24h > 100:
        return "HIGH"
    if rainfall_24h > 50:
        return "MEDIUM"
    return "LOW"


def generate_live_status(output_path: str = "data/live_flood_status.csv") -> None:
    """Fetch current rainfall, classify risk for every district, and write CSV."""
    print("Generating Karnataka rainfall data...")
    rainfall_24h = fetch_rainfall_24h()

    results = [
        {
            "District": district,
            "Rainfall_24h_mm": round(rainfall_24h, 2),
            "RiskLevel": classify_risk(rainfall_24h),
        }
        for district in DISTRICTS
    ]

    df = pd.DataFrame(results)
    df.to_csv(output_path, index=False)
    print("Rainfall forecast updated for Karnataka districts")


if __name__ == "__main__":
    generate_live_status()
