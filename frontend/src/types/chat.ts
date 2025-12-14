export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  response: string;
  history: ChatMessage[];
  isAppUnlockReady?: boolean;
  currentLevel?: 'Starter' | 'Growth' | 'Mastery';
  promptCount?: number;
} 