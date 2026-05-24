const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { createDefect, deleteDefect, listDefects, updateDefect } = require('../controllers/defectController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'defects'), asyncHandler(listDefects));
router.post('/', authorizeRoles('admin', 'defects'), asyncHandler(createDefect));
router.put('/:id', authorizeRoles('admin', 'defects'), asyncHandler(updateDefect));
router.delete('/:id', authorizeRoles('admin', 'defects'), asyncHandler(deleteDefect));

module.exports = router;
