const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { dashboard, vehicleAnalytics } = require('./analytics.controller');

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', dashboard);
router.get('/vehicle/:id', vehicleAnalytics);

module.exports = router;
