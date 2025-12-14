const express = require('express');
const router = express.Router();
const agentChatController = require('../controllers/agentChatController');
const { protect } = require('../middleware/auth');

// Get chat history for an agent
router.get('/:agentId/history', protect, agentChatController.getChatHistory);

// Get a chat session
router.get('/:agentId', protect, agentChatController.getActiveChat);

// Chat with the agent
router.post('/:agentId/chat', protect, agentChatController.chatWithAgent);

// Clear the chat history
router.delete('/:agentId/history', protect, agentChatController.clearChatHistory);

// Save voice chat message
router.post('/:agentId/voice-message', protect, agentChatController.saveVoiceChatMessage);

module.exports = router; 