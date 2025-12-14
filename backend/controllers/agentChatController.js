const AgentChat = require('../models/AgentChat');
const Agent = require('../models/Agent');
const DynamicPrompt = require('../models/DynamicPrompt');
const StudentProgress = require('../models/StudentProgress');
const { 
  generateChatResponse
} = require('../services/llmService');

// Get chat history for a specific agent
exports.getChatHistory = async (req, res) => {
  try {
    const { agentId } = req.params;
    const userId = req.user._id;

    const chatSessions = await AgentChat.find({
      userId,
      agentId
    }).sort({ updatedAt: -1 });

    res.json(chatSessions);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

// Chat with the agent
exports.chatWithAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    // Fetch the agent and its dynamic system prompt
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const dynamicPrompt = await DynamicPrompt.findOne({ agentId: agent._id });

    let initialSystemPrompt = "You are an AI assistant."; // Default fallback
    if (dynamicPrompt && dynamicPrompt.systemPrompt) {
      initialSystemPrompt = dynamicPrompt.systemPrompt;
    }

    // Add instruction to always include real educational links
    initialSystemPrompt += '\n\nAt the end of every answer, include 1–2 real, high-quality educational links (YouTube, Khan Academy, or reputable blogs) that help the user learn more about the topic. Format them as clickable markdown links.';

    // Fetch existing chat session for the user and agent
    let existingChatSession = await AgentChat.findOne({ userId, agentId });
    
    // Initialize level if no session exists
    let currentLevel = 'Starter';
    let promptCount = 0;
    
    if (existingChatSession) {
      // Parse level from context
      const contextData = existingChatSession.context ? JSON.parse(existingChatSession.context) : {};
      currentLevel = contextData.level || 'Starter';
      // Only count user prompts, not all messages
      promptCount = existingChatSession.messages.filter(msg => msg.role === 'user').length;
    }

    // Determine level progression based on prompt count
    let newLevel = currentLevel;
    let levelChanged = false;
    if (promptCount >= 25 && currentLevel === 'Starter') {
      newLevel = 'Growth';
      levelChanged = true;
    } else if (promptCount >= 40 && currentLevel === 'Growth') { // 25 + 15 = 40 total prompts
      newLevel = 'Mastery';
      levelChanged = true;
    }

    // Check if app should be unlocked (10 prompts in Mastery level)
    let isAppUnlockReady = false;
    if (newLevel === 'Mastery') {
      const masteryPromptCount = promptCount - 40; // Prompts since reaching Mastery (40 total to reach Mastery)
      if (masteryPromptCount >= 10) {
        isAppUnlockReady = true;
      }
    }

    // Construct conversation history for the LLM
    let history = [{ role: "system", content: initialSystemPrompt }];

    // Add level-specific instructions to the system prompt
    let levelInstructions = "";
    if (newLevel === 'Starter') {
      levelInstructions = "\n\nYou are currently in STARTER level. Keep your responses simple, encouraging, and very basic. Use simple language suitable for young beginners (6-8 years old). Focus on building confidence and basic understanding.";
    } else if (newLevel === 'Growth') {
      levelInstructions = "\n\nYou are currently in GROWTH level. Increase the complexity slightly. Use more detailed explanations and introduce intermediate concepts. Suitable for growing learners (9-12 years old). Challenge them more while still being supportive.";
    } else if (newLevel === 'Mastery') {
      levelInstructions = "\n\nYou are currently in MASTERY level. Use advanced concepts and detailed explanations. Challenge the user with complex topics and encourage deep thinking. Suitable for advanced learners (13-18 years old). Be more analytical and expect sophisticated responses.";
    }

    // Add level change notification if level just changed
    if (levelChanged) {
      levelInstructions += `\n\nIMPORTANT: The user has just leveled up from ${currentLevel} to ${newLevel}! Congratulate them on their progress and acknowledge that you will now provide more challenging content appropriate for their new level.`;
    }

    // Add app unlock preparation notification
    if (newLevel === 'Mastery') {
      const masteryPromptCount = promptCount - 40;
      if (masteryPromptCount >= 8 && masteryPromptCount < 10) {
        levelInstructions += `\n\nNOTE: The user is very close to unlocking the app! They need just ${10 - masteryPromptCount} more prompts to unlock ${agent.toolName}. Encourage their continued engagement and let them know they're almost there!`;
      }
    }

    // Update the system prompt with level information
    history[0].content += levelInstructions;

    if (existingChatSession && existingChatSession.messages.length > 0) {
      const chatMessages = existingChatSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      history = history.concat(chatMessages);
    }

    // Add the current user message
    history.push({ role: 'user', content: message });

    // Generate response using the entire conversation
    let llmResponseText;
    try {
      llmResponseText = await generateChatResponse(history);
    } catch (llmError) {
      console.error('Error generating response with LLM:', llmError);
      llmResponseText = "Sorry, I encountered an error. Please try again.";
    }

    // Update student progress if app is unlocked
    if (isAppUnlockReady && agent.toolName) {
      await StudentProgress.findOneAndUpdate(
        { student: userId },
        { $addToSet: { appsUnlocked: agent.toolName } },
        { upsert: true, new: true }
      );
    }

    // Prepare context data with level information
    const contextData = {
      level: newLevel,
      promptCount: promptCount + 1,
      isAppUnlocked: isAppUnlockReady
    };

    // Save to chat history
    const chatSession = await AgentChat.findOneAndUpdate(
      { userId, agentId },
      {
        $push: {
          messages: [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: llmResponseText, timestamp: new Date() }
          ]
        },
        $set: {
          context: JSON.stringify(contextData)
        },
        $setOnInsert: {
          userId,
          agentId
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json({
      response: llmResponseText,
      history: chatSession.messages,
      isAppUnlockReady: isAppUnlockReady,
      currentLevel: newLevel,
      promptCount: promptCount + 1
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Error adding message' });
  }
};

// Get active chat session for an agent
exports.getActiveChat = async (req, res) => {
  try {
    const { agentId } = req.params;
    const userId = req.user._id;

    const chatSession = await AgentChat.findOne(
      {
        userId,
        agentId
      }
    );

    if (!chatSession) {
      return res.status(404).json({ message: 'No chat session found' });
    }

    res.status(200).json({
      messages: chatSession.messages,
      context: chatSession.context
    });
  } catch (error) {
    console.error('Error fetching active chat:', error);
    res.status(500).json({ message: 'Error fetching active chat' });
  }
};

// Clear chat history
exports.clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { agentId } = req.params;
    await AgentChat.findOneAndDelete({ userId, agentId });
    res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: error.message });
  }
};

