import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Dynamically import map components to avoid SSR issues
const RiverStationsMap = dynamic(() => import('../maps/RiverStationsMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-800 rounded-lg flex items-center justify-center">Loading Map...</div>
});

export default function RiverMonitoring() {
  const [riverData, setRiverData] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [maxLevel, setMaxLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  // Generate sample 24-hour river level trend data
  useEffect(() => {
    const generateRiverData = () => {
      const data = [];
      const now = new Date();

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = time.getHours();
        // Simulate river level fluctuations with seasonal patterns
        const baseLevel = 2.5;
        const seasonalVariation = Math.sin((hour - 6) * Math.PI / 12) * 0.8;
        const randomVariation = (Math.random() - 0.5) * 0.3;
        const level = Math.max(0, baseLevel + seasonalVariation + randomVariation);

        data.push({
          time: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          level: Math.round(level * 100) / 100,
          status: level > 4 ? 'Critical' : level > 3 ? 'Warning' : 'Normal'
        });
      }

      setRiverData(data);
      setCurrentLevel(data[data.length - 1].level);
      setMaxLevel(Math.max(...data.map(d => d.level)));
      setLoading(false);
    };

    generateRiverData();
    const interval = setInterval(generateRiverData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical': return '#dc2626';
      case 'Warning': return '#ea580c';
      case 'Normal': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getRiskLevel = (level) => {
    if (level > 4) return { level: 'Critical', color: '#dc2626' };
    if (level > 3) return { level: 'Warning', color: '#ea580c' };
    return { level: 'Normal', color: '#16a34a' };
  };

  const currentRisk = getRiskLevel(currentLevel);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-2">River Monitoring</h1>
          <p className="text-slate-300">Real-time river water levels and monitoring stations across Karnataka</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Current River Level</p>
                <p className="text-2xl font-bold text-white">{currentLevel} m</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{currentLevel > 4 ? 'C' : currentLevel > 3 ? 'W' : 'N'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">24h Max Level</p>
                <p className="text-2xl font-bold text-white">{maxLevel} m</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">MAX</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Status</p>
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
          <h2 className="text-xl font-bold text-white mb-4">24-Hour River Level Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riverData}>
                <defs>
                  <linearGradient id="riverGradient" x1="0" y1="0" x2="0" y2="1">
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
                  label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
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
                  dataKey="level"
                  stroke="#22d3ee"
                  fillOpacity={1}
                  fill="url(#riverGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* River Stations Map */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">River Monitoring Stations</h2>
          <div className="h-96">
            <RiverStationsMap />
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Water Level Status Scale</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-slate-300">Normal (&lt; 3m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-slate-300">Warning (3-4m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-slate-300">Critical (&gt; 4m)</span>
            </div>
          </div>
        </div>

        {/* River Stations Table */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Monitoring Stations Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Station</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">River</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Current Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { station: 'Kaveri Bridge', river: 'Kaveri', level: 2.8, status: 'Normal' },
                  { station: 'Tungabhadra Dam', river: 'Tungabhadra', level: 3.2, status: 'Warning' },
                  { station: 'Krishna Barrage', river: 'Krishna', level: 4.1, status: 'Critical' },
                  { station: 'Sharavati Falls', river: 'Sharavati', level: 2.5, status: 'Normal' },
                  { station: 'Cauvery Sagar', river: 'Kaveri', level: 3.8, status: 'Warning' }
                ].map((station, index) => (
                  <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{station.station}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{station.river}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{station.level} m</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        station.status === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        station.status === 'Warning' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {station.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">2 min ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

