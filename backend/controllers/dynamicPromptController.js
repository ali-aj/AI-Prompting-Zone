const DynamicPrompt = require('../models/DynamicPrompt');
const Agent = require('../models/Agent');
const { generateSimpleResponse } = require('../services/llmService');

// Get all dynamic prompts
exports.getAllDynamicPrompts = async (req, res) => {
  try {
    const prompts = await DynamicPrompt.find();
    res.status(200).json(prompts);
  } catch (error) {
    console.error('Error fetching dynamic prompts:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get dynamic prompts for a specific agent
exports.getAgentDynamicPrompts = async (req, res) => {
  try {
    const prompt = await DynamicPrompt.findOne({ agentId: req.params.agentId });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Agent prompt not found' });
    }

    const generationPrompt = `Given this system prompt: "${prompt.systemPrompt}" and this example user prompt: "${prompt.userPrompt}", generate exactly four new user prompts that follow the same style and format. Return ONLY the four prompts, one per line, with no additional text or explanation.`;

    const generatedText = await generateSimpleResponse(generationPrompt);

    const generatedPrompts = generatedText.split('\n').filter(p => p.trim()).slice(0, 4);

    res.status(200).json({
      agentId: req.params.agentId,
      systemPrompt: prompt.systemPrompt,
      originalUserPrompt: prompt.userPrompt,
      generatedUserPrompts: generatedPrompts
    });
  } catch (error) {
    console.error('Error fetching agent dynamic prompts:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new dynamic prompt
exports.createDynamicPrompt = async (req, res) => {
  try {
    const { agentId, systemPrompt, userPrompt } = req.body;

    // Verify agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const prompt = new DynamicPrompt({
      agentId,
      systemPrompt,
      userPrompt
    });

    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    console.error('Error creating dynamic prompt:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a dynamic prompt
exports.updateDynamicPrompt = async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;
    const prompt = await DynamicPrompt.findByIdAndUpdate(
      req.params.id,
      { systemPrompt, userPrompt },
      { new: true, runValidators: true }
    );

    if (!prompt) {
      return res.status(404).json({ error: 'Dynamic prompt not found' });
    }

    res.status(200).json(prompt);
  } catch (error) {
    console.error('Error updating dynamic prompt:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a dynamic prompt
exports.deleteDynamicPrompt = async (req, res) => {
  try {
    const prompt = await DynamicPrompt.findByIdAndDelete(req.params.id);

    if (!prompt) {
      return res.status(404).json({ error: 'Dynamic prompt not found' });
    }

    res.status(200).json({ message: 'Dynamic prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting dynamic prompt:', error);
    res.status(500).json({ error: error.message });
  }
}; 