// Save voice chat message to database
exports.saveVoiceChatMessage = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { role, content } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!role || !content || !['user', 'assistant'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role or content' });
    }

    // Find the agent
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Fetch existing chat session for the user and agent
    let existingChatSession = await AgentChat.findOne({ userId, agentId });
    
    // Initialize level if no session exists
    let currentLevel = 'Starter';
    let promptCount = 0;
    
    if (existingChatSession) {
      // Parse level from context
      const contextData = existingChatSession.context ? JSON.parse(existingChatSession.context) : {};
      currentLevel = contextData.level || 'Starter';
      // Only count user prompts, not all messages
      promptCount = existingChatSession.messages.filter(msg => msg.role === 'user').length;
    }

    // Only update progress for user messages (not assistant responses)
    let newLevel = currentLevel;
    let levelChanged = false;
    let isAppUnlockReady = false;
    
    if (role === 'user') {
      // Determine level progression based on prompt count
      if (promptCount >= 25 && currentLevel === 'Starter') {
        newLevel = 'Growth';
        levelChanged = true;
      } else if (promptCount >= 40 && currentLevel === 'Growth') { // 25 + 15 = 40 total prompts
        newLevel = 'Mastery';
        levelChanged = true;
      }

      // Check if app should be unlocked (10 prompts in Mastery level)
      if (newLevel === 'Mastery') {
        const masteryPromptCount = promptCount - 40; // Prompts since reaching Mastery (40 total to reach Mastery)
        if (masteryPromptCount >= 10) {
          isAppUnlockReady = true;
        }
      }

      // Update student progress if app is unlocked
      if (isAppUnlockReady && agent.toolName) {
        await StudentProgress.findOneAndUpdate(
          { student: userId },
          { $addToSet: { appsUnlocked: agent.toolName } },
          { upsert: true, new: true }
        );
      }
    }

    // Prepare context data with level information (only update for user messages)
    let contextData;
    if (role === 'user') {
      contextData = {
        level: newLevel,
        promptCount: promptCount + 1,
        isAppUnlocked: isAppUnlockReady
      };
    } else {
      // For assistant messages, preserve existing context
      contextData = existingChatSession?.context ? JSON.parse(existingChatSession.context) : { level: 'Starter', promptCount: 0, isAppUnlocked: false };
    }

    // Save to chat history
    const chatSession = await AgentChat.findOneAndUpdate(
      { userId, agentId },
      {
        $push: {
          messages: {
            role,
            content,
            timestamp: new Date()
          }
        },
        $set: {
          context: JSON.stringify(contextData)
        },
        $setOnInsert: {
          userId,
          agentId
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json({ 
      message: 'Voice chat message saved successfully',
      messageId: chatSession.messages[chatSession.messages.length - 1]._id,
      levelChanged: levelChanged,
      currentLevel: newLevel,
      promptCount: role === 'user' ? promptCount + 1 : promptCount,
      isAppUnlockReady: isAppUnlockReady
    });
  } catch (error) {
    console.error('Error saving voice chat message:', error);
    res.status(500).json({ message: 'Error saving voice chat message' });
  }
};