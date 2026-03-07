import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { AlertTriangle, CloudRain, Waves, MapPin, Clock, Bell } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  // Generate sample alerts data
  useEffect(() => {
    const generateAlerts = () => {
      const sampleAlerts = [
        {
          id: 1,
          type: 'heavy_rainfall',
          title: 'Heavy Rainfall Alert',
          location: 'Kodagu District',
          message: 'Continuous heavy rainfall of 25mm/hour detected. Risk of flash floods in low-lying areas.',
          severity: 'high',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: 'active'
        },
        {
          id: 2,
          type: 'river_overflow',
          title: 'River Level Critical',
          location: 'Tungabhadra River - Hospet',
          message: 'Water level at 4.8m, approaching danger level of 5.0m. Immediate evacuation recommended.',
          severity: 'critical',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          status: 'active'
        },
        {
          id: 3,
          type: 'flood_prediction',
          title: 'Flood Prediction Alert',
          location: 'Chikmagalur District',
          message: 'ML model predicts 75% flood probability in next 12 hours based on current rainfall patterns.',
          severity: 'high',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          status: 'active'
        },
        {
          id: 4,
          type: 'heavy_rainfall',
          title: 'Moderate Rainfall Warning',
          location: 'Hassan District',
          message: 'Rainfall intensity of 15mm/hour detected. Monitor river levels closely.',
          severity: 'medium',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          status: 'active'
        },
        {
          id: 5,
          type: 'river_overflow',
          title: 'River Level Rising',
          location: 'Krishna River - Almatti',
          message: 'Water level increased by 0.5m in last 2 hours. Currently at 3.8m.',
          severity: 'medium',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
          status: 'resolved'
        },
        {
          id: 6,
          type: 'flood_prediction',
          title: 'Flood Risk Assessment',
          location: 'Uttara Kannada District',
          message: 'Based on current data, flood risk level upgraded to moderate. Stay alert.',
          severity: 'medium',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          status: 'resolved'
        }
      ];

      setAlerts(sampleAlerts);
    };

    generateAlerts();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case 'heavy_rainfall': return CloudRain;
      case 'river_overflow': return Waves;
      case 'flood_prediction': return AlertTriangle;
      default: return Bell;
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-red-500' : 'bg-green-500';
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'resolved') return alert.status === 'resolved';
    return alert.severity === filter;
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    } else {
      return `${minutes}m ago`;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Alerts & Warnings</h1>
          <p className="text-slate-300">Real-time flood alerts and early warning notifications</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Active ({alerts.filter(a => a.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'critical' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Critical ({alerts.filter(a => a.severity === 'critical').length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'high' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            High ({alerts.filter(a => a.severity === 'high').length})
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'medium' ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Medium ({alerts.filter(a => a.severity === 'medium').length})
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const Icon = getSeverityIcon(alert.type);
            return (
              <div key={alert.id} className="bg-slate-800 rounded-lg p-6 border-l-4 border-l-cyan-500">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-slate-700">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(alert.status)}`}></div>
                          <span className="text-xs text-slate-400 capitalize">{alert.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{alert.location}</span>
                      </div>
                      <p className="text-slate-300 mb-3">{alert.message}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Alerts</p>
                <p className="text-2xl font-bold text-white">{alerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Alerts</p>
                <p className="text-2xl font-bold text-white">{alerts.filter(a => a.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Critical Alerts</p>
                <p className="text-2xl font-bold text-white">{alerts.filter(a => a.severity === 'critical').length}</p>
              </div>
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Resolved Today</p>
                <p className="text-2xl font-bold text-white">{alerts.filter(a => a.status === 'resolved').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Types Legend */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Alert Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CloudRain className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Heavy Rainfall</p>
                <p className="text-slate-400 text-sm">Intense precipitation alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Waves className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-white font-medium">River Overflow</p>
                <p className="text-slate-400 text-sm">Critical water level warnings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-white font-medium">Flood Prediction</p>
                <p className="text-slate-400 text-sm">ML-based flood risk alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}