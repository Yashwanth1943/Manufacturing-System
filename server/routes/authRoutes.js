const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { login, profile, register } = require('../controllers/authController');

const router = express.Router();

router.post('/login', asyncHandler(login));
router.post('/register', authenticateToken, authorizeRoles('admin'), asyncHandler(register));
router.get('/profile', authenticateToken, asyncHandler(profile));

module.exports = router;
