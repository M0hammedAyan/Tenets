/**
 * Local flood prediction utilities.
 * Runs entirely in the browser so the deployed app does not need a separate backend.
 */

const RISK_CRITICAL = 'critical';
const RISK_HIGH = 'high';
const RISK_MEDIUM = 'medium';
const RISK_LOW = 'low';
const HIGH_RISK_LEVELS = new Set([RISK_HIGH, RISK_CRITICAL]);

const DISTRICTS = [
  'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
  'Bijapur', 'Chikballapur', 'Chikmagalur', 'Chitradurga', 'Dakshina Kannada',
  'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu',
  'Kolar', 'Koppal', 'Mandya', 'Mangaluru', 'Mysuru', 'Raichur', 'Ramanagara',
  'Shivamogga', 'Tumkur', 'Udupi', 'Uttara Kannada', 'Vikarabad', 'Vijayapura', 'Yadgir',
];

const SAFE_LOCATIONS = [
  {
    id: 1,
    name: 'Kodagu High School - Evacuation Center',
    location: [12.4392, 75.4991],
    capacity: 500,
    type: 'Educational Building',
  },
  {
    id: 2,
    name: 'Hassan District Hospital',
    location: [13.3346, 75.9352],
    capacity: 300,
    type: 'Hospital',
  },
  {
    id: 3,
    name: 'Uttara Kannada Community Center',
    location: [14.5199, 74.6572],
    capacity: 400,
    type: 'Community Center',
  },
  {
    id: 4,
    name: 'Chikmagalur National Park Office',
    location: [13.3181, 75.4619],
    capacity: 200,
    type: 'Government Building',
  },
  {
    id: 5,
    name: 'Dakshina Kannada Stadium',
    location: [12.8476, 75.3736],
    capacity: 1000,
    type: 'Sports Complex',
  },
];

function clamp(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, value));
}

