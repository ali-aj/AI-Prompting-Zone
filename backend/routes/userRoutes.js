const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Route to register a club admin automatically after license request approval by super admin
router.post('/register', protect, authorize('super_admin'), userController.register);

module.exports = router; 