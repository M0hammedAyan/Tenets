// API endpoint for fetching live map locations
// pages/api/locations.js

const API_KEY = process.env.NEXT_PUBLIC_MAP_API_KEY;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Sample data structure - replace with actual backend calls
const sampleLocations = {
  monitoring_stations: [
    { id: 1, name: 'Kodagu Station', lat: 12.3382, lng: 75.2241, level: 4.2, status: 'active' },
    { id: 2, name: 'Chikmagalur Station', lat: 13.3172, lng: 75.7139, level: 3.8, status: 'active' },
    { id: 3, name: 'Hassan Station', lat: 13.2010, lng: 75.9489, level: 3.5, status: 'active' },
    { id: 4, name: 'Uttara Kannada Station', lat: 14.5994, lng: 74.6510, level: 4.9, status: 'active' },
    { id: 5, name: 'Dakshina Kannada Station', lat: 12.9352, lng: 75.5597, level: 3.1, status: 'active' },
  ],
  rainfall: [
    { id: 101, district: 'Kodagu', lat: 12.3382, lng: 75.2241, rainfall_24h: 92.1, rainfall_3h: 15.3, intensity: 'moderate' },
    { id: 102, district: 'Chikmagalur', lat: 13.3172, lng: 75.7139, rainfall_24h: 67.8, rainfall_3h: 8.9, intensity: 'low' },
    { id: 103, district: 'Hassan', lat: 13.2010, lng: 75.9489, rainfall_24h: 45.3, rainfall_3h: 5.1, intensity: 'low' },
    { id: 104, district: 'Uttara Kannada', lat: 14.5994, lng: 74.6510, rainfall_24h: 125.6, rainfall_3h: 22.4, intensity: 'high' },
    { id: 105, district: 'Dakshina Kannada', lat: 12.9352, lng: 75.5597, rainfall_24h: 38.7, rainfall_3h: 3.2, intensity: 'low' },
  ],
  river_stations: [
    { id: 201, river: 'Kaveri', location: 'Kodagu', lat: 12.3382, lng: 75.2241, level: 4.2, normal_level: 3.5, alert_level: 4.5, danger_level: 5.0 },
    { id: 202, river: 'Bhadra', location: 'Chikmagalur', lat: 13.3172, lng: 75.7139, level: 3.8, normal_level: 3.0, alert_level: 4.0, danger_level: 4.8 },
    { id: 203, river: 'Hemavati', location: 'Hassan', lat: 13.2010, lng: 75.9489, level: 3.5, normal_level: 2.8, alert_level: 3.8, danger_level: 4.5 },
    { id: 204, river: 'Malaprabha', location: 'Uttara Kannada', lat: 14.5994, lng: 74.6510, level: 4.9, normal_level: 3.2, alert_level: 4.2, danger_level: 5.5 },
    { id: 205, river: 'Nethravati', location: 'Dakshina Kannada', lat: 12.9352, lng: 75.5597, level: 3.1, normal_level: 2.5, alert_level: 3.5, danger_level: 4.2 },
  ],
  evacuation: [
    { id: 301, name: 'Kodagu Evacuation Center', lat: 12.3382, lng: 75.2241, capacity: 500, occupied: 120, type: 'shelter' },
    { id: 302, name: 'Chikmagalur Relief Point', lat: 13.3172, lng: 75.7139, capacity: 300, occupied: 45, type: 'relief_point' },
    { id: 303, name: 'Hassan Emergency Station', lat: 13.2010, lng: 75.9489, capacity: 400, occupied: 0, type: 'shelter' },
  ],
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, type = 'monitoring_stations', district, limit = 50 } = req.query;

  // Verify API key
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  try {
    let locations = sampleLocations[type] || [];

    // Filter by district if provided
    if (district && locations.length > 0) {
      locations = locations.filter(loc => 
        loc.district?.toLowerCase() === district.toLowerCase() ||
        loc.location?.toLowerCase() === district.toLowerCase()
      );
    }

    // Limit results
    locations = locations.slice(0, parseInt(limit));

    return res.status(200).json({
      success: true,
      type,
      count: locations.length,
      locations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Location API error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch locations' 
    });
  }
}
