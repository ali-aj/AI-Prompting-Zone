const rateLimit = require('express-rate-limit');

// Create a limiter for chat requests
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a limiter for analysis requests
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many analysis requests from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  chatLimiter,
  analysisLimiter
}; 