const express = require('express');
const router = express.Router();
const studentProgressController = require('../controllers/studentProgressController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes for student progress (only authenticated students/users)
// Get progress for the currently authenticated student
router.get('/me', protect, authorize('student'), studentProgressController.getStudentProgress);

// Get progress for a specific student (admin access)
router.get('/student/:studentId', protect, authorize('admin'), studentProgressController.getStudentProgressById);

// Update progress for the currently authenticated student
router.put('/me', protect, studentProgressController.updateStudentProgress);

module.exports = router; 