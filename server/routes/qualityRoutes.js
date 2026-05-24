const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createQualityCheck,
  deleteQualityCheck,
  listQualityChecks,
  updateQualityStatus,
} = require('../controllers/qualityController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'quality'), asyncHandler(listQualityChecks));
router.post('/', authorizeRoles('admin', 'quality'), asyncHandler(createQualityCheck));
router.put('/:id/status', authorizeRoles('admin', 'quality'), asyncHandler(updateQualityStatus));
router.delete('/:id', authorizeRoles('admin', 'quality'), asyncHandler(deleteQualityCheck));

module.exports = router;
