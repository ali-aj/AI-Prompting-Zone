import type { ChatMessage, ChatResponse } from '../types/chat';

const API_URL = import.meta.env.VITE_BACKEND_URL;

class AgentChatService {
  private static instance: AgentChatService;

  private constructor() {}

  public static getInstance(): AgentChatService {
    if (!AgentChatService.instance) {
      AgentChatService.instance = new AgentChatService();
    }
    return AgentChatService.instance;
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  public async chat(agentId: string, message: string, context?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_URL}/api/agent-chat/${agentId}/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message, context })
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore if can't parse JSON
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  public async getChatHistory(agentId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_URL}/api/agent-chat/${agentId}/history`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore if can't parse JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // Return messages from the first chat session if it exists
      return data[0]?.messages || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  public async getActiveChat(agentId: string): Promise<{ messages: ChatMessage[], context: string }> {
    try {
      const response = await fetch(`${API_URL}/api/agent-chat/${agentId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore if can't parse JSON
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting active chat:', error);
      throw error;
    }
  }

  public async clearChatHistory(agentId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/agent-chat/${agentId}/history`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore if can't parse JSON
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }

  public async saveVoiceMessage(agentId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/agent-chat/${agentId}/voice-message`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ role, content })
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore if can't parse JSON
        }
        throw new Error(errorMessage);
      }

      console.log(`Voice message saved: ${role} - ${content.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error saving voice message:', error);
      // Don't throw error to avoid breaking voice chat flow
    }
  }
}

export default AgentChatService.getInstance(); 