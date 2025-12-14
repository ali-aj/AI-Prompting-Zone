const Agent = require('../models/Agent');
const DynamicPrompt = require('../models/DynamicPrompt');
const AgentChat = require('../models/AgentChat');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateSimpleResponse } = require('../services/llmService');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get all active agents
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true })
      .sort({ order: 1, title: 1 })
      .allowDiskUse(true);
    // Convert icon buffer to base64 for frontend display
    const agentsWithBase64Icon = agents.map(agent => ({
      ...agent.toObject(),
      icon: agent.icon && agent.icon.data ? {
        data: agent.icon.data.toString('base64'),
        contentType: agent.icon.contentType
      } : null
    }));
    res.status(200).json(agentsWithBase64Icon);
  } catch (error) {
    console.error('Detailed error fetching agents:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Get a single agent by ID
exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id); // Find by _id

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Convert icon buffer to base64 for frontend display
    const agentWithBase64Icon = {
      ...agent.toObject(),
      icon: agent.icon && agent.icon.data ? {
        data: agent.icon.data.toString('base64'),
        contentType: agent.icon.contentType
      } : null
    };

    res.status(200).json(agentWithBase64Icon);
  } catch (error) {
    console.error('Detailed error fetching agent by ID:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Create a new agent (admin only)
exports.createAgent = async (req, res) => {
  try {
    const { title, subtitle, prompt, toolName, videoUrl, isActive, order, appLink } = req.body;
    const newAgentData = {
      title,
      subtitle,
      prompt,
      toolName,
      videoUrl,
      isActive,
      order,
      appLink
    };

    // Handle icon file upload
    if (req.file) {
      newAgentData.icon = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const agent = new Agent(newAgentData);
    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update an agent (admin only)
exports.updateAgent = async (req, res) => {
  try {
    const { subtitle, prompt, toolName, videoUrl, isActive, order, appLink } = req.body;
    const updateData = {
      subtitle,
      prompt,
      toolName,
      videoUrl,
      isActive,
      order,
      appLink
    };

    // Handle optional icon file upload
    if (req.file) {
      updateData.icon = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.status(200).json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an agent (admin only)
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({ _id: req.params.id });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    // Also delete corresponding dynamic prompt(s)
    await DynamicPrompt.deleteMany({ agentId: agent._id });

    // Also delete corresponding agent chat(s)
    await AgentChat.deleteMany({ agentId: agent._id });
    
    res.status(200).json({ message: 'Agent and its dynamic prompt(s) deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get agent introduction
exports.getAgentIntroduction = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const prompt = `You are ${agent.title}. 
    Introduce yourself to a student in a friendly, engaging way. 
    Keep it brief (2-3 sentences) and mention your specialty area. 
    Make it sound like you're excited to help them learn!
    Also mention: I specialize in the ${agent.toolName} app and I will teach you how to use this.`;

    const introduction = await generateSimpleResponse(prompt);

    res.status(200).json({ introduction });
  } catch (error) {
    console.error('Error generating agent introduction:', error);
    res.status(500).json({ error: error.message });
  }
};