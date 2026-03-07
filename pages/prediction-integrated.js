import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Brain, TrendingUp, AlertTriangle, MapPin, Calendar, CloudRain, Droplets, Mountain, Zap, Gauge, RefreshCw, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { predictFloodRisk, getSafeLocations, getDistricts, sendTelegramAlert } from '../utils/floodApi';

// Sample prediction data
const predictionData = [
  { time: 'Today', risk: 65, rainfall: 85, riverLevel: 4.2 },
  { time: 'Day 1', risk: 72, rainfall: 92, riverLevel: 4.5 },
  { time: 'Day 2', risk: 78, rainfall: 98, riverLevel: 4.8 },
  { time: 'Day 3', risk: 82, rainfall: 105, riverLevel: 5.1 },
  { time: 'Day 4', risk: 75, rainfall: 88, riverLevel: 4.7 },
  { time: 'Day 5', risk: 68, rainfall: 76, riverLevel: 4.3 }
];

const getRiskBadge = (risk) => {
  switch (risk?.toLowerCase()) {
    case 'critical':
      return 'bg-red-600/20 text-red-300 border border-red-500/50';
    case 'high':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'medium':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    case 'low':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
};

const getRiskColor = (risk) => {
  switch (risk?.toLowerCase()) {
    case 'critical':
      return '#991b1b';
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#ea580c';
    case 'low':
      return '#16a34a';
    default:
      return '#6b7280';
  }
};

const getDefaultCoordinates = (district) => {
  const coordinates = {
    'Kodagu': { lat: 12.4392, lon: 75.4991 },
    'Hassan': { lat: 13.3346, lon: 75.9352 },
    'Chikmagalur': { lat: 13.3181, lon: 75.4619 },
    'Uttara Kannada': { lat: 14.5199, lon: 74.6572 },
    'Dakshina Kannada': { lat: 12.8476, lon: 75.3736 },
    'Bengaluru Urban': { lat: 12.9716, lon: 77.5946 },
  };
  return coordinates[district] || { lat: 12.97, lon: 77.59 };
};

export default function FloodPrediction() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Kodagu');
  const [rainfall, setRainfall] = useState('85');
  const [discharge, setDischarge] = useState('75');
  const [season, setSeason] = useState('60');
  const [soilMoisture, setSoilMoisture] = useState('500');
  const [temperature, setTemperature] = useState('25');
  const [humidity, setHumidity] = useState('65');
  const [latitude, setLatitude] = useState('12.97');
  const [longitude, setLongitude] = useState('77.59');
  
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [safeLocations, setSafeLocations] = useState([]);
  const [error, setError] = useState(null);
  const [sendingAlert, setSendingAlert] = useState(false);

  // Load districts on mount
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const districtsList = await getDistricts();
        setDistricts(districtsList);
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    };
    loadDistricts();
  }, []);

  // Update coordinates when district changes
  useEffect(() => {
    const coords = getDefaultCoordinates(selectedDistrict);
    setLatitude(coords.lat.toString());
    setLongitude(coords.lon.toString());
  }, [selectedDistrict]);

  const handleRunPrediction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const result = await predictFloodRisk({
        rainfall: parseFloat(rainfall),
        discharge: parseFloat(discharge),
        season: parseFloat(season),
        soil_moisture: parseFloat(soilMoisture),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });

      setPredictionResult(result);

      // Fetch safe locations if high risk
      if (result.risk_level === 'high' || result.risk_level === 'critical') {
        const locations = await getSafeLocations(parseFloat(latitude), parseFloat(longitude));
        setSafeLocations(locations);
      }
    } catch (err) {
      setError(err.message || 'Failed to run prediction. Is the backend running on localhost:5000?');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!predictionResult) return;

    setSendingAlert(true);
    try {
      const message = `🚨 FLOOD ALERT from ${selectedDistrict}
      
Risk Level: ${predictionResult.risk_level.toUpperCase()}
Confidence: ${predictionResult.confidence.toFixed(1)}%

Location: ${selectedDistrict}
Coordinates: ${latitude}, ${longitude}

⚠️ EVACUATE TO SAFE LOCATION IMMEDIATELY!`;

      await sendTelegramAlert({
        message,
        includeSafeLocation: true,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });

      alert('✓ Alert sent to Telegram successfully!');
    } catch (err) {
      alert('✗ Failed to send alert: ' + err.message);
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Flood Prediction</h1>
          <p className="text-slate-400 mt-2">
            Real-time ML-powered flood risk assessment with live Telegram alerts
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Prediction Form */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-cyan-400" />
                ML Prediction Model
              </h2>

              <form onSubmit={handleRunPrediction} className="space-y-4">
                {/* District Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" /> District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rainfall */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    <CloudRain className="h-4 w-4 inline mr-1" /> Rainfall (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={rainfall}
                    onChange={(e) => setRainfall(e.target.value)}
                    className="w-full accent-blue-400"
                  />
                  <div className="text-right text-xs text-blue-400 font-semibold mt-1">{rainfall}%</div>
                </div>

                {/* Discharge */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    <Droplets className="h-4 w-4 inline mr-1" /> Discharge (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={discharge}
                    onChange={(e) => setDischarge(e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                  <div className="text-right text-xs text-cyan-400 font-semibold mt-1">{discharge}%</div>
                </div>

                {/* Season */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" /> Season Code
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full accent-purple-400"
                  />
                  <div className="text-right text-xs text-purple-400 font-semibold mt-1">{season}</div>
                </div>

                {/* Soil Moisture */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    <Gauge className="h-4 w-4 inline mr-1" /> Soil Moisture (mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="10"
                    value={soilMoisture}
                    onChange={(e) => setSoilMoisture(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    🌡️ Temperature (°C)
                  </label>
                  <input
                    type="number"
                    min="-10"
                    max="50"
                    step="1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>

                {/* Humidity */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    💧 Humidity (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                  <div className="text-right text-xs text-cyan-400 font-semibold mt-1">{humidity}%</div>
                </div>

                {/* Latitude */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    📍 Latitude
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    📍 Longitude
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>

                {/* Run Prediction Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run Prediction
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prediction Result */}
            {predictionResult && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
                  Prediction Result
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Risk Level */}
                  <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm mb-2">RISK LEVEL</p>
                    <div className={`inline-block px-4 py-2 rounded-lg border font-bold uppercase text-lg ${getRiskBadge(predictionResult.risk_level)}`}>
                      {predictionResult.risk_level}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm mb-2">CONFIDENCE</p>
                    <p className="text-3xl font-bold text-blue-400">{predictionResult.confidence?.toFixed(1)}%</p>
                  </div>

                  {/* Timestamp */}
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">PREDICTION TIME</p>
                    <p className="text-sm text-slate-300">{new Date(predictionResult.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {/* Safe Location */}
                {predictionResult.safe_location && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                    <p className="text-green-400 font-semibold mb-2">📍 Nearest Safe Evacuation Location</p>
                    <p className="text-white font-bold text-lg">{predictionResult.safe_location.name}</p>
                    <p className="text-slate-300 text-sm mt-2">
                      Capacity: {predictionResult.safe_location.capacity} people | 
                      Type: {predictionResult.safe_location.type}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Coordinates: {predictionResult.safe_location.location[0].toFixed(4)}, {predictionResult.safe_location.location[1].toFixed(4)}
                    </p>
                  </div>
                )}

                {/* Alert Message */}
                {(predictionResult.risk_level === 'high' || predictionResult.risk_level === 'critical') && (
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 font-semibold flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        ⚠️ HIGH FLOOD RISK - IMMEDIATE ACTION REQUIRED
                      </p>
                      <p className="text-red-300 text-sm">
                        A Telegram alert has {predictionResult.alert_sent ? '✓ been sent' : 'not been sent'} with evacuation instructions and safe location details.
                      </p>
                    </div>

                    {/* Send Alert Button */}
                    <button
                      onClick={handleSendAlert}
                      disabled={sendingAlert || !predictionResult.alert_sent}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                    >
                      {sendingAlert ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Telegram Alert Now
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Parameters Summary */}
                <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-slate-400">
                  <p className="font-semibold mb-3 uppercase">Input Parameters Used</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><span className="text-slate-500">Rainfall:</span> <span className="text-cyan-400 font-bold">{rainfall}%</span></div>
                    <div><span className="text-slate-500">Discharge:</span> <span className="text-cyan-400 font-bold">{discharge}%</span></div>
                    <div><span className="text-slate-500">Soil Moisture:</span> <span className="text-cyan-400 font-bold">{soilMoisture}mm</span></div>
                    <div><span className="text-slate-500">Temp:</span> <span className="text-cyan-400 font-bold">{temperature}°C</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Forecast Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">5-Day Forecast</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Line type="monotone" dataKey="risk" stroke="#06b6d4" strokeWidth={2} name="Risk Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
