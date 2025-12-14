const express = require('express');
const router = express.Router();
const dynamicPromptController = require('../controllers/dynamicPromptController');
const { protect, authorize } = require('../middleware/auth');

// Get all dynamic prompts
router.get('/', protect, authorize('super_admin'), dynamicPromptController.getAllDynamicPrompts);

// Get dynamic prompts for a specific agent
router.get('/by-agent/:agentId', dynamicPromptController.getAgentDynamicPrompts);

// Create a new dynamic prompt
router.post('/', protect, authorize('super_admin'), dynamicPromptController.createDynamicPrompt);

// Update a dynamic prompt
router.put('/:id', protect, authorize('super_admin'), dynamicPromptController.updateDynamicPrompt);

// Delete a dynamic prompt
router.delete('/:id', protect, authorize('super_admin'), dynamicPromptController.deleteDynamicPrompt);

module.exports = router; 