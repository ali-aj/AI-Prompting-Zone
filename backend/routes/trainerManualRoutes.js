const express = require('express');
const router = express.Router();
const trainerManualController = require('../controllers/trainerManualController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../utils/s3');

// Set up S3 storage for multer (AWS SDK v3 compatible)
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  key: (req, file, cb) => {
    // Sanitize filename and add timestamp
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '');
    const extension = sanitizedName.split('.').pop();
    const name = sanitizedName.split('.')[0];
    const fileName = `${name}-${Date.now()}.${extension}`;
    cb(null, `trainer-manuals/${fileName}`);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files for training manuals
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for training manuals'), false);
    }
  }
});

// Upload manual (Super Admin only)
router.post('/', protect, authorize('super_admin'), upload.single('file'), trainerManualController.uploadManual);

// List all manuals (Super Admin & Club Admin)
router.get('/', protect, authorize('super_admin', 'admin'), trainerManualController.listManuals);

// Get latest manual (Super Admin & Club Admin)
router.get('/latest', protect, authorize('super_admin', 'admin'), trainerManualController.getLatestManual);

// View manual with inline headers (Super Admin & Club Admin)
router.get('/view/:id', protect, authorize('super_admin', 'admin'), trainerManualController.viewManual);

// Delete manual (Super Admin only)
router.delete('/:id', protect, authorize('super_admin'), trainerManualController.deleteManual);

module.exports = router;