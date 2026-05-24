const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { createBatch, deleteBatch, listBatches, updateBatch } = require('../controllers/batchController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'production', 'defects', 'quality'), asyncHandler(listBatches));
router.post('/', authorizeRoles('admin', 'production'), asyncHandler(createBatch));
router.put('/:id', authorizeRoles('admin', 'production'), asyncHandler(updateBatch));
router.delete('/:id', authorizeRoles('admin', 'production'), asyncHandler(deleteBatch));

module.exports = router;
