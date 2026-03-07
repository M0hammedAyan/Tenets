import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchRiverLocations, fetchRainfallLocations } from '../utils/mapApi';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Karnataka center coordinates
const karnatakaCenter = [14.5204, 75.7224];

// Default fallback data if API fails
const defaultRiverStations = [
  {
    id: 1,
    river: 'Tungabhadra',
    location: 'Hospet',
    lat: 15.2695,
    lng: 76.3870,
    level: 18.5,
    alert_level: 18.0,
    danger_level: 19.0,
    status: 'Critical'
  },
  {
    id: 2,
    river: 'Krishna',
    location: 'Almatti',
    lat: 16.3306,
    lng: 75.8867,
    level: 5.5,
    alert_level: 4.5,
    danger_level: 5.0,
    status: 'Warning'
  },
  {
    id: 3,
    river: 'Cauvery',
    location: 'Krishnarajasagar',
    lat: 12.4209,
    lng: 76.5732,
    level: 3.2,
    alert_level: 4.5,
    danger_level: 5.0,
    status: 'Normal'
  },
];

const defaultRainfallAreas = [
  {
    id: 1,
    district: 'Bengaluru',
    center: [12.9716, 77.5946],
    radius: 50000,
    intensity: 'moderate',
    rainfall_24h: 35.2,
    rainfall_3h: 5.2
  },
  {
    id: 2,
    district: 'Kodagu',
    center: [12.3382, 75.2241],
    radius: 40000,
    intensity: 'high',
    rainfall_24h: 92.1,
    rainfall_3h: 15.3
  },
  {
    id: 3,
    district: 'Chikmagalur',
    center: [13.3172, 75.7139],
    radius: 35000,
    intensity: 'low',
    rainfall_24h: 25.8,
    rainfall_3h: 3.1
  }
];

const getRiskColor = (level, alertLevel, dangerLevel) => {
  if (level >= dangerLevel) return '#ef4444'; // red-500 (high risk)
  if (level >= alertLevel) return '#f97316'; // orange-500 (medium risk)
  return '#22c55e'; // green-500 (low risk)
};

const getRainfallColor = (rainfall24h) => {
  if (rainfall24h >= 100) return '#dc2626'; // red-600 (heavy)
  if (rainfall24h >= 50) return '#ea580c'; // orange-600 (moderate)
  return '#16a34a'; // green-600 (light)
};

export default function FloodRiskMap() {
  const [riverStations, setRiverStations] = useState(defaultRiverStations);
  const [rainfallAreas, setRainfallAreas] = useState(defaultRainfallAreas);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live location data from API
    const fetchLiveData = async () => {
      try {
        // Fetch river stations
        const riverData = await fetchRiverLocations();
        if (riverData && riverData.length > 0) {
          setRiverStations(riverData);
        }

        // Fetch rainfall locations
        const rainfallData = await fetchRainfallLocations();
        if (rainfallData && rainfallData.length > 0) {
          const transformedRainfall = rainfallData.map(location => ({
            id: location.id,
            district: location.district,
            center: [location.lat, location.lng],
            radius: 40000,
            intensity: location.intensity,
            rainfall_24h: location.rainfall_24h,
            rainfall_3h: location.rainfall_3h
          }));
          setRainfallAreas(transformedRainfall);
        }
      } catch (error) {
        console.error('Error fetching live map data:', error);
        // Keep using default data on error
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(fetchLiveData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <MapContainer
      center={karnatakaCenter}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Rainfall intensity circles */}
      {rainfallAreas.map((area) => (
        <Circle
          key={`rainfall-${area.id}`}
          center={area.center}
          radius={area.radius}
          pathOptions={{
            color: getRainfallColor(area.rainfall_24h),
            fillColor: getRainfallColor(area.rainfall_24h),
            fillOpacity: 0.3,
            weight: 2
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-semibold">{area.district || 'Rainfall Area'}</h3>
              <div className="mt-2 space-y-1">
                <p>Rainfall (24h): <span className="font-medium">{area.rainfall_24h?.toFixed(1) || 'N/A'} mm</span></p>
                <p>Rainfall (3h): <span className="font-medium">{area.rainfall_3h?.toFixed(1) || 'N/A'} mm</span></p>
                <p>Intensity: <span className="font-medium capitalize">{area.intensity || 'unknown'}</span></p>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* River gauge station markers */}
      {riverStations.map((station) => (
        <Marker
          key={station.id}
          position={[station.lat, station.lng]}
          icon={new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${getRiskColor(station.level, station.alert_level, station.danger_level)}"/>
              </svg>
            `)}`,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
          })}
        >
          <Popup>
            <div className="text-sm min-w-56">
              <h3 className="font-semibold text-gray-900">{station.river} River - {station.location}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Current Level:</span>
                  <span className="font-medium">{station.level?.toFixed(1) || 'N/A'} m</span>
                </div>
                <div className="flex justify-between">
                  <span>Alert Level:</span>
                  <span className="font-medium text-orange-600">{station.alert_level?.toFixed(1) || 'N/A'} m</span>
                </div>
                <div className="flex justify-between">
                  <span>Danger Level:</span>
                  <span className="font-medium text-red-600">{station.danger_level?.toFixed(1) || 'N/A'} m</span>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t">
                  <span>Status:</span>
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    station.level >= station.danger_level ? 'bg-red-100 text-red-800' :
                    station.level >= station.alert_level ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {station.level >= station.danger_level ? 'CRITICAL' :
                     station.level >= station.alert_level ? 'WARNING' : 'NORMAL'}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}