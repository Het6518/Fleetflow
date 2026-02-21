const express = require('express');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');
const { create, getAll, getOne, dispatch, complete, cancel } = require('./trip.controller');

const router = express.Router();

router.use(authenticateToken);

// GET – all roles
router.get('/', getAll);
router.get('/:id', getOne);

// POST – DISPATCHER & MANAGER can create trips
router.post('/', authorizeRoles('DISPATCHER', 'MANAGER'), create);

// State transitions – DISPATCHER & MANAGER
router.patch('/:id/dispatch', authorizeRoles('DISPATCHER', 'MANAGER'), dispatch);
router.patch('/:id/complete', authorizeRoles('DISPATCHER', 'MANAGER'), complete);
router.patch('/:id/cancel', authorizeRoles('DISPATCHER', 'MANAGER'), cancel);

module.exports = router;
