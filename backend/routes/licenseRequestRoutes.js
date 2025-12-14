const express = require('express');
const router = express.Router();
const licenseRequestController = require('../controllers/licenseRequestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', licenseRequestController.createLicenseRequest);
router.delete('/:id', protect, authorize('super_admin'), licenseRequestController.deleteLicenseRequest);

module.exports = router; 