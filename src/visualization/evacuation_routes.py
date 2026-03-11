import sys
import pandas as pd
import osmnx as ox
import networkx as nx

DISTRICT_COORDS = {
    "Bengaluru Urban": (12.97, 77.59),
    "Mysuru": (12.30, 76.65),
    "Kodagu": (12.42, 75.73),
    "Shivamogga": (13.93, 75.57),
    "Belagavi": (15.85, 74.50),
}

SAFE_DISTRICT = "Bengaluru Urban"
DEFAULT_COORDS = DISTRICT_COORDS[SAFE_DISTRICT]


def generate_evacuation_route(
    data_path: str = "data/live_flood_status.csv",
    output_path: str = "evacuation_route.html",
) -> None:
    """Generate the shortest road evacuation route for the highest-risk district."""
    print("Checking evacuation routes...")

    try:
        data = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"Error: live flood status file not found: {data_path}", file=sys.stderr)
        sys.exit(1)

    high = data[data["RiskLevel"] == "HIGH"]

    if high.empty:
        print("No evacuation needed")
        return

    district = high.iloc[0]["District"]
    lat, lon = DISTRICT_COORDS.get(district, DEFAULT_COORDS)

    try:
        G = ox.graph_from_point((lat, lon), dist=50000, network_type="drive")
        orig = ox.distance.nearest_nodes(G, lon, lat)
        safe_lat, safe_lon = DEFAULT_COORDS
        dest = ox.distance.nearest_nodes(G, safe_lon, safe_lat)
        route = nx.shortest_path(G, orig, dest, weight="length")
        m = ox.plot_route_folium(G, route)
        m.save(output_path)
        print("Evacuation route generated")
    except Exception as e:
        print(f"Error generating evacuation route: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    generate_evacuation_route()
