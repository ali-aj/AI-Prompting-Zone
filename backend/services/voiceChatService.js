const { GoogleGenAI } = require('@google/genai');
const WebSocket = require('ws');
const EventEmitter = require('events');
const DynamicPrompt = require('../models/DynamicPrompt');
const Agent = require('../models/Agent');

class VoiceChatService extends EventEmitter {
  constructor() {
    super();
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.activeSessions = new Map(); // sessionId → session details
    this.userSessions = new Map();   // userId → Set<sessionId>
  }

  async createGeminiLiveSession(agentTitle, sessionId) {
    try {
      console.log(`Creating Gemini Live session for agent: ${agentTitle}, sessionId: ${sessionId}`);

      // Fetch system prompt from database
      const systemPrompt = await this.getSystemPrompt(agentTitle);
      console.log(`Using system prompt for ${agentTitle}: ${systemPrompt.substring(0, 100)}...`);

      // Configuration for Live API connection
      const config = {
        audioConfig: {
          audioEncoding: "LINEAR16",
          sampleRateHertz: 16000,
        },
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.95,
        },
        // Set the system instruction with the fetched prompt
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        // Ask the Live API to emit transcription objects for both user input and model output
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        // Ensure model stays silent until user speaks
        inferenceOnContextInitialization: false,
      };

      // Create Live API session
      const liveSession = await this.genAI.live.connect({
        model: "models/gemini-2.0-flash-exp",
        config: config,
        callbacks: {
          onopen: () => this.handleGeminiOpen(sessionId),
          onmessage: (message) => this.handleGeminiMessage(sessionId, message),
          onerror: (error) => this.handleGeminiError(sessionId, error),
          onclose: (event) => this.handleGeminiClose(sessionId, event)
        }
      });

      console.log(`Gemini Live session created successfully for sessionId: ${sessionId}`);
      return liveSession;

    } catch (error) {
      console.error('Error creating Gemini Live session:', error);
      throw new Error(`Failed to create Gemini Live session: ${error.message}`);
    }
  }

  // Gemini Live API Event Handlers
  handleGeminiOpen(sessionId) {
    console.log(`Gemini Live connection opened for session: ${sessionId}`);
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.geminiConnectionState = 'connected';
      // Notify frontend that Gemini connection is ready
      if (session.frontendWS && session.frontendWS.readyState === WebSocket.OPEN) {
        session.frontendWS.send(JSON.stringify({
          type: 'gemini_connected',
          sessionId: sessionId
        }));
      }
    }
  }

  handleGeminiMessage(sessionId, message) {
    console.log(`Received Gemini message for session: ${sessionId}`);
    console.log(`Message type:`, Object.keys(message)); // Debug: show message structure
    
    // Update last activity
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    
    try {
      // Handle setup complete
      if (message.setupComplete) {
        console.log(`Gemini setup complete for session: ${sessionId}`);
        const session = this.activeSessions.get(sessionId);
        if (session && session.frontendWS && session.frontendWS.readyState === WebSocket.OPEN) {
          session.frontendWS.send(JSON.stringify({
            type: 'session_ready',
            sessionId: sessionId
          }));
          
          // No initial greeting – we rely solely on user audio.
        }
        return;
      }

      // Handle audio responses
      if (message.serverContent && message.serverContent.modelTurn) {
        console.log(`Processing modelTurn for session: ${sessionId}`);
        const parts = message.serverContent.modelTurn.parts || [];
        console.log(`Found ${parts.length} parts in modelTurn`);
        
        // Filter audio parts
        const audioParts = parts.filter(part => 
          part.inlineData && 
          part.inlineData.mimeType && 
          part.inlineData.mimeType.startsWith('audio/pcm')
        );
        console.log(`Found ${audioParts.length} audio parts`);

        // Forward audio responses to frontend
        audioParts.forEach(audioPart => {
          console.log(`Forwarding audio part to frontend for session: ${sessionId}`);
          this.forwardAudioToFrontend(sessionId, audioPart.inlineData.data);
        });
      }

      // Forward input (user) transcription if present
      const inputTx = message.inputTranscription || (message.serverContent && message.serverContent.inputTranscription);
      if (inputTx && inputTx.text) {
        const sessionForTx = this.activeSessions.get(sessionId);
        if (sessionForTx && sessionForTx.frontendWS && sessionForTx.frontendWS.readyState === WebSocket.OPEN) {
          sessionForTx.frontendWS.send(
            JSON.stringify({
              type: 'user_text',
              text: inputTx.text,
              sessionId,
            }),
          );
        }
      }

      // Forward output (assistant) transcription if present
      const outputTx = message.outputTranscription || (message.serverContent && message.serverContent.outputTranscription);
      if (outputTx && outputTx.text) {
        const sessionForTx = this.activeSessions.get(sessionId);
        if (sessionForTx && sessionForTx.frontendWS && sessionForTx.frontendWS.readyState === WebSocket.OPEN) {
          sessionForTx.frontendWS.send(
            JSON.stringify({
              type: 'assistant_text',
              text: outputTx.text,
              sessionId,
            }),
          );
        }
      }

      // Handle turn complete - This is where the issue occurs
      if (message.serverContent && message.serverContent.turnComplete) {
        console.log(`Turn complete for session: ${sessionId}`);
        
        // Mark the session as ready for new conversation
        const session = this.activeSessions.get(sessionId);
        if (session) {
          session.isReadyForNewTurn = true;
          session.lastTurnCompleteTime = Date.now();
          console.log(`Session ${sessionId} marked as ready for new turn`);
        }
      }

      if ("interrupted" in message.serverContent) {
        console.log(`Gemini interrupted for session: ${sessionId}`);
        const session = this.activeSessions.get(sessionId);
        if (session && session.frontendWS && session.frontendWS.readyState === WebSocket.OPEN) {
          session.frontendWS.send(JSON.stringify({
            type: "interrupted",
            sessionId,
          }));
        }
        return;
      }
      if ("turnComplete" in message.serverContent) {
        const session = this.activeSessions.get(sessionId);
        if (session && session.frontendWS && session.frontendWS.readyState === WebSocket.OPEN) {
          session.frontendWS.send(JSON.stringify({
            type: "turn_complete",
            sessionId,
          }));
        }
      }

    } catch (error) {
      console.error(`Error handling Gemini message for session ${sessionId}:`, error);
      this.sendErrorToFrontend(sessionId, 'GEMINI_MESSAGE_ERROR', error.message);
    }
  }

  handleGeminiError(sessionId, error) {
    console.error(`Gemini Live error for session ${sessionId}:`, error);
    this.sendErrorToFrontend(sessionId, 'GEMINI_CONNECTION_ERROR', error.message);
  }

  handleGeminiClose(sessionId, event) {
    console.log(`Gemini Live connection closed for session ${sessionId}:`, event);
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.geminiConnectionState = 'disconnected';
      // Notify frontend about Gemini disconnection
      if (session.frontendWS && session.frontendWS.readyState === WebSocket.OPEN) {
        session.frontendWS.send(JSON.stringify({
          type: 'gemini_disconnected',
          sessionId: sessionId,
          reason: event.reason || 'Connection closed'
        }));
      }
    }
  }

  // Fetch system prompt dynamically from database
  async getSystemPrompt(agentTitle) {
    try {
      console.log(`Fetching system prompt for agent: ${agentTitle}`);
      
      // First, find the agent by title
      const agent = await Agent.findOne({ title: agentTitle });
      if (!agent) {
        console.error(`Agent not found in database: ${agentTitle}, voice feature disabled`);
        throw new Error(`Agent "${agentTitle}" not found in database`);
      }

      // Then, find the dynamic prompt for this agent
      const dynamicPrompt = await DynamicPrompt.findOne({ agentId: agent._id });
      if (!dynamicPrompt) {
        console.error(`Dynamic prompt not found for agent: ${agentTitle}, voice feature disabled`);
        throw new Error(`System prompt not found for agent "${agentTitle}"`);
      }

      if (!dynamicPrompt.systemPrompt || dynamicPrompt.systemPrompt.trim() === '') {
        console.error(`Empty system prompt for agent: ${agentTitle}, voice feature disabled`);
        throw new Error(`Empty system prompt for agent "${agentTitle}"`);
      }

      console.log(`Successfully fetched system prompt for agent: ${agentTitle}`);
      return dynamicPrompt.systemPrompt;

    } catch (error) {
      console.error(`Error fetching system prompt for agent ${agentTitle}:`, error);
      throw error; // Re-throw the error instead of falling back
    }
  }

  // Send initial greeting to start the conversation
  async sendInitialGreeting(sessionId, agentTitle) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.geminiLiveSession) {
        console.warn(`Cannot send initial greeting - session not found: ${sessionId}`);
        return;
      }

      // Fetch system prompt from database
      const systemPrompt = await this.getSystemPrompt(agentTitle);
      
      // Send the system prompt to set the agent's personality
      session.geminiLiveSession.sendClientContent({
        turns: [{ text: systemPrompt }],
        turnComplete: true
      });

      const greetings = {
        "Spiral the Study Buddy": "Hi there! I'm Spiral, your friendly study buddy! What would you like to learn about today?",
        "Gary Payton the Wizard": "Greetings, young scholar! I am Gary Payton the Wizard. What magical knowledge shall we explore today?",
        default: "Hello! I'm your AI assistant. How can I help you learn something new today?"
      };

      const greeting = greetings[agentTitle] || greetings.default;
      
      // Send text greeting to Gemini to start the conversation
      session.geminiLiveSession.sendClientContent({
        turns: [{ text: greeting }],
        turnComplete: true
      });

      console.log(`Initial greeting sent for session: ${sessionId} with agent: ${agentTitle}`);
    } catch (error) {
      console.error(`Error sending initial greeting for session ${sessionId}:`, error);
    }
  }

  // Send a follow-up prompt to encourage continued conversation
  sendFollowUpPrompt(sessionId) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.geminiLiveSession) {
        console.warn(`Cannot send follow-up prompt - session not found: ${sessionId}`);
        return;
      }

      // Send a subtle prompt to encourage more conversation
      session.geminiLiveSession.sendClientContent({
        turns: [{ text: "Please continue our conversation and respond to what I just said." }],
        turnComplete: true
      });

      console.log(`Follow-up prompt sent for session: ${sessionId}`);
    } catch (error) {
      console.error(`Error sending follow-up prompt for session ${sessionId}:`, error);
    }
  }

  // Audio forwarding methods
  async forwardAudioToGemini(sessionId, base64AudioData) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.geminiLiveSession) {
        throw new Error(`No active Gemini session found for sessionId: ${sessionId}`);
      }

      // Debug: Log audio data size and session state
      console.log(`Forwarding audio to Gemini - size: ${base64AudioData.length} bytes for session: ${sessionId}`);
      console.log(`Session state - isReadyForNewTurn: ${session.isReadyForNewTurn}, geminiConnectionState: ${session.geminiConnectionState}`);

      // No debug text or restart prompts – pure audio relay.

      // Forward base64 audio to Gemini Live API
      console.log(`About to send audio to Gemini Live API for session: ${sessionId}`);
      await session.geminiLiveSession.sendRealtimeInput({
        media: {
        mimeType: "audio/pcm;rate=16000",
          data: base64AudioData,
        },
      });

      // Update last activity timestamp
      session.lastActivity = Date.now();

      console.log(`Audio forwarded to Gemini for session: ${sessionId}`);
    } catch (error) {
      console.error(`Error forwarding audio to Gemini for session ${sessionId}:`, error);
      this.sendErrorToFrontend(sessionId, 'AUDIO_FORWARD_ERROR', error.message);
    }
  }

  forwardAudioToFrontend(sessionId, base64AudioData) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.frontendWS || session.frontendWS.readyState !== WebSocket.OPEN) {
        console.warn(`Cannot forward audio to frontend for session: ${sessionId} - connection not available`);
        return;
      }

      // Debug: Log audio data size
      console.log(`Forwarding audio to frontend - size: ${base64AudioData.length} bytes`);

      // Forward base64 audio response to frontend
      session.frontendWS.send(JSON.stringify({
        type: 'audio',
        data: base64AudioData,
        sessionId,
      }));

      console.log(`Audio forwarded to frontend for session: ${sessionId}`);
    } catch (error) {
      console.error(`Error forwarding audio to frontend for session ${sessionId}:`, error);
    }
  }

  sendErrorToFrontend(sessionId, errorCode, errorMessage) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.frontendWS || session.frontendWS.readyState !== WebSocket.OPEN) {
        console.warn(`Cannot send error to frontend for session: ${sessionId} - connection not available`);
        return;
      }

      session.frontendWS.send(JSON.stringify({
        type: 'error',
        code: errorCode,
        message: errorMessage,
        sessionId: sessionId
      }));

      console.log(`Error sent to frontend for session ${sessionId}: ${errorCode}`);
    } catch (error) {
      console.error(`Error sending error to frontend for session ${sessionId}:`, error);
    }
  }

  // Session Management Methods
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async createSession(userId, agentTitle, frontendWS) {
    const sessionId = this.generateSessionId();
    
    try {
      console.log(`Creating session ${sessionId} for user ${userId} with agent: ${agentTitle}`);

      // Validate agent and system prompt before creating session
      try {
        await this.getSystemPrompt(agentTitle);
      } catch (error) {
        console.error(`Cannot create voice session - ${error.message}`);
        
        // Send error to frontend
        frontendWS.send(JSON.stringify({
          type: 'error',
          code: 'AGENT_VALIDATION_ERROR',
          message: error.message,
          sessionId: sessionId
        }));
        
        throw new Error(`Voice feature unavailable: ${error.message}`);
      }

      // Create session object
      const session = {
        sessionId: sessionId,
        userId: userId,
        agentTitle: agentTitle,
        frontendWS: frontendWS,
        geminiLiveSession: null,
        geminiConnectionState: 'connecting',
        createdAt: new Date(),
        isReadyForNewTurn: false,
        lastTurnCompleteTime: null,
        debugMessageCount: 0,
        lastActivity: Date.now()
      };

      // Store session
      this.activeSessions.set(sessionId, session);
      
      // Track user sessions
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, new Set());
      }
      this.userSessions.get(userId).add(sessionId);

      // Create Gemini Live session
      const geminiSession = await this.createGeminiLiveSession(agentTitle, sessionId);
      session.geminiLiveSession = geminiSession;

      // Start health check for this session
      this.startSessionHealthCheck(sessionId);

      console.log(`Session ${sessionId} created successfully`);
      return sessionId;

    } catch (error) {
      console.error(`Error creating session ${sessionId}:`, error);
      // Cleanup on error
      this.cleanupSession(sessionId);
      throw error;
    }
  }

  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  // Health check method to keep sessions alive
  startSessionHealthCheck(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.healthCheckInterval = setInterval(async () => {
      try {
        const currentSession = this.activeSessions.get(sessionId);
        if (!currentSession) {
          clearInterval(session.healthCheckInterval);
          return;
        }

        const timeSinceLastActivity = Date.now() - currentSession.lastActivity;
        console.log(`Health check for session ${sessionId}: ${timeSinceLastActivity}ms since last activity`);

        // If no activity for more than 60 seconds, end the session silently.
        if (timeSinceLastActivity > 60000) {
          console.log(`No activity for 60s, cleaning up session ${sessionId}`);
          this.cleanupSession(sessionId);
          return;
        }
      } catch (error) {
        console.error(`Health check error for session ${sessionId}:`, error);
      }
    }, 15000); // Check every 15 seconds
  }

  cleanupSession(sessionId) {
    console.log(`Cleaning up session: ${sessionId}`);
    
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Clear health check interval
      if (session.healthCheckInterval) {
        clearInterval(session.healthCheckInterval);
      }

      // Close Gemini Live session
      if (session.geminiLiveSession) {
        try {
          session.geminiLiveSession.close();
        } catch (error) {
          console.error(`Error closing Gemini session for ${sessionId}:`, error);
        }
      }

      // Remove from user sessions tracking
      if (session.userId && this.userSessions.has(session.userId)) {
        this.userSessions.get(session.userId).delete(sessionId);
        if (this.userSessions.get(session.userId).size === 0) {
          this.userSessions.delete(session.userId);
        }
      }

      // Remove from active sessions
      this.activeSessions.delete(sessionId);
      console.log(`Session ${sessionId} cleaned up successfully`);
    }
  }

  setupWebSocketConnection(server) {
    const wss = new WebSocket.Server({ 
      server,
      path: '/voice-chat'
    });

    wss.on('connection', (ws, req) => {
      console.log('New voice chat WebSocket connection established');
      
      let sessionId = null;

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log(`Received message type: ${message.type}`);
          
          switch (message.type) {
            case 'init':
            case 'init_session':
              try {
                const { userId, agentTitle } = message;
                
                if (!userId || !agentTitle) {
                  throw new Error('Missing required fields: userId or agentTitle');
                }

                // Create new session with Gemini Live connection
                // This will validate the agent and system prompt
                sessionId = await this.createSession(userId, agentTitle, ws);
                
                console.log(`Session initialized: ${sessionId} for user: ${userId}`);

                // Send session ready confirmation
                ws.send(JSON.stringify({
                  type: 'session_ready',
                  sessionId: sessionId,
                  message: 'Session created and ready for audio'
                }));

              } catch (error) {
                console.error('Error initializing session:', error);
                
                // Determine error code based on error message
                let errorCode = 'SESSION_INIT_ERROR';
                if (error.message.includes('not found in database') || 
                    error.message.includes('System prompt not found') ||
                    error.message.includes('Empty system prompt')) {
                  errorCode = 'AGENT_VALIDATION_ERROR';
                }
                
                ws.send(JSON.stringify({
                  type: 'error',
                  code: errorCode,
                  message: error.message
                }));
              }
              break;

            case 'audio_chunk':
            case 'audio_data':
            case 'audio':
              try {
                if (!sessionId) {
                  throw new Error('Session not initialized. Send init message first.');
                }

                const audioData = message.audioData || message.data;
                if (!audioData) {
                  throw new Error('No audio data provided');
                }

                // Forward base64 audio to Gemini Live API
                await this.forwardAudioToGemini(sessionId, audioData);

              } catch (error) {
                console.error('Error handling audio chunk:', error);
                ws.send(JSON.stringify({
                  type: 'error',
                  code: 'AUDIO_CHUNK_ERROR',
                  message: error.message,
                  sessionId: sessionId
                }));
              }
              break;

            case 'disconnect':
              try {
                if (sessionId) {
                  console.log(`Client requested disconnection for session: ${sessionId}`);
                  this.cleanupSession(sessionId);
                  
                  ws.send(JSON.stringify({
                    type: 'session_ended',
                    sessionId: sessionId
                  }));
                }
                ws.close();
              } catch (error) {
                console.error('Error handling disconnect:', error);
                ws.close();
              }
              break;

            default:
              console.log('Unknown message type:', message.type);
              ws.send(JSON.stringify({
                type: 'error',
                code: 'UNKNOWN_MESSAGE_TYPE',
                message: `Unknown message type: ${message.type}`
              }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            code: 'MESSAGE_PARSE_ERROR',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', (code, reason) => {
        console.log(`Voice chat WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
        if (sessionId) {
          this.cleanupSession(sessionId);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (sessionId) {
          this.cleanupSession(sessionId);
        }
      });
    });

    console.log('Voice chat WebSocket server setup complete on /voice-chat');
    return wss;
  }

  // Helper method for testing - handle individual WebSocket connection
  handleWebSocketConnection(ws) {
    if (!ws) {
      throw new Error('WebSocket connection is required');
    }
    
    console.log('Handling WebSocket connection');
    
    // Set up basic event handlers
    ws.on('message', (data) => {
      console.log('Received message from WebSocket client');
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    return true;
  }

  // Cleanup method for testing
  cleanup() {
    console.log('Cleaning up VoiceChatService...');
    
    // Clean up all active sessions
    if (this.activeSessions) {
      for (const sessionId of this.activeSessions.keys()) {
        this.cleanupSession(sessionId);
      }
    }
    
    console.log('VoiceChatService cleanup complete');
  }
}

module.exports = VoiceChatService;