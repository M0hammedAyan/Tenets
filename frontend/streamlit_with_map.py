import streamlit as st
import requests
from streamlit_folium import st_folium
import folium

st.set_page_config(page_title="Flood Map Dashboard", layout="wide")

st.title("🗺️ Flood Risk Map Dashboard")

col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("Prediction Input")
    rainfall_3hr = st.number_input("3-Hour Rainfall (mm)", min_value=0.0, value=10.0)
    rainfall_24hr = st.number_input("24-Hour Rainfall (mm)", min_value=0.0, value=50.0)
    soil_moisture = st.slider("Soil Moisture (%)", 0, 100, 60)
    elevation = st.number_input("Elevation (m)", min_value=0.0, value=100.0)
    slope = st.slider("Slope (degrees)", 0, 90, 15)
    river_proximity = st.number_input("River Proximity (km)", min_value=0.0, value=2.0)
    
    if st.button("Predict & Update Map"):
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
                st.session_state.prediction = result
        except Exception as e:
            st.error(f"Error: {str(e)}")

with col2:
    st.subheader("Flood Risk Map")
    
    locations = [
        {'lat': 40.7128, 'lon': -74.0060, 'name': 'Location A', 'risk': 0.25},
        {'lat': 40.7580, 'lon': -73.9855, 'name': 'Location B', 'risk': 0.55},
        {'lat': 40.6782, 'lon': -73.9442, 'name': 'Location C', 'risk': 0.85}
    ]
    
    m = folium.Map(location=[40.7128, -74.0060], zoom_start=11)
    
    for loc in locations:
        color = 'green' if loc['risk'] < 0.33 else 'orange' if loc['risk'] < 0.66 else 'red'
        risk_label = 'Low' if loc['risk'] < 0.33 else 'Medium' if loc['risk'] < 0.66 else 'High'
        
        folium.CircleMarker(
            location=[loc['lat'], loc['lon']],
            radius=12,
            popup=f"<b>{loc['name']}</b><br>Risk: {risk_label}<br>Score: {loc['risk']:.2%}",
            color=color,
            fill=True,
            fillColor=color,
            fillOpacity=0.7
        ).add_to(m)
    
    st_folium(m, width=700, height=500)

if 'prediction' in st.session_state:
    st.info(f"Latest Prediction: {st.session_state.prediction['risk_level']} Risk")
