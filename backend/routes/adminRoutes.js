const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', adminController.loginAdmin);

// License request management routes
router.get('/license-requests', protect, authorize('super_admin'), adminController.getAllLicenseRequests);
router.post('/license-requests/:id/approve', protect, authorize('super_admin'), adminController.approveLicenseRequest);
router.post('/license-requests/:id/reject', protect, authorize('super_admin'), adminController.rejectLicenseRequest);

// Student management routes
router.get('/', protect, authorize('super_admin'), adminController.getAllStudents);
router.put('/:id', protect, authorize('super_admin', 'admin'), adminController.updateStudentProfile);
router.delete('/:id', protect, authorize('super_admin', 'admin'), adminController.deleteStudent);

// Get dashboard counts
router.get('/dashboard-counts', protect, authorize('super_admin'), adminController.getDashboardCounts);

module.exports = router; 