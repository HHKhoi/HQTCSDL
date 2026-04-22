const express = require('express');
const analyticsController = require('../controllers/AnalyticsController');

const router = express.Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

router.route('/')
  .get(analyticsController.getDashboard);

module.exports = router;
