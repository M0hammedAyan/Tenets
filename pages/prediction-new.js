import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Zap, RefreshCw, AlertTriangle, Send } from 'lucide-react';
import { predictFloodRisk, getSafeLocations, sendTelegramAlert } from '../utils/floodApi';

export default function FloodPrediction() {
  const [selectedDistrict, setSelectedDistrict] = useState('Kodagu');
  const [rainfall24h, setRainfall24h] = useState('85');
  const [rainfall3h, setRainfall3h] = useState('15');
  const [riverLevel, setRiverLevel] = useState('4.9');
  const [elevation, setElevation] = useState('800');
  const [soilMoisture, setSoilMoisture] = useState('78.2');
  
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [safeLocations, setSafeLocations] = useState([]);
  const [error, setError] = useState(null);
  const [sendingAlert, setSendingAlert] = useState(false);

  const districts = [
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bijapur', 'Chikballapur', 'Chikmagalur', 'Chitradurga', 'Dakshina Kannada',
    'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu',
    'Kolar', 'Koppal', 'Mandya', 'Mangaluru', 'Mysuru', 'Raichur', 'Ramanagara',
    'Shivamogga', 'Tumkur', 'Udupi', 'Uttara Kannada', 'Vikarabad', 'Vijayapura', 'Yadgir'
  ];

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

  const [latitude, setLatitude] = useState(getDefaultCoordinates('Kodagu').lat.toString());
  const [longitude, setLongitude] = useState(getDefaultCoordinates('Kodagu').lon.toString());

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
        rainfall: parseFloat(rainfall24h),
        discharge: parseFloat(rainfall3h) * 5, // Convert to discharge percentage
        season: 60,
        soil_moisture: parseFloat(soilMoisture) * 10,
        temperature: 25,
        humidity: 65,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });

      setPredictionResult(result);

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

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return '#7f1d1d';
      case 'high':
        return '#991b1b';
      case 'medium':
        return '#b45309';
      case 'low':
        return '#166534';
      default:
        return '#374151';
    }
  };

  const getRiskBgColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return 'bg-red-950';
      case 'high':
        return 'bg-red-900';
      case 'medium':
        return 'bg-yellow-900';
      case 'low':
        return 'bg-green-900';
      default:
        return 'bg-gray-800';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">Flood Prediction</h1>
          <p className="text-slate-400 mt-2">
            AI-powered flood risk assessment using machine learning models and real-time data
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-8">Prediction Parameters</h2>

              <form onSubmit={handleRunPrediction} className="space-y-6">
                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    🗺️ District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rainfall 24h */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    🌧️ Rainfall (mm/24h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="1"
                    value={rainfall24h}
                    onChange={(e) => setRainfall24h(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Rainfall 3h */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    🌧️ Rainfall (mm/3h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="1"
                    value={rainfall3h}
                    onChange={(e) => setRainfall3h(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* River Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    💧 River Level (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={riverLevel}
                    onChange={(e) => setRiverLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Elevation Slider */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 flex justify-between">
                    <span>⛰️ Elevation (m)</span>
                    <span className="text-yellow-400 font-bold">{elevation} m</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="10"
                    value={elevation}
                    onChange={(e) => setElevation(e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>0 - 2000 m</span>
                  </div>
                </div>

                {/* Soil Moisture Slider */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 flex justify-between">
                    <span>💧 Soil Moisture (%)</span>
                    <span className="text-green-400 font-bold">{soilMoisture}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={soilMoisture}
                    onChange={(e) => setSoilMoisture(e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>0% - 100%</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center text-lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Run Flood Prediction
                    </>
                  )}
                </button>
              </form>

              {/* Current Input Summary */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <p className="text-xs font-bold text-slate-400 mb-4 uppercase">Current Input Summary</p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>District:</span>
                    <span className="text-cyan-400 font-bold">{selectedDistrict}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rainfall (24h):</span>
                    <span className="text-blue-400 font-bold">{rainfall24h} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rainfall (3h):</span>
                    <span className="text-blue-400 font-bold">{rainfall3h} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>River Level:</span>
                    <span className="text-cyan-400 font-bold">{riverLevel} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elevation:</span>
                    <span className="text-yellow-400 font-bold">{elevation} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soil Moisture:</span>
                    <span className="text-green-400 font-bold">{soilMoisture}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Weather Section */}
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                🌤️ Current Weather - {selectedDistrict}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-xs mb-2">Temperature</p>
                  <p className="text-3xl font-bold text-cyan-400">18.2°C</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-xs mb-2">Humidity</p>
                  <p className="text-3xl font-bold text-cyan-400">93%</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-xs mb-2">Wind Speed</p>
                  <p className="text-3xl font-bold text-cyan-400">0.66 m/s</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-xs mb-2">Conditions</p>
                  <p className="text-xl font-bold text-cyan-400">Clouds</p>
                  <p className="text-xs text-slate-400">broken clouds</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">Last updated: 07/03/2026, 03:49:09</p>
            </div>

            {/* Flood Risk Assessment Result */}
            {predictionResult && (
              <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center">
                  <span className="text-cyan-400 mr-2">⚙️</span>
                  Flood Risk Assessment Result
                </h3>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  {/* Risk Score Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center mb-4 border-4"
                      style={{
                        borderColor: getRiskColor(predictionResult.risk_level),
                        backgroundColor: getRiskColor(predictionResult.risk_level) + '30',
                      }}
                    >
                      <div className="text-center">
                        <p className="text-4xl font-black text-white">
                          {predictionResult.confidence.toFixed(0)}%
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Risk Score</p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Level Badge */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`${getRiskBgColor(predictionResult.risk_level)} border-2`}
                      style={{ borderColor: getRiskColor(predictionResult.risk_level) }}
                    >
                      <p className="px-6 py-3 text-white font-black text-2xl">
                        {predictionResult.risk_level.toUpperCase()} RISK
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Risk Level</p>
                  </div>

                  {/* Confidence Score */}
                  <div className="flex flex-col items-center">
                    <div className="text-center">
                      <p className="text-5xl font-black text-green-400">
                        {predictionResult.confidence.toFixed(0)}%
                      </p>
                      <p className="text-xs text-slate-400 mt-4">Model Confidence</p>
                    </div>
                  </div>
                </div>

                {/* Safe Location */}
                {predictionResult.safe_location && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
                    <p className="text-green-400 font-bold mb-2">📍 Nearest Safe Evacuation Location</p>
                    <p className="text-white font-bold text-lg">{predictionResult.safe_location.name}</p>
                    <p className="text-slate-300 text-sm mt-2">
                      Capacity: {predictionResult.safe_location.capacity} people | Type: {predictionResult.safe_location.type}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {(predictionResult.risk_level === 'high' || predictionResult.risk_level === 'critical') && (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
                    <p className="text-red-400 font-bold mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      ⚠️ HIGH FLOOD RISK - IMMEDIATE ACTION REQUIRED
                    </p>
                    <button
                      onClick={handleSendAlert}
                      disabled={sendingAlert}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center"
                    >
                      {sendingAlert ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Sending Telegram Alert...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Telegram Alert Now
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
