const express = require('express');
const router = express.Router();
const customAgentController = require('../controllers/customAgentController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for secure file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      // Additional check for common image types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
      }
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/public', customAgentController.getPublicCustomAgents);

// Protected routes (student only)
router.get('/my-agents', protect, customAgentController.getUserCustomAgents);
router.get('/:id', protect, customAgentController.getCustomAgent);
router.post('/create', protect, authorize('student'), upload.single('icon'), customAgentController.createCustomAgent);
router.put('/:id', protect, authorize('student'), upload.single('icon'), customAgentController.updateCustomAgent);
router.delete('/:id', protect, authorize('student'), customAgentController.deleteCustomAgent);

// Chat routes for custom agents
router.get('/:id/chat-history', protect, authorize('student'), customAgentController.getCustomAgentChatHistory);
router.delete('/:id/chat-history', protect, authorize('student'), customAgentController.clearCustomAgentChatHistory);
router.post('/:id/chat', protect, authorize('student'), customAgentController.chatWithCustomAgent);

module.exports = router;