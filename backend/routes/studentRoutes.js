const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { getStudentProfile } = require('../controllers/studentController');

// Register a new student
router.post('/register', studentController.registerStudent);

// Login student
router.post('/login', studentController.loginStudent);

// Get students by club ID
router.get('/club/:clubId', protect, authorize('admin'), studentController.getStudentsByClub);

// Admin routes for student approval
router.put('/:studentId/approve', protect, authorize('admin'), studentController.approveStudent);
router.put('/:studentId/reject', protect, authorize('admin'), studentController.rejectStudent);
router.delete('/:studentId', protect, authorize('super_admin', 'admin'), studentController.deleteStudent);

// Get student profile (name and app unlocking completion data)
router.get('/profile', protect, getStudentProfile);

module.exports = router; 