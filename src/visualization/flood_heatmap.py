import folium
from folium.plugins import HeatMap

def create_flood_risk_heatmap(locations_data, center_lat=0, center_lon=0, zoom=10):
    """
    Create flood risk heatmap with color-coded markers.
    
    Args:
        locations_data: List of dicts with keys: 'lat', 'lon', 'risk_probability', 'name'
    """
    m = folium.Map(location=[center_lat, center_lon], zoom_start=zoom)
    
    for loc in locations_data:
        risk = loc['risk_probability']
        
        if risk < 0.33:
            color = 'green'
            risk_label = 'Low'
        elif risk < 0.66:
            color = 'orange'
            risk_label = 'Medium'
        else:
            color = 'red'
            risk_label = 'High'
        
        popup_text = f"""
        <b>{loc['name']}</b><br>
        Risk Level: {risk_label}<br>
        Probability: {risk:.2%}
        """
        
        folium.CircleMarker(
            location=[loc['lat'], loc['lon']],
            radius=10,
            popup=folium.Popup(popup_text, max_width=200),
            color=color,
            fill=True,
            fillColor=color,
            fillOpacity=0.7
        ).add_to(m)
    
    return m
