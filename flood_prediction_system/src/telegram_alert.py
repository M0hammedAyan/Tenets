

TOKEN = "8665024408:AAFYnSOZV4b3VrB5Ybj4ySERMwabFLR9o_Y"
CHAT_ID = "6973995572"

import requests
import pandas as pd

TOKEN = "8665024408:AAFYnSOZV4b3VrB5Ybj4ySERMwabFLR9o_Y"
CHAT_ID = "6973995572"

data = pd.read_csv("data/live_flood_status.csv")

alerts = data[data["RiskLevel"]=="HIGH"]

if alerts.empty:

    print("No Telegram alerts")

else:

    for _,row in alerts.iterrows():

        message = f"""
🚨 FLOOD ALERT 🚨

District: {row['District']}
Rainfall Forecast: {row['Rainfall_24h_mm']} mm
"""

        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"

        requests.post(url,data={
            "chat_id":CHAT_ID,
            "text":message
        })

        print("Telegram alert sent")