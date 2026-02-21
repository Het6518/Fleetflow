const express = require('express');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');
const { create, getAll, getOne, update } = require('./driver.controller');

const router = express.Router();

router.use(authenticateToken);

// GET: all authenticated roles
router.get('/', getAll);
router.get('/:id', getOne);

// POST/PATCH: MANAGER or SAFETY
router.post('/', authorizeRoles('MANAGER', 'SAFETY'), create);
router.patch('/:id', authorizeRoles('MANAGER', 'SAFETY'), update);

module.exports = router;
