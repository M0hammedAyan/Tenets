import streamlit as st
import requests

st.set_page_config(page_title="Flood Alert Dashboard", layout="wide")

st.title("Flood Prediction with Alerts")

rainfall_3hr = st.number_input("3-Hour Rainfall (mm)", min_value=0.0, value=10.0)
rainfall_24hr = st.number_input("24-Hour Rainfall (mm)", min_value=0.0, value=50.0)
soil_moisture = st.slider("Soil Moisture (%)", 0, 100, 60)
elevation = st.number_input("Elevation (m)", min_value=0.0, value=100.0)
slope = st.slider("Slope (degrees)", 0, 90, 15)
river_proximity = st.number_input("River Proximity (km)", min_value=0.0, value=2.0)

if st.button("Predict"):
    try:
        response = requests.post(
            "http://localhost:8000/predict",
            json={
                "rainfall_3hr": rainfall_3hr,
                "rainfall_24hr": rainfall_24hr,
                "soil_moisture": soil_moisture,
                "elevation": elevation,
                "slope": slope,
                "river_proximity": river_proximity
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            risk_level = result['risk_level']
            
            if risk_level == "High":
                st.error("🚨 **FLOOD WARNING ALERT**")
                st.markdown("### ⚠️ HIGH RISK DETECTED")
                st.markdown("**Immediate action required. Monitor weather updates closely.**")
            elif risk_level == "Medium":
                st.warning("⚡ Medium flood risk detected. Stay vigilant.")
            else:
                st.success("✅ Low flood risk. Conditions are safe.")
    except Exception as e:
        st.error(f"Error: {str(e)}")
