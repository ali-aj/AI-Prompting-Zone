import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceChatContextType {
  isVoiceChatOpen: boolean;
  currentAgentId: string | null;
  currentAgentTitle: string | null;
  openVoiceChat: (agentId: string, agentTitle?: string) => void;
  closeVoiceChat: () => void;
}

const VoiceChatContext = createContext<VoiceChatContextType | undefined>(undefined);

interface VoiceChatProviderProps {
  children: ReactNode;
}

export const VoiceChatProvider: React.FC<VoiceChatProviderProps> = ({ children }) => {
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [currentAgentTitle, setCurrentAgentTitle] = useState<string | null>(null);

  const openVoiceChat = (agentId: string, agentTitle?: string) => {
    setCurrentAgentId(agentId);
    setCurrentAgentTitle(agentTitle || null);
    setIsVoiceChatOpen(true);
  };

  const closeVoiceChat = () => {
    setIsVoiceChatOpen(false);
    setCurrentAgentId(null);
    setCurrentAgentTitle(null);
  };

  return (
    <VoiceChatContext.Provider
      value={{
        isVoiceChatOpen,
        currentAgentId,
        currentAgentTitle,
        openVoiceChat,
        closeVoiceChat,
      }}
    >
      {children}
    </VoiceChatContext.Provider>
  );
};

export const useVoiceChat = (): VoiceChatContextType => {
  const context = useContext(VoiceChatContext);
  if (!context) {
    throw new Error('useVoiceChat must be used within a VoiceChatProvider');
  }
  return context;
};
