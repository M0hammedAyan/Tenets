import Layout from '../components/Layout';
import { MapPin, Users, Clock, Route, AlertTriangle, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import map component
const EvacuationRoutesMap = dynamic(() => import('../maps/EvacuationRoutesMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-800 rounded-xl animate-pulse" />
});

// Sample evacuation zones data
const evacuationZones = [
  { zone: 'Kodagu Lowlands', priority: 'High', population: 45000, routes: 3, shelters: 8, status: 'Active' },
  { zone: 'Chikmagalur Valley', priority: 'High', population: 32000, routes: 2, shelters: 6, status: 'Active' },
  { zone: 'Hassan Flood Plains', priority: 'Medium', population: 28000, routes: 2, shelters: 5, status: 'Standby' },
  { zone: 'Uttara Kannada Coastal', priority: 'Medium', population: 25000, routes: 3, shelters: 4, status: 'Standby' },
  { zone: 'Dakshina Kannada Delta', priority: 'Low', population: 35000, routes: 2, shelters: 7, status: 'Monitor' }
];

// Sample emergency shelters
const emergencyShelters = [
  { name: 'Government School - Madikeri', capacity: 500, occupied: 0, status: 'Ready', distance: '2.1 km' },
  { name: 'Community Hall - Kushalnagar', capacity: 300, occupied: 0, status: 'Ready', distance: '1.8 km' },
  { name: 'Temple Complex - Somwarpet', capacity: 400, occupied: 0, status: 'Ready', distance: '3.2 km' },
  { name: 'Sports Stadium - Chikmagalur', capacity: 800, occupied: 0, status: 'Ready', distance: '4.5 km' },
  { name: 'College Auditorium - Hassan', capacity: 600, occupied: 0, status: 'Ready', distance: '2.9 km' }
];

// Sample evacuation routes
const evacuationRoutes = [
  { route: 'Route A - Madikeri Highway', status: 'Clear', traffic: 'Light', eta: '15 min' },
  { route: 'Route B - Forest Road', status: 'Clear', traffic: 'Light', eta: '22 min' },
  { route: 'Route C - River Bridge', status: 'Caution', traffic: 'Moderate', eta: '18 min' },
  { route: 'Route D - Hill Path', status: 'Blocked', traffic: 'Heavy', eta: 'N/A' }
];

const getPriorityBadge = (priority) => {
  switch (priority.toLowerCase()) {
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

const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'ready':
    case 'clear':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'standby':
    case 'caution':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    case 'monitor':
    case 'blocked':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
};

export default function EvacuationPlanning() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Evacuation Planning</h1>
          <p className="text-slate-400 mt-2">
            Emergency evacuation routes, shelter locations, and population management for flood-affected areas
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">At Risk Population</p>
                <p className="text-2xl font-bold text-white mt-1">165K</p>
                <p className="text-sm text-slate-500">5 high-risk zones</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 text-red-400">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Available Shelters</p>
                <p className="text-2xl font-bold text-white mt-1">30</p>
                <p className="text-sm text-slate-500">3,600 total capacity</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 text-green-400">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Active Routes</p>
                <p className="text-2xl font-bold text-white mt-1">8</p>
                <p className="text-sm text-slate-500">3 with caution</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 text-orange-400">
                <Route className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Response Time</p>
                <p className="text-2xl font-bold text-white mt-1">18 min</p>
                <p className="text-sm text-slate-500">Average evacuation</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 text-cyan-400">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evacuation Routes Map */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Evacuation Routes & Shelters</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-green-500 rounded"></div>
                  <span className="text-slate-300">Safe Routes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-orange-500 rounded"></div>
                  <span className="text-slate-300">Caution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-red-500 rounded"></div>
                  <span className="text-slate-300">Blocked</span>
                </div>
              </div>
            </div>
            <div className="h-80 rounded-lg overflow-hidden">
              <EvacuationRoutesMap />
            </div>
          </div>

          {/* Evacuation Routes Status */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Route Status</h2>
            <div className="space-y-4">
              {evacuationRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      route.status === 'Clear' ? 'bg-green-500' :
                      route.status === 'Caution' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-white">{route.route}</p>
                      <p className="text-xs text-slate-400">Traffic: {route.traffic}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(route.status)}`}>
                      {route.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">ETA: {route.eta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evacuation Zones and Shelters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evacuation Zones */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Evacuation Zones</h2>
            <div className="space-y-4">
              {evacuationZones.map((zone, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">{zone.zone}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(zone.priority)}`}>
                      {zone.priority}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
                    <div>
                      <span className="block text-slate-500">Population</span>
                      <span className="text-white font-medium">{zone.population.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Routes</span>
                      <span className="text-white font-medium">{zone.routes}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Shelters</span>
                      <span className="text-white font-medium">{zone.shelters}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(zone.status)}`}>
                      {zone.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Shelters */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Emergency Shelters</h2>
            <div className="space-y-4">
              {emergencyShelters.map((shelter, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">{shelter.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(shelter.status)}`}>
                      {shelter.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
                    <div>
                      <span className="block text-slate-500">Capacity</span>
                      <span className="text-white font-medium">{shelter.capacity}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Occupied</span>
                      <span className="text-white font-medium">{shelter.occupied}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Distance</span>
                      <span className="text-white font-medium">{shelter.distance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Emergency Response Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="flex items-center justify-center px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Initiate Evacuation
            </button>
            <button className="flex items-center justify-center px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors">
              <Users className="h-5 w-5 mr-2" />
              Deploy Rescue Teams
            </button>
            <button className="flex items-center justify-center px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors">
              <Shield className="h-5 w-5 mr-2" />
              Update Route Status
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}