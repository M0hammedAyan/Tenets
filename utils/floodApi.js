/**
 * API utility functions for connecting React UI with Flask backend
 * Handles flood prediction, alerts, and safe location fetching
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Make a prediction request to backend
 * @param {Object} params - Environmental parameters
 * @returns {Promise<Object>} Prediction response
 */
export async function predictFloodRisk(params) {
  try {
    const month = new Date().getMonth() + 1;
    const season = month >= 6 && month <= 10 ? 100 : month >= 3 && month <= 5 ? 75 : 50;
    const fallbackTemperature = 25;
    const fallbackHumidity = 70;

    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // New schema
        district: params.district,
        rainfall_24h: params.rainfall_24h,
        rainfall_3h: params.rainfall_3h,
        river_level: params.river_level,
        elevation: params.elevation,
        soil_moisture: params.soil_moisture,
        latitude: params.latitude,
        longitude: params.longitude,

        // Legacy schema fallback (for older backend versions still running)
        rainfall: params.rainfall_24h,
        discharge: params.rainfall_3h,
        season,
        temperature: fallbackTemperature,
        humidity: fallbackHumidity,
      }),
    });

    if (!response.ok) {
      let details = '';
      try {
        const errorData = await response.json();
        details = errorData?.error ? ` - ${errorData.error}` : '';
      } catch (_e) {
        // Ignore JSON parse errors and keep status-only message.
      }
      throw new Error(`HTTP error! status: ${response.status}${details}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error predicting flood risk:', error);
    if (error instanceof TypeError) {
      throw new Error('Unable to reach backend API at http://localhost:5000. Start backend/flask_api.py and try again.');
    }
    throw error;
  }
}

/**
 * Get all safe evacuation locations
 * @param {number} latitude - Optional: filter by nearest location
 * @param {number} longitude - Optional: filter by nearest location
 * @returns {Promise<Array>} List of safe locations
 */
export async function getSafeLocations(latitude, longitude) {
  try {
    const params = new URLSearchParams();
    if (latitude && longitude) {
      params.append('latitude', latitude);
      params.append('longitude', longitude);
    }

    const url = `${API_BASE_URL}/api/safe-locations${params.toString() ? '?' + params : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching safe locations:', error);
    throw error;
  }
}

/**
 * Get recent alerts
 * @returns {Promise<Array>} List of recent alerts
 */
export async function getRecentAlerts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
}

/**
 * Send a manual alert to Telegram
 * @param {Object} alertData - Alert configuration
 * @returns {Promise<Object>} Response from backend
 */
export async function sendTelegramAlert(alertData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: alertData.message,
        include_safe_location: alertData.includeSafeLocation || false,
        latitude: alertData.latitude,
        longitude: alertData.longitude,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
    throw error;
  }
}

/**
 * Get all Karnataka districts
 * @returns {Promise<Array>} List of districts
 */
export async function getDistricts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/districts`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
}

/**
 * Check if backend API is healthy
 * @returns {Promise<boolean>} True if backend is healthy
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Format prediction response for display
 * @param {Object} prediction - Raw prediction from backend
 * @returns {Object} Formatted prediction data
 */
export function formatPredictionResponse(prediction) {
  return {
    riskLevel: prediction.risk_level,
    confidence: prediction.confidence,
    message: getRiskMessage(prediction.risk_level),
    safeLocation: prediction.safe_location,
    alertSent: prediction.alert_sent,
    timestamp: new Date(prediction.timestamp),
  };
}

/**
 * Get user-friendly risk message
 * @param {string} riskLevel - Risk level from model
 * @returns {string} User-friendly message
 */
function getRiskMessage(riskLevel) {
  const messages = {
    critical: '🚨 CRITICAL - Immediate evacuation required!',
    high: '⚠️ HIGH - Evacuate to safe location immediately',
    medium: '⚠️ MEDIUM - Monitor situation and stay alert',
    low: '✓ LOW - No immediate flood risk detected',
  };
  return messages[riskLevel] || 'Unknown risk level';
}

export default {
  predictFloodRisk,
  getSafeLocations,
  getRecentAlerts,
  sendTelegramAlert,
  getDistricts,
  checkApiHealth,
  formatPredictionResponse,
};
