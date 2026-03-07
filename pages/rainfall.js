import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { fetchAllDistrictsWeather, fetchRainfallForecast } from '../utils/mapApi';

// Dynamically import map components to avoid SSR issues
const RainfallHeatmapMap = dynamic(() => import('../maps/RainfallHeatmapMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-800 rounded-lg flex items-center justify-center">Loading Map...</div>
});

export default function RainfallMonitoring() {
  const [rainfallData, setRainfallData] = useState([]);
  const [districtWeather, setDistrictWeather] = useState([]);
  const [currentRainfall, setCurrentRainfall] = useState(0);
  const [maxRainfall, setMaxRainfall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('Kodagu');

  // Fetch live weather data for all districts
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const weatherData = await fetchAllDistrictsWeather();
        setDistrictWeather(weatherData);

        // Generate 24-hour trend data based on weather forecast
        const forecastData = await fetchRainfallForecast(selectedDistrict);
        if (forecastData && forecastData.forecast) {
          const trendData = forecastData.forecast.slice(0, 8).map((item, index) => ({
            time: new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            rainfall: item.rainfall || 0,
            intensity: (item.rainfall || 0) > 10 ? 'Heavy' : (item.rainfall || 0) > 5 ? 'Moderate' : 'Light'
          }));

          setRainfallData(trendData);
          setCurrentRainfall(trendData[trendData.length - 1]?.rainfall || 0);
          setMaxRainfall(Math.max(...trendData.map(d => d.rainfall)));
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedDistrict]);

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Heavy': return '#dc2626';
      case 'Moderate': return '#ea580c';
      case 'Light': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getRiskLevel = (rainfall) => {
    if (rainfall > 10) return { level: 'High Risk', color: '#dc2626' };
    if (rainfall > 5) return { level: 'Moderate Risk', color: '#ea580c' };
    return { level: 'Low Risk', color: '#16a34a' };
  };

  const currentRisk = getRiskLevel(currentRainfall);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Rainfall Monitoring</h1>
              <p className="text-slate-300">Real-time rainfall intensity across Karnataka districts</p>
            </div>
            <div className="mt-4 md:mt-0">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {districtWeather.map((district) => (
                  <option key={district.district} value={district.district}>
                    {district.district}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Current Rainfall ({selectedDistrict})</p>
                <p className="text-2xl font-bold text-white">{currentRainfall} mm</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{currentRainfall > 10 ? 'H' : currentRainfall > 5 ? 'M' : 'L'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">State Max Rainfall</p>
                <p className="text-2xl font-bold text-white">
                  {districtWeather.length > 0 ? Math.max(...districtWeather.map(d => d.rainfall || 0)) : 0} mm
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">MAX</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Risk Level</p>
                <p className="text-2xl font-bold" style={{ color: currentRisk.color }}>{currentRisk.level}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: currentRisk.color }}>
                <span className="text-white font-bold">!</span>
              </div>
            </div>
          </div>
        </div>

        {/* 24-Hour Trend Chart */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">24-Hour Rainfall Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainfallData}>
                <defs>
                  <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Area
                  type="monotone"
                  dataKey="rainfall"
                  stroke="#22d3ee"
                  fillOpacity={1}
                  fill="url(#rainfallGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rainfall Heatmap Map */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Rainfall Intensity Heatmap</h2>
          <div className="h-96">
            <RainfallHeatmapMap />
          </div>
        </div>

        {/* Intensity Legend */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Rainfall Intensity Scale</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-slate-300">Light (&lt; 5mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-slate-300">Moderate (5-10mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-slate-300">Heavy (&gt; 10mm)</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

