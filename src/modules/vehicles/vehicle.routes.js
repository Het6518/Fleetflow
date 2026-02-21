const express = require('express');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');
const { create, getAll, getOne, update, remove } = require('./vehicle.controller');

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// GET /vehicles           – All authenticated users can view
router.get('/', getAll);
router.get('/:id', getOne);

// POST/PATCH/DELETE       – MANAGER only
router.post('/', authorizeRoles('MANAGER'), create);
router.patch('/:id', authorizeRoles('MANAGER'), update);
router.delete('/:id', authorizeRoles('MANAGER'), remove);

module.exports = router;
