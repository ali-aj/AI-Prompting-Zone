const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Internal function to handle the actual API calls with fallback logic
const _generateWithFallback = async (promptOrMessages) => {
  let initialMessages = Array.isArray(promptOrMessages)
    ? promptOrMessages
    : [{ role: 'user', content: promptOrMessages }];

  // Extract system prompt and user/assistant messages
  const systemPrompt = initialMessages.find((msg) => msg.role === 'system')?.content || undefined;
  const otherMessages = initialMessages.filter((msg) => msg.role !== 'system');
  
  // Standardize the priming logic for all models
  let finalMessages = [];
  if (systemPrompt) {
    finalMessages.push({ role: 'user', content: systemPrompt });
    finalMessages.push({ role: 'assistant', content: "Okay, I understand. I will act in that persona now. How can I help you?" });
  }
  finalMessages = finalMessages.concat(otherMessages);


  // 1. OpenAI
  try {
    if (process.env.OPENAI_API_KEY) {
      if (finalMessages.length === 0) throw new Error("Cannot call OpenAI API with no messages.");
      const openaiResponse = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: finalMessages,
      });
      return openaiResponse.choices[0].message.content;
    }
    throw new Error('OPENAI_API_KEY not found.');
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    console.log('Falling back to Anthropic API...');
  }

  // 2. Anthropic
  try {
    if (process.env.CLAUDE_API_KEY) {
      if (finalMessages.length === 0) throw new Error("Cannot call Anthropic API with no messages.");
      const anthropicResponse = await anthropic.messages.create({
        model: process.env.CLAUDE_MODEL,
        max_tokens: 1024,
        messages: finalMessages,
      });
      return anthropicResponse.content[0].text;
    }
    throw new Error('CLAUDE_API_KEY not found.');
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    console.log('Falling back to Gemini API...');
  }

  // 3. Gemini
  try {
    if (process.env.GEMINI_API_KEY) {
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL,
        });

        const geminiHistory = finalMessages
            .filter(msg => msg.content) // Ensure content is not empty
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));
        
        if (geminiHistory.length === 0) {
            throw new Error("Cannot call Gemini API with no messages.");
        }

        const lastMessage = geminiHistory.pop(); 

        const chat = model.startChat({
            history: geminiHistory,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        const result = await chat.sendMessage(lastMessage.parts);
        return result.response.text();
    }
    throw new Error('GEMINI_API_KEY not found.');
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('All LLM providers failed.');
  }
};

const generateSimpleResponse = async (prompt) => {
    return await _generateWithFallback(prompt);
};

const generateChatResponse = async (history) => {
    return await _generateWithFallback(history);
};

module.exports = { 
    generateSimpleResponse,
    generateChatResponse
}; 