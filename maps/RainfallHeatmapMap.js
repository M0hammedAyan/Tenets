import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { fetchRainfallLocations } from "../utils/mapApi";

const karnatakaCenter = [14.5, 75.6];

const defaultRainfallCells = [
  { district: "Kodagu", coords: [12.45, 75.78], rainfall_24h: 92.1, rainfall_3h: 15.3, intensity: "high" },
  { district: "Uttara Kannada", coords: [14.80, 74.13], rainfall_24h: 125.6, rainfall_3h: 22.4, intensity: "high" },
  { district: "Shivamogga", coords: [13.93, 75.57], rainfall_24h: 65.3, rainfall_3h: 8.9, intensity: "medium" },
  { district: "Belagavi", coords: [15.85, 74.50], rainfall_24h: 35.2, rainfall_3h: 4.1, intensity: "medium" },
  { district: "Bengaluru Urban", coords: [12.97, 77.59], rainfall_24h: 22.5, rainfall_3h: 2.1, intensity: "low" }
];

const getRiskLevel = (rainfall24h) => {
  if (rainfall24h >= 100) return "high";
  if (rainfall24h >= 50) return "medium";
  return "low";
};

const riskColor = {
  low: "#22c55e",
  medium: "#facc15",
  high: "#ef4444"
};

export default function RainfallHeatmapMap() {
  const [rainfallCells, setRainfallCells] = useState(defaultRainfallCells);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveRainfall = async () => {
      try {
        const data = await fetchRainfallLocations();
        if (data && data.length > 0) {
          const transformedData = data.map(location => ({
            district: location.district,
            coords: [location.lat, location.lng],
            rainfall_24h: location.rainfall_24h,
            rainfall_3h: location.rainfall_3h,
            intensity: location.intensity
          }));
          setRainfallCells(transformedData);
        }
      } catch (error) {
        console.error('Error fetching rainfall data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveRainfall();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchLiveRainfall, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/60">
      <MapContainer
        center={karnatakaCenter}
        zoom={7}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://cartodb.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {rainfallCells.map((cell) => {
          const risk = getRiskLevel(cell.rainfall_24h);
          return (
            <CircleMarker
              key={cell.district}
              center={cell.coords}
              radius={12}
              pathOptions={{
                color: riskColor[risk],
                fillColor: riskColor[risk],
                fillOpacity: 0.6
              }}
            >
              <Tooltip>
                <div className="space-y-1">
                  <div className="font-semibold text-sm">{cell.district}</div>
                  <div className="text-xs">
                    24h Rainfall:{" "}
                    <span className="font-mono font-semibold">{cell.rainfall_24h?.toFixed(1) || 'N/A'} mm</span>
                  </div>
                  <div className="text-xs">
                    3h Rainfall:{" "}
                    <span className="font-mono font-semibold">
                      {cell.rainfall_3h?.toFixed(1) || 'N/A'} mm
                    </span>
                  </div>
                  <div className="text-xs">
                    Risk:{" "}
                    <span className="font-semibold capitalize text-emerald-200">
                      {risk}
                    </span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

