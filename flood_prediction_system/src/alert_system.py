import pandas as pd

data = pd.read_csv("data/live_flood_status.csv")

alerts = data[data["RiskLevel"]=="HIGH"]

if alerts.empty:
    print("No flood alerts currently")

else:
    print("FLOOD ALERTS")

    for _, row in alerts.iterrows():

        print(
            f"Flood Warning: {row['District']} | Rainfall: {row['Rainfall_24h_mm']} mm"
        )