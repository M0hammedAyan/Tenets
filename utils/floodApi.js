/**
 * API utility functions for connecting React UI with Flask backend
 * Handles flood prediction, alerts, and safe location fetching
 */

const configuredApiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
export const API_BASE_URL = configuredApiBaseUrl || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000);

function createApiUrl(path, queryParams) {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured for this deployment. Set it to your backend URL in Netlify and redeploy.');
  }
  const url = new URL(`${API_BASE_URL}${path}`);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

async function requestJson(path, options = {}, timeoutMs = REQUEST_TIMEOUT_MS, queryParams = null) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(createApiUrl(path, queryParams), {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const rawBody = await response.text();
    let parsedBody = null;
    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (_error) {
        parsedBody = null;
      }
    }

    if (!response.ok) {
      const details = parsedBody?.error || parsedBody?.message || rawBody || `HTTP ${response.status}`;
      throw new Error(`Request failed (${response.status}): ${details}`);
    }

    return parsedBody || {};
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach backend API at ${API_BASE_URL || 'the configured backend URL'}. Check NEXT_PUBLIC_API_URL and backend CORS settings.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Make a prediction request to backend
 * @param {Object} params - Environmental parameters
 * @returns {Promise<Object>} Prediction response
 */
export async function predictFloodRisk(params) {
  const month = new Date().getMonth() + 1;
  const season = month >= 6 && month <= 10 ? 100 : month >= 3 && month <= 5 ? 75 : 50;
  const fallbackTemperature = 25;
  const fallbackHumidity = 70;

  return requestJson('/api/predict', {
    method: 'POST',
    body: JSON.stringify({
      district: params.district,
      rainfall_24h: params.rainfall_24h,
      rainfall_3h: params.rainfall_3h,
      river_level: params.river_level,
      elevation: params.elevation,
      soil_moisture: params.soil_moisture,
      latitude: params.latitude,
      longitude: params.longitude,
      rainfall: params.rainfall_24h,
      discharge: params.rainfall_3h,
      season,
      temperature: fallbackTemperature,
      humidity: fallbackHumidity,
    }),
  });
}

/**
 * Get all safe evacuation locations
 * @param {number} latitude - Optional: filter by nearest location
 * @param {number} longitude - Optional: filter by nearest location
 * @returns {Promise<Array>} List of safe locations
 */
export async function getSafeLocations(latitude, longitude) {
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  if (!hasCoordinates) {
    return requestJson('/api/safe-locations', { method: 'GET' });
  }
  return requestJson('/api/safe-locations', {
    method: 'GET',
  }, REQUEST_TIMEOUT_MS, {
    latitude,
    longitude,
  });
}

/**
 * Get recent alerts
 * @returns {Promise<Array>} List of recent alerts
 */
export async function getRecentAlerts() {
  return requestJson('/api/alerts', { method: 'GET' });
}

/**
 * Send a manual alert to Telegram
 * @param {Object} alertData - Alert configuration
 * @returns {Promise<Object>} Response from backend
 */
export async function sendTelegramAlert(alertData) {
  return requestJson('/api/send-alert', {
    method: 'POST',
    body: JSON.stringify({
      message: alertData.message,
      include_safe_location: alertData.includeSafeLocation || false,
      latitude: alertData.latitude,
      longitude: alertData.longitude,
    }),
  });
}

/**
 * Get all Karnataka districts
 * @returns {Promise<Array>} List of districts
 */
export async function getDistricts() {
  return requestJson('/api/districts', { method: 'GET' });
}

/**
 * Check if backend API is healthy
 * @returns {Promise<boolean>} True if backend is healthy
 */
export async function checkApiHealth() {
  try {
    await requestJson('/health', { method: 'GET' }, 5000);
    return true;
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
  const parsedDate = new Date(prediction.timestamp);
  return {
    riskLevel: prediction.risk_level,
    confidence: prediction.confidence,
    message: getRiskMessage(prediction.risk_level),
    safeLocation: prediction.safe_location,
    alertSent: prediction.alert_sent,
    timestamp: Number.isNaN(parsedDate.getTime()) ? null : parsedDate,
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
