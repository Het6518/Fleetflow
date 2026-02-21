const express = require('express');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');
const { create, getAll, complete } = require('./maintenance.controller');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAll);
router.post('/', authorizeRoles('MANAGER', 'SAFETY'), create);
router.patch('/:id/complete', authorizeRoles('MANAGER', 'SAFETY'), complete);

module.exports = router;
