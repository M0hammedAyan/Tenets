import pandas as pd
import osmnx as ox
import networkx as nx

print("Checking evacuation routes...")

data = pd.read_csv("data/live_flood_status.csv")

high = data[data["RiskLevel"]=="HIGH"]

if high.empty:

    print("No evacuation needed")
    exit()

district = high.iloc[0]["District"]

coords = {
"Bengaluru Urban":(12.97,77.59),
"Mysuru":(12.30,76.65),
"Kodagu":(12.42,75.73),
"Shivamogga":(13.93,75.57),
"Belagavi":(15.85,74.50)
}

lat,lon = coords.get(district,(12.97,77.59))

G = ox.graph_from_point((lat,lon),dist=50000,network_type="drive")

orig = ox.distance.nearest_nodes(G,lon,lat)

safe_lat,safe_lon = coords["Bengaluru Urban"]

dest = ox.distance.nearest_nodes(G,safe_lon,safe_lat)

route = nx.shortest_path(G,orig,dest,weight="length")

m = ox.plot_route_folium(G,route)

m.save("evacuation_route.html")

print("Evacuation route generated")