function parseNumberField(params, key, minValue, maxValue) {
  const parsed = Number(params[key]);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${key}`);
  }
  if (parsed < minValue) {
    throw new Error(`${key} must be >= ${minValue}`);
  }
  if (parsed > maxValue) {
    throw new Error(`${key} must be <= ${maxValue}`);
  }
  return parsed;
}

function normalizePredictionPayload(params) {
  const district = String(params.district || 'Kodagu').trim() || 'Kodagu';
  if (district.length > 64) {
    throw new Error('district is too long');
  }

  return {
    district,
    rainfall_24h: parseNumberField(params, 'rainfall_24h', 0, 1000),
    rainfall_3h: parseNumberField(params, 'rainfall_3h', 0, 500),
    river_level: parseNumberField(params, 'river_level', 0, 50),
    elevation: parseNumberField(params, 'elevation', -500, 9000),
    soil_moisture: parseNumberField(params, 'soil_moisture', 0, 100),
    latitude: parseNumberField(params, 'latitude', -90, 90),
    longitude: parseNumberField(params, 'longitude', -180, 180),
  };
}

function districtFactor(district) {
  const highRiskDistricts = new Set([
    'Kodagu', 'Uttara Kannada', 'Dakshina Kannada', 'Udupi', 'Shivamogga', 'Chikmagalur',
  ]);
  const mediumRiskDistricts = new Set([
    'Hassan', 'Mysuru', 'Mandya', 'Belagavi', 'Dharwad', 'Davangere',
  ]);

  if (highRiskDistricts.has(district)) {
    return 1.0;
  }
  if (mediumRiskDistricts.has(district)) {
    return 0.8;
  }
  return 0.65;
}

function classifyRisk(riskScore) {
  if (riskScore >= 0.75) {
    return RISK_CRITICAL;
  }
  if (riskScore >= 0.55) {
    return RISK_HIGH;
  }
  if (riskScore >= 0.35) {
    return RISK_MEDIUM;
  }
  return RISK_LOW;
}

function calculateRiskScore(data) {
  const rain24Score = clamp(data.rainfall_24h / 250.0, 0.0, 1.0);
  const rain3Score = clamp(data.rainfall_3h / 80.0, 0.0, 1.0);
  const riverScore = clamp(data.river_level / 8.0, 0.0, 1.0);
  const elevationScore = 1.0 - clamp(data.elevation / 1200.0, 0.0, 1.0);
  const soilScore = clamp(data.soil_moisture / 100.0, 0.0, 1.0);
  const districtScore = districtFactor(data.district);

  const baseScore = (
    0.28 * rain24Score
    + 0.16 * rain3Score
    + 0.30 * riverScore
    + 0.12 * elevationScore
    + 0.10 * soilScore
    + 0.04 * districtScore
  );

  let interactionBonus = 0.0;
  if (data.rainfall_24h >= 120 && data.river_level >= 5.0) {
    interactionBonus += 0.12;
  }
  if (data.rainfall_3h >= 35 && data.soil_moisture >= 70) {
    interactionBonus += 0.10;
  }
  if (data.elevation <= 250 && data.river_level >= 4.0) {
    interactionBonus += 0.08;
  }

  let riskFloor = 0.0;
  if (data.rainfall_24h >= 130) {
    riskFloor = Math.max(riskFloor, 0.40);
  }
  if (data.rainfall_3h >= 35) {
    riskFloor = Math.max(riskFloor, 0.38);
  }
  if (data.river_level >= 5.5) {
    riskFloor = Math.max(riskFloor, 0.55);
  }
  if (data.elevation <= 250 && data.river_level >= 4.0) {
    riskFloor = Math.max(riskFloor, 0.60);
  }
  if (data.soil_moisture >= 80 && data.rainfall_24h >= 90) {
    riskFloor = Math.max(riskFloor, 0.55);
  }

  const riskScore = clamp(Math.max(baseScore + interactionBonus, riskFloor), 0.0, 1.0);

  return {
    riskScore,
    components: {
      rainfall_24h_score: Number(rain24Score.toFixed(3)),
      rainfall_3h_score: Number(rain3Score.toFixed(3)),
      river_level_score: Number(riverScore.toFixed(3)),
      elevation_score: Number(elevationScore.toFixed(3)),
      soil_moisture_score: Number(soilScore.toFixed(3)),
      district_score: Number(districtScore.toFixed(3)),
      interaction_bonus: Number(interactionBonus.toFixed(3)),
      risk_floor: Number(riskFloor.toFixed(3)),
    },
  };
}

function findNearestSafeLocation(latitude, longitude) {
  return SAFE_LOCATIONS.reduce((nearest, candidate) => {
    const nearestDistance = Math.hypot(nearest.location[0] - latitude, nearest.location[1] - longitude);
    const candidateDistance = Math.hypot(candidate.location[0] - latitude, candidate.location[1] - longitude);
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}

export const API_BASE_URL = '';

export async function predictFloodRisk(params) {
  const normalized = normalizePredictionPayload(params);
  const { riskScore, components } = calculateRiskScore(normalized);
  const riskLevel = classifyRisk(riskScore);
  const safeLocation = HIGH_RISK_LEVELS.has(riskLevel)
    ? findNearestSafeLocation(normalized.latitude, normalized.longitude)
    : null;

  return {
    prediction: riskScore,
    rule_score: riskScore,
    risk_level: riskLevel,
    confidence: Number((riskScore * 100).toFixed(2)),
    parameters: normalized,
    score_breakdown: components,
    safe_location: safeLocation,
    alert_sent: false,
    timestamp: new Date().toISOString(),
  };
}

export async function getSafeLocations(latitude, longitude) {
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  if (!hasCoordinates) {
    return SAFE_LOCATIONS;
  }

  return [...SAFE_LOCATIONS].sort((left, right) => {
    const leftDistance = Math.hypot(left.location[0] - latitude, left.location[1] - longitude);
    const rightDistance = Math.hypot(right.location[0] - latitude, right.location[1] - longitude);
    return leftDistance - rightDistance;
  });
}

export async function getRecentAlerts() {
  return [];
}

export async function sendTelegramAlert() {
  return {
    success: false,
    message: 'Telegram alerts are disabled in this deployment.',
  };
}

export async function getDistricts() {
  return DISTRICTS;
}

export async function checkApiHealth() {
  return true;
}

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

function getRiskMessage(riskLevel) {
  const messages = {
    critical: 'CRITICAL - Immediate evacuation required!',
    high: 'HIGH - Evacuate to safe location immediately',
    medium: 'MEDIUM - Monitor situation and stay alert',
    low: 'LOW - No immediate flood risk detected',
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
