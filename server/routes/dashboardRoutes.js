const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAdminDashboard,
  getDefectsDashboard,
  getProductionDashboard,
  getQualityDashboard,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(authenticateToken);

router.get('/admin', authorizeRoles('admin'), asyncHandler(getAdminDashboard));
router.get('/production', authorizeRoles('admin', 'production'), asyncHandler(getProductionDashboard));
router.get('/defects', authorizeRoles('admin', 'defects'), asyncHandler(getDefectsDashboard));
router.get('/quality', authorizeRoles('admin', 'quality'), asyncHandler(getQualityDashboard));

module.exports = router;
