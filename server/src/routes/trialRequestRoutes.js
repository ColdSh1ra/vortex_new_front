const express = require('express');
const trialRequestController = require('../controllers/trialRequestController');
const { CLIENT_ORIGINS } = require('../config/constants');

const router = express.Router();
const requestsByIp = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_TRACKED_IPS = 10000;
let handledRequestCount = 0;

function requireAllowedOrigin(req, res, next) {
  res.set('Cache-Control', 'no-store');
  const origin = req.get('origin');
  if (origin && !CLIENT_ORIGINS.includes(origin)) {
    return res.status(403).json({ message: 'Запит з цього джерела заборонено.' });
  }

  return next();
}

function rateLimitTrialRequests(req, res, next) {
  const now = Date.now();
  const key = req.ip;
  handledRequestCount += 1;

  if (handledRequestCount % 100 === 0) {
    requestsByIp.forEach((timestamps, ip) => {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) {
        requestsByIp.delete(ip);
      }
    });
  }

  if (!requestsByIp.has(key) && requestsByIp.size >= MAX_TRACKED_IPS) {
    return res.status(429).json({
      message: 'Сервіс тимчасово перевантажений. Спробуйте ще раз пізніше.',
    });
  }

  const recentRequests = (requestsByIp.get(key) || [])
    .filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({
      message: 'Забагато спроб. Спробуйте ще раз пізніше.',
    });
  }

  recentRequests.push(now);
  requestsByIp.set(key, recentRequests);
  return next();
}

router.post(
  '/trial-request',
  requireAllowedOrigin,
  rateLimitTrialRequests,
  trialRequestController.submitTrialRequest,
);

module.exports = router;
