"""
Integrated Flood Prediction Dashboard
Combines traditional and AI-based flood prediction for Karnataka
"""

import streamlit as st
import pandas as pd
import numpy as np
import os
from pathlib import Path
import requests
from datetime import datetime
import json

# ============ PAGE CONFIGURATION ============

st.set_page_config(
    page_title="AI Flood Early Warning System - Karnataka",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': 'https://github.com/yourusername/flood-prediction-system',
        'Report a bug': "https://github.com/yourusername/flood-prediction-system/issues",
    }
)

st.title("🌊 Karnataka AI Flood Early Warning System")
st.markdown("### Real-time Flood Risk Prediction & Monitoring")

# ============ SIDEBAR CONFIGURATION ============

with st.sidebar:
    st.header("⚙️ Configuration")
    
    # API Configuration
    st.subheader("API Settings")
    api_endpoint = st.text_input(
        "API Endpoint URL",
        value="http://localhost:8000",
        help="Base URL of the Flood Prediction API"
    )
    
    # Data paths
    st.subheader("Data Paths")
    data_dir = Path("data")
    
    # Refresh button
    if st.button("🔄 Refresh Data"):
        st.rerun()
    
    st.markdown("---")
    st.markdown("### 📊 System Information")
    st.info(
        """
        **Prediction Models:**
        - Traditional ML (Scikit-learn)
        - AI XGBoost (District-level)
        
        **Data Sources:**
        - Weather API (Open-Meteo)
        - River Monitoring
        - Geospatial Data
        """
    )


# ============ MAIN CONTENT TABS ============

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "🎯 AI Predictions",
    "⚠️ Live Alerts",
    "🗺️ Flood Map",
    "🔬 Traditional Prediction",
    "📊 Analytics"
])


# ============ TAB 1: AI PREDICTIONS ============

