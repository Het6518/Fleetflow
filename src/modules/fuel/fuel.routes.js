const express = require('express');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');
const { create, getAll, getByVehicle } = require('./fuel.controller');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAll);
router.get('/vehicle/:vehicleId', getByVehicle);
router.post('/', authorizeRoles('MANAGER', 'FINANCE', 'DISPATCHER'), create);

module.exports = router;
