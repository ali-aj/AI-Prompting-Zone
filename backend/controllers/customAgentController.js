const CustomAgent = require('../models/CustomAgent');
const CustomAgentChat = require('../models/CustomAgentChat');
const { generateSimpleResponse } = require('../services/llmService');

// Get all custom agents for a user
exports.getUserCustomAgents = async (req, res) => {
  try {
    const userId = req.user._id;
    const customAgents = await CustomAgent.find({ createdBy: userId })
      .sort({ createdAt: -1 });
    
    // Convert icon buffer to base64 for frontend display
    const agentsWithBase64Icon = customAgents.map(agent => ({
      ...agent.toObject(),
      icon: agent.icon && agent.icon.data ? {
        data: agent.icon.data.toString('base64'),
        contentType: agent.icon.contentType
      } : null
    }));
    
    res.status(200).json(agentsWithBase64Icon);
  } catch (error) {
    console.error('Error fetching user custom agents:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all public custom agents (community gallery)
exports.getPublicCustomAgents = async (req, res) => {
  try {
    const customAgents = await CustomAgent.find({ isPublic: true })
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Convert icon buffer to base64 for frontend display
    const agentsWithBase64Icon = customAgents.map(agent => ({
      ...agent.toObject(),
      icon: agent.icon && agent.icon.data ? {
        data: agent.icon.data.toString('base64'),
        contentType: agent.icon.contentType
      } : null
    }));
    
    res.status(200).json(agentsWithBase64Icon);
  } catch (error) {
    console.error('Error fetching public custom agents:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new custom agent
exports.createCustomAgent = async (req, res) => {
  try {
    const { title, subtitle, description, prompt, toolName, appLink, isPublic } = req.body;
    const userId = req.user._id;
    
    const newAgentData = {
      title,
      subtitle,
      description,
      prompt,
      toolName,
      appLink,
      isPublic: isPublic || false,
      createdBy: userId
    };

    // Handle icon file upload
    if (req.file) {
      newAgentData.icon = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const customAgent = new CustomAgent(newAgentData);
    await customAgent.save();
    
    res.status(201).json(customAgent);
  } catch (error) {
    console.error('Error creating custom agent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a custom agent
exports.updateCustomAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, prompt, toolName, appLink, isPublic } = req.body;
    const userId = req.user._id;
    
    const updateData = {
      title,
      subtitle,
      description,
      prompt,
      toolName,
      appLink,
      isPublic
    };

    // Handle optional icon file upload
    if (req.file) {
      updateData.icon = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const customAgent = await CustomAgent.findOneAndUpdate(
      { _id: id, createdBy: userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!customAgent) {
      return res.status(404).json({ error: 'Custom agent not found or not authorized' });
    }
    
    res.status(200).json(customAgent);
  } catch (error) {
    console.error('Error updating custom agent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a custom agent
exports.deleteCustomAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const customAgent = await CustomAgent.findOneAndDelete({ _id: id, createdBy: userId });
    
    if (!customAgent) {
      return res.status(404).json({ error: 'Custom agent not found or not authorized' });
    }
    
    // Delete all chat records associated with this custom agent
    await CustomAgentChat.deleteMany({ customAgentId: id });
    
    res.status(200).json({ message: 'Custom agent and associated chats deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom agent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get custom agent chat history
exports.getCustomAgentChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if custom agent exists
    const customAgent = await CustomAgent.findById(id);
    if (!customAgent) {
      return res.status(404).json({ error: 'Custom agent not found' });
    }

    // Get chat history for this user and custom agent
    const chatSession = await CustomAgentChat.findOne({
      userId,
      customAgentId: id
    });

    if (!chatSession || !chatSession.messages) {
      return res.json([]);
    }

    res.json(chatSession.messages);
  } catch (error) {
    console.error('Error fetching custom agent chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

// Clear custom agent chat history
exports.clearCustomAgentChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if custom agent exists
    const customAgent = await CustomAgent.findById(id);
    if (!customAgent) {
      return res.status(404).json({ error: 'Custom agent not found' });
    }

    // Delete chat history for this user and custom agent
    await CustomAgentChat.findOneAndDelete({
      userId,
      customAgentId: id
    });

    res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing custom agent chat history:', error);
    res.status(500).json({ message: 'Error clearing chat history' });
  }
};

// Chat with custom agent
exports.chatWithCustomAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const customAgent = await CustomAgent.findById(id);
    if (!customAgent) {
      return res.status(404).json({ message: 'Custom agent not found' });
    }

    // Use the custom agent's prompt as system instruction
    const systemPrompt = `${customAgent.prompt}\n\nYou are ${customAgent.title}. ${customAgent.description}. Always respond helpfully and in character.`;

    // Generate response using the custom agent's personality
    const response = await generateSimpleResponse(`${systemPrompt}\n\nUser: ${message}\nAssistant:`);

    // Save user message and assistant response to chat history
    const chatSession = await CustomAgentChat.findOneAndUpdate(
      { userId, customAgentId: id },
      {
        $push: {
          messages: [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: response, timestamp: new Date() }
          ]
        },
        $setOnInsert: {
          userId,
          customAgentId: id
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json({
      response: response,
      history: chatSession.messages,
      agentTitle: customAgent.title
    });
  } catch (error) {
    console.error('Error in custom agent chat:', error);
    res.status(500).json({ message: 'Error in chat' });
  }
};

// Get a single custom agent by ID
exports.getCustomAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const customAgent = await CustomAgent.findOne({ 
      _id: id, 
      createdBy: userId 
    });
    
    if (!customAgent) {
      return res.status(404).json({ error: 'Custom agent not found' });
    }
    
    // Convert icon buffer to base64 for frontend display
    const agentWithBase64Icon = {
      ...customAgent.toObject(),
      icon: customAgent.icon && customAgent.icon.data ? {
        data: customAgent.icon.data.toString('base64'),
        contentType: customAgent.icon.contentType
      } : null
    };
    
    res.status(200).json(agentWithBase64Icon);
  } catch (error) {
    console.error('Error fetching custom agent:', error);
    res.status(500).json({ error: error.message });
  }
};