with tab1:
    st.header("📊 District-Level AI Flood Predictions")
    
    st.markdown("""
    This view shows **XGBoost AI model predictions** for flood risk in each Karnataka district 
    based on rainfall forecast, river risk levels, and terrain features.
    """)
    
    # Load AI predictions
    predictions_file = data_dir / "ai_flood_predictions.csv"
    
    if predictions_file.exists():
        df_predictions = pd.read_csv(predictions_file)
        
        # Display statistics
        col1, col2, col3, col4 = st.columns(4)
        
        high_risk = len(df_predictions[df_predictions['RiskLevel'] == 'HIGH'])
        medium_risk = len(df_predictions[df_predictions['RiskLevel'] == 'MEDIUM'])
        low_risk = len(df_predictions[df_predictions['RiskLevel'] == 'LOW'])
        avg_probability = df_predictions['FloodProbability'].mean()
        
        with col1:
            st.metric("🔴 High Risk", high_risk)
        with col2:
            st.metric("🟠 Medium Risk", medium_risk)
        with col3:
            st.metric("🟢 Low Risk", low_risk)
        with col4:
            st.metric("📈 Avg Probability", f"{avg_probability:.1%}")
        
        # Sortable predictions table
        st.subheader("All Districts")
        
        # Add filters
        col1, col2 = st.columns(2)
        
        with col1:
            risk_filter = st.multiselect(
                "Filter by Risk Level",
                options=["LOW", "MEDIUM", "HIGH"],
                default=["LOW", "MEDIUM", "HIGH"],
                key="risk_filter"
            )
        
        with col2:
            sort_by = st.selectbox(
                "Sort by",
                options=["District", "FloodProbability (↓)", "Rainfall_24h_mm (↓)"],
                key="sort_by"
            )
        
        # Filter data
        df_filtered = df_predictions[df_predictions['RiskLevel'].isin(risk_filter)]
        
        # Sort data
        if "Flood" in sort_by:
            df_filtered = df_filtered.sort_values('FloodProbability', ascending=False)
        elif "Rainfall" in sort_by:
            df_filtered = df_filtered.sort_values('Rainfall_24h_mm', ascending=False)
        else:
            df_filtered = df_filtered.sort_values('District')
        
        # Display with color coding
        def highlight_risk(row):
            if row['RiskLevel'] == 'HIGH':
                return ['background-color: #ff6b6b'] * len(row)
            elif row['RiskLevel'] == 'MEDIUM':
                return ['background-color: #ffa500'] * len(row)
            else:
                return ['background-color: #51cf66'] * len(row)
        
        st.dataframe(
            df_filtered.style.apply(highlight_risk, axis=1),
            use_container_width=True,
            height=400
        )
        
        # Export option
        csv = df_filtered.to_csv(index=False)
        st.download_button(
            label="📥 Download Predictions CSV",
            data=csv,
            file_name=f"flood_predictions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )
    
    else:
        st.warning("⚠️ AI predictions file not found. Run `python src/models/ai_predict.py` to generate predictions.")


# ============ TAB 2: LIVE ALERTS ============

with tab2:
    st.header("🚨 Active Flood Alerts")
    
    col1, col2 = st.columns([3, 1])
    
    with col1:
        st.markdown("#### Real-time High-Risk Districts")
    with col2:
        if st.button("🔔 Test Alert"):
            st.info("Alert notification would be sent here")
    
    # Live flood status
    status_file = data_dir / "live_flood_status.csv"
    
    if status_file.exists():
        df_status = pd.read_csv(status_file)
        
        # Show high risk alerts
        high_risk_districts = df_status[df_status['RiskLevel'] == 'HIGH']
        
        if len(high_risk_districts) > 0:
            for _, row in high_risk_districts.iterrows():
                col1, col2, col3 = st.columns([2, 1, 1])
                with col1:
                    st.error(f"🔴 **{row['District']}**")
                with col2:
                    st.metric("Rainfall", f"{row['Rainfall_24h_mm']:.1f} mm")
                with col3:
                    st.metric("Status", "CRITICAL")
        else:
            st.success("✅ No high-risk districts detected")
        
        # River alerts
        rivers_file = data_dir / "river_alerts.csv"
        
        if rivers_file.exists():
            df_rivers = pd.read_csv(rivers_file)
            
            st.markdown("#### 🏞️ River Water Level Alerts")
            
            high_alerts = df_rivers[df_rivers['Alert'] == 'HIGH']
            
            if len(high_alerts) > 0:
                for _, row in high_alerts.iterrows():
                    st.warning(f"⚠️ **{row['River']}** in {row['District']} - Danger Level")
            else:
                st.success("✅ All rivers at safe levels")
    
    else:
        st.warning("Live status data not available. Run monitoring scripts first.")


# ============ TAB 3: FLOOD MAP ============

with tab3:
    st.header("🗺️ Flood Risk Map")
    
    st.markdown("Interactive map showing flood risk levels across all districts in Karnataka")
    
    # Check for map file
    map_file = data_dir.parent / "flood_prediction_system" / "karnataka_live_flood_map.html"
    map_file_alt = Path("karnataka_live_flood_map.html")
    
    if map_file.exists():
        with open(map_file, "r", encoding="utf-8") as f:
            html = f.read()
        st.components.v1.html(html, height=700)
    elif map_file_alt.exists():
        with open(map_file_alt, "r", encoding="utf-8") as f:
            html = f.read()
        st.components.v1.html(html, height=700)
    else:
        st.warning("⚠️ Map not generated. Run `python src/visualization/live_map.py` to generate it.")
        
        # Display GeoJSON preview
        geojson_file = data_dir / "india_districts.geojson"
        if geojson_file.exists():
            st.info("GeoJSON data available. Map will be generated once live_map.py is executed.")


# ============ TAB 4: TRADITIONAL PREDICTION ============

with tab4:
    st.header("🔬 Traditional Flood Prediction Model")
    
    st.markdown("""
    This uses a **traditional Machine Learning model** trained on:
    - Rainfall (3-hour and 24-hour)
    - Soil moisture
    - Elevation
    - Slope
    - River proximity
    """)
    
    # Input form
    st.subheader("Enter Location Parameters")
    
    col1, col2 = st.columns(2)
    
    with col1:
        rainfall_3hr = st.number_input(
            "3-Hour Rainfall (mm)",
            min_value=0.0,
            value=25.0,
            step=0.1
        )
        soil_moisture = st.slider(
            "Soil Moisture (%)",
            min_value=0,
            max_value=100,
            value=60
        )
        elevation = st.number_input(
            "Elevation (meters)",
            min_value=0.0,
            value=500.0,
            step=10.0
        )
    
    with col2:
        rainfall_24hr = st.number_input(
            "24-Hour Rainfall (mm)",
            min_value=0.0,
            value=75.0,
            step=0.1
        )
        slope = st.slider(
            "Slope (degrees)",
            min_value=0,
            max_value=90,
            value=15
        )
        river_proximity = st.number_input(
            "Distance to River (km)",
            min_value=0.0,
            value=5.0,
            step=0.1
        )
    
    # Make prediction
    if st.button("🔮 Predict Flood Risk"):
        try:
            payload = {
                "rainfall_3hr": rainfall_3hr,
                "rainfall_24hr": rainfall_24hr,
                "soil_moisture": soil_moisture,
                "elevation": elevation,
                "slope": slope,
                "river_proximity": river_proximity
            }
            
            response = requests.post(
                f"{api_endpoint}/api/v1/predict",
                json=payload,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("Risk Level", result['risk_level'])
                with col2:
                    st.metric("Risk Score", f"{result['risk_score']:.2%}")
                with col3:
                    if result['risk_level'] == 'HIGH':
                        st.error("⚠️ HIGH RISK")
                    elif result['risk_level'] == 'MEDIUM':
                        st.warning("⚠️ MEDIUM RISK")
                    else:
                        st.success("✅ LOW RISK")
            else:
                st.error(f"API Error: {response.status_code}")
        
        except requests.exceptions.ConnectionError:
            st.error("⚠️ Could not connect to API. Is the server running?")
        except Exception as e:
            st.error(f"Error: {str(e)}")


# ============ TAB 5: ANALYTICS ============

with tab5:
    st.header("📊 Analytics & Insights")
    
    st.markdown("System-wide analytics and historical trends")
    
    # Risk distribution chart
    if predictions_file.exists():
        df_pred = pd.read_csv(predictions_file)
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Risk Distribution")
            risk_counts = df_pred['RiskLevel'].value_counts()
            st.bar_chart(risk_counts)
        
        with col2:
            st.subheader("Flood Probability Distribution")
            # Create histogram using bar_chart
            hist_data = pd.cut(df_pred['FloodProbability'], bins=20).value_counts().sort_index()
            st.bar_chart(hist_data, use_container_width=True)
        
        # Top high-risk districts
        st.subheader("🔴 Top High-Risk Districts")
        high_risk = df_pred[df_pred['RiskLevel'] == 'HIGH'].nlargest(5, 'FloodProbability')
        
        if len(high_risk) > 0:
            st.dataframe(
                high_risk[['District', 'FloodProbability', 'Rainfall_24h_mm']],
                use_container_width=True,
                hide_index=True
            )
        else:
            st.info("No high-risk districts at this time")


# ============ FOOTER ============

st.markdown("---")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("### 🔧 System Status")
    # Simple health check
    try:
        health = requests.get(f"{api_endpoint}/api/v1/health", timeout=2)
        if health.status_code == 200:
            st.success("✅ API Online")
        else:
            st.error("❌ API Error")
    except:
        st.warning("⚠️ Cannot reach API")

with col2:
    st.markdown("### 📁 Data Files")
    data_files_ok = predictions_file.exists() and status_file.exists()
    if data_files_ok:
        st.success("✅ Data Available")
    else:
        st.warning("⚠️ Some Data Missing")

with col3:
    st.markdown("### ⏰ Last Update")
    st.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

st.markdown("---")
st.markdown(
    """
    <div style='text-align: center'>
    <p>🌍 AI Flood Early Warning System - Karnataka</p>
    <p>Powered by XGBoost ML & Real-time Monitoring</p>
    </div>
    """,
    unsafe_allow_html=True
)
