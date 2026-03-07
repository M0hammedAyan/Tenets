import streamlit as st
import pandas as pd
import os

st.set_page_config(page_title="Flood Early Warning System", layout="wide")

st.title("🌧 Karnataka AI Flood Early Warning System")

st.write(
"""
This system predicts flood risk using **AI (XGBoost)** based on:

• Rainfall Forecast  
• River Water Levels  
• Terrain Features  
• Water Bodies  

The model predicts **Flood Probability for each district in Karnataka.**
"""
)

# ---------- Load AI predictions ----------

file_path = "data/ai_flood_predictions.csv"

if os.path.exists(file_path):

    data = pd.read_csv(file_path)

    st.header("📊 District Flood Predictions")

    st.dataframe(data, width="stretch")

    # ---------- Flood Alerts ----------

    st.header("🚨 Flood Alerts")

    alerts = data[data["RiskLevel"] == "HIGH"]

    if alerts.empty:

        st.success("✅ No high flood risk detected")

    else:

        for _, row in alerts.iterrows():

            st.error(
                f"⚠ Flood Risk in {row['District']} | "
                f"Rainfall {round(row['Rainfall_24h_mm'],2)} mm | "
                f"Flood Probability {round(row['FloodProbability'],2)}"
            )

# ---------- Statistics ----------

    st.header("📈 Risk Distribution")

    col1, col2, col3 = st.columns(3)

    col1.metric("Low Risk Districts", len(data[data["RiskLevel"] == "LOW"]))
    col2.metric("Medium Risk Districts", len(data[data["RiskLevel"] == "MEDIUM"]))
    col3.metric("High Risk Districts", len(data[data["RiskLevel"] == "HIGH"]))

else:

    st.warning("Run ai_predict.py first to generate predictions")

# ---------- Map ----------

st.header("Flood Map")

if os.path.exists("karnataka_live_flood_map.html"):

    with open("karnataka_live_flood_map.html", "r", encoding="utf-8") as f:

        html = f.read()

    st.components.v1.html(html, height=650)

else:

    st.warning("Run live_map.py to generate the map")