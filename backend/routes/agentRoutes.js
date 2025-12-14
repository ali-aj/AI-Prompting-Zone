const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory as Buffer

// Public routes
router.get('/', agentController.getAllAgents);
router.get('/:id', agentController.getAgentById);

// Dynamic Prompt routes
router.get('/:id/introduction', agentController.getAgentIntroduction);

// Protected routes (admin only)
router.post('/create-agent', protect, authorize('super_admin'), upload.single('icon'), agentController.createAgent);
router.put('/:id', protect, authorize('super_admin'), upload.single('icon'), agentController.updateAgent);
router.delete('/:id', protect, authorize('super_admin'), agentController.deleteAgent);

module.exports = router; 