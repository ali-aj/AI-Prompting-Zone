const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', clubController.loginClub);

// Protected routes
router.get('/:id', protect, authorize('super_admin', 'admin'), clubController.getClubById);

// Public route for learners to select their club for Sign Up (Only Club Name)
router.get('/', clubController.getAllClubs);

// Super admin only routes
router.put('/:id/status', protect, authorize('super_admin'), clubController.updateClubStatus);

module.exports = router; 