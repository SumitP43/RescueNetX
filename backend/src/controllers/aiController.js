const aiService = require('../services/aiService');

async function analyzeRisk(req, res, next) {
  try {
    const result = await aiService.analyzeRisk(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function prioritizeOperations(req, res, next) {
  try {
    const result = await aiService.prioritizeOperations(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function allocateResources(req, res, next) {
  try {
    const result = await aiService.allocateResources(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeRisk, prioritizeOperations, allocateResources };
