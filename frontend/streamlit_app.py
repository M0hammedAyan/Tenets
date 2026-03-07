import streamlit as st
import requests
import pandas as pd
from datetime import datetime

st.set_page_config(page_title="Flood Prediction Dashboard", layout="wide")

st.title("🌊 Flood Prediction System")

if 'predictions' not in st.session_state:
    st.session_state.predictions = []

col1, col2 = st.columns(2)

with col1:
    st.subheader("Input Parameters")
    rainfall_3hr = st.number_input("3-Hour Rainfall (mm)", min_value=0.0, value=10.0)
    rainfall_24hr = st.number_input("24-Hour Rainfall (mm)", min_value=0.0, value=50.0)
    soil_moisture = st.slider("Soil Moisture (%)", 0, 100, 60)

with col2:
    st.write("")
    st.write("")
    elevation = st.number_input("Elevation (m)", min_value=0.0, value=100.0)
    slope = st.slider("Slope (degrees)", 0, 90, 15)
    river_proximity = st.number_input("River Proximity (km)", min_value=0.0, value=2.0)

if st.button("🔮 Predict Flood Risk", type="primary"):
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
            risk_score = result['risk_score']
            
            st.session_state.predictions.append({
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'risk_level': risk_level,
                'risk_score': risk_score
            })
            
            if risk_level == "High":
                st.error(f"⚠️ **HIGH FLOOD RISK** - Risk Score: {risk_score:.2%}")
            elif risk_level == "Medium":
                st.warning(f"⚡ **MEDIUM FLOOD RISK** - Risk Score: {risk_score:.2%}")
            else:
                st.success(f"✅ **LOW FLOOD RISK** - Risk Score: {risk_score:.2%}")
        else:
            st.error(f"API Error: {response.text}")
    except Exception as e:
        st.error(f"Connection Error: {str(e)}")

if st.session_state.predictions:
    st.subheader("📊 Historical Predictions")
    df = pd.DataFrame(st.session_state.predictions)
    
    def color_risk(val):
        if val == "High":
            return 'background-color: #ff4444; color: white'
        elif val == "Medium":
            return 'background-color: #ffaa00; color: white'
        else:
            return 'background-color: #44ff44; color: black'
    
    st.dataframe(df.style.applymap(color_risk, subset=['risk_level']), use_container_width=True)
