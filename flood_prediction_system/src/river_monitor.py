import pandas as pd

rivers = pd.read_csv("data/karnataka_rivers.csv")

alerts = []

for _, row in rivers.iterrows():

    if row["CurrentLevel"] >= row["DangerLevel"]:
        alerts.append({
            "District": row["District"],
            "River": row["River"],
            "Alert": "HIGH"
        })

    elif row["CurrentLevel"] >= row["SafeLevel"]:
        alerts.append({
            "District": row["District"],
            "River": row["River"],
            "Alert": "MEDIUM"
        })

df = pd.DataFrame(alerts)

df.to_csv("data/river_alerts.csv", index=False)

print("River monitoring updated")