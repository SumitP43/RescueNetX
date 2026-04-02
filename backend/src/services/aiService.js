const axios = require('axios');
const RiskData = require('../models/RiskData');
const { emitRiskUpdate } = require('../sockets/socketHandlers');
const logger = require('../utils/logger');

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Generate a mock AI response when the real service is unavailable.
 */
function mockResponse(endpoint, data) {
  logger.warn(`AI service unavailable — returning mock response for ${endpoint}`);
  return {
    mock: true,
    note: 'AI service is offline. This is a mock response.',
    input: data,
    result: {
      risk_level: 'medium',
      confidence_score: 0.5,
      recommendations: ['Deploy nearest rescue team', 'Establish communication relay'],
      priority_order: [],
      allocation: [],
    },
  };
}

/**
 * Post to the AI service with a timeout, falling back to mock on failure.
 */
async function postToAI(path, data) {
  try {
    const res = await axios.post(`${AI_URL()}${path}`, data, { timeout: 5000 });
    return res.data;
  } catch {
    return mockResponse(path, data);
  }
}

/**
 * Analyse risk at a location, persist the result, and broadcast it.
 */
async function analyzeRisk(data) {
  const aiResult = await postToAI('/risk', data);

  const riskEntry = await RiskData.create({
    risk_type: data.risk_type || 'general',
    location: data.location || { type: 'Point', coordinates: [0, 0] },
    risk_level: aiResult.result?.risk_level || 'medium',
    confidence_score: aiResult.result?.confidence_score ?? null,
    analysis_data: aiResult.result || {},
    recommendations: aiResult.result?.recommendations || [],
    affected_area: data.affected_area || null,
    source: aiResult.mock ? 'mock' : 'ai',
  });

  emitRiskUpdate({ event: 'new_risk', riskData: riskEntry, mock: !!aiResult.mock });
  return { riskEntry, aiResult };
}

/**
 * Ask the AI service to prioritise pending rescue operations.
 */
async function prioritizeOperations(data) {
  return postToAI('/prioritize', data);
}

/**
 * Ask the AI service for an optimal resource allocation plan.
 */
async function allocateResources(data) {
  return postToAI('/resource-allocation', data);
}

module.exports = { analyzeRisk, prioritizeOperations, allocateResources };
