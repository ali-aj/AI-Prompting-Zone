import type { ChatMessage } from '../types/chat';

export interface CustomAgentChatResponse {
  response: string;
  history: ChatMessage[];
  agentTitle: string;
}

class CustomAgentChatService {
  async getChatHistory(agentId: string): Promise<ChatMessage[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agentId}/chat-history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    return response.json();
  }

  async clearChatHistory(agentId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agentId}/chat-history`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to clear chat history');
    }
  }

  async chat(agentId: string, message: string): Promise<CustomAgentChatResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agentId}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }
}

export default new CustomAgentChatService();
