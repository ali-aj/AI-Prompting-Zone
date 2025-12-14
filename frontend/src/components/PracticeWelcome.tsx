import { Button } from '@/components/ui/button';
import { 
  Copy,
  Menu,
  Bot,
  Check,
  Trash2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatMessage } from "../types/chat";
import agentChatService from "../services/agentChatService";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "../context/AuthContext";
import { useVoiceChat } from "@/context/VoiceChatContext";
import PracticeSidebar from "./PracticeSidebar";
import MainChatArea from "./MainChatArea";

interface Agent {
  _id: string
  title: string
  subtitle: string
  prompt: string
  toolName: string
  color: string
  icon?: { data: string; contentType: string } | null
  videoUrl?: string | null
  isActive: boolean
  order: number
  appLink?: string | null
}

interface CodeProps {
  inline?: boolean
  className?: string
  children: React.ReactNode
}

const PracticeWelcome = () => {
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCustomAgents, setShowCustomAgents] = useState(false);
  const [showMyAgents, setShowMyAgents] = useState(false);
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const { user, logout, token } = useAuth();
  const { openVoiceChat } = useVoiceChat();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    window.location.reload();
  };

  const handleVoiceRecord = () => {
    if (selectedAgent) {
      openVoiceChat(selectedAgent._id, selectedAgent.title);
    }
  };

  const handleCustomAgentsClick = () => {
    setShowCustomAgents(true);
    setShowMyAgents(false);
    setSelectedAgent(null);
    // On mobile, close sidebar when custom agents is clicked
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleMyAgentsClick = () => {
    setShowMyAgents(true);
    setShowCustomAgents(false);
    setSelectedAgent(null);
    // On mobile, close sidebar when my agents is clicked
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleCustomAgentSelect = (customAgent: any) => {
    // For now, we'll treat custom agents similarly to regular agents
    // You might want to create a different type or interface for custom agents
    console.log('Selected custom agent:', customAgent);
    setShowCustomAgents(false);
    setShowMyAgents(false);
  };

  // Fetch agents from backend
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setAgents(data)
      } catch (error) {
        console.error("Error fetching agents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  // Load chat history and dynamic prompts when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      loadChatHistory(selectedAgent._id);
      fetchDynamicPrompts(selectedAgent._id);
    }
  }, [selectedAgent, token]);

  const loadChatHistory = async (agentId: string) => {
    try {
      setIsLoading(true);
      const history = await agentChatService.getChatHistory(agentId);
      if (history && history.length > 0) {
        const formattedHistory = history.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        setMessages(formattedHistory);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDynamicPrompts = async (agentId: string) => {
    try {
      setPromptsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/agents/dynamic-prompts/by-agent/${agentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch dynamic prompts');
      }

      const data = await response.json();
      setDynamicPrompts(data.generatedUserPrompts || []);
    } catch (error) {
      console.error('Error fetching dynamic prompts:', error);
      // Fallback prompts
      setDynamicPrompts([
        "Write a 1000 word essay describing the qualities of AI...",
        "What are some little known hacks for creative writing?",
        "Compose a business plan for my startup that...",
        "Write a detailed blog post exploring tropes found in..."
      ]);
    } finally {
      setPromptsLoading(false);
    }
  };

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        const id = `${new Date().getTime()}`;
        setCopiedMessageId(id);
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      },
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !selectedAgent) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await agentChatService.chat(selectedAgent._id, message);

      if (response.history) {
        setMessages(response.history.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        })));
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]); // Clear messages when switching agents
    setShowCustomAgents(false); // Hide custom agents view when regular agent is selected
    setShowMyAgents(false); // Hide my agents view when regular agent is selected
    // On mobile, close sidebar when agent is selected
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const clearChat = useCallback(async () => {
    if (!selectedAgent) return;
    try {
      await agentChatService.clearChatHistory(selectedAgent._id);
      setMessages([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  }, [selectedAgent]);

  const handleClearChatClick = () => {
    setShowClearConfirm(true);
  };

  const handlePromptClick = async (promptText: string) => {
    if (!selectedAgent || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: promptText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await agentChatService.chat(selectedAgent._id, promptText);

      if (response.history) {
        setMessages(response.history.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        })));
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const markdownComponents = {
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => copyToClipboard(String(children))}
              className="bg-gray-800 text-gray-300 hover:text-white p-1 rounded"
              title="Copy code"
            >
              {copiedMessageId?.includes('code') ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="bg-gray-800 rounded-md text-xs font-mono text-gray-400 p-1 mb-0">
            <div className="flex items-center justify-between px-4 py-1 border-b border-gray-700">
              <span>{match[1]}</span>
            </div>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className="rounded-b-md !mt-0"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code
          className={`${className} bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono`}
          {...props}
        >
          {children}
        </code>
      );
    },
    p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
    li: ({ children }) => <li className="text-gray-700">{children}</li>,
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 pb-1 border-b border-gray-200">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold text-gray-900 mb-3 mt-6 pb-1 border-b border-gray-200">
        {children}
      </h2>
    ),
    h3: ({ children }) => <h3 className="text-lg font-bold text-gray-900 mb-3 mt-5">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="h-screen bg-gray-50 flex font-sans overflow-hidden relative">
      <PracticeSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        agents={agents}
        loading={loading}
        selectedAgent={selectedAgent}
        onAgentSelect={handleAgentSelect}
        showLogoutConfirm={showLogoutConfirm}
        setShowLogoutConfirm={setShowLogoutConfirm}
        handleLogout={handleLogout}
        onCustomAgentsClick={handleCustomAgentsClick}
        onMyAgentsClick={handleMyAgentsClick}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        {/* Chat Header with Menu Button - Only show when sidebar is closed and no agent selected and not showing custom agents or my agents */}
        {!isSidebarOpen && !selectedAgent && !showCustomAgents && !showMyAgents && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Sticky Selected Agent Header */}
        {selectedAgent && !showCustomAgents && !showMyAgents && (
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {/* Left: Menu Button (when sidebar closed) */}
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              
              {/* Center: Agent Info */}
              <div className="flex items-center gap-3 flex-1 justify-center">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {selectedAgent.icon ? (
                    <img 
                      src={`data:${selectedAgent.icon.contentType};base64,${selectedAgent.icon.data}`}
                      alt={selectedAgent.title}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <Bot className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedAgent.title}</h3>
                  <p className="text-sm text-gray-600">{selectedAgent.subtitle}</p>
                </div>
              </div>
              
              {/* Right: Clear Chat Button or Spacer for balance */}
              <div className="flex items-center">
                <button
                  onClick={handleClearChatClick}
                  className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  title="Clear chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                {!isSidebarOpen && <div className="w-1"></div>}
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <MainChatArea
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedAgent={selectedAgent}
          messages={messages}
          isLoading={isLoading}
          copiedMessageId={copiedMessageId}
          showCustomAgents={showCustomAgents}
          showMyAgents={showMyAgents}
          dynamicPrompts={dynamicPrompts}
          promptsLoading={promptsLoading}
          message={message}
          setMessage={setMessage}
          handleSubmit={handleSubmit}
          handleVoiceRecord={handleVoiceRecord}
          copyToClipboard={copyToClipboard}
          handlePromptClick={handlePromptClick}
          handleCustomAgentSelect={handleCustomAgentSelect}
          markdownComponents={markdownComponents}
        />
      </div>
      
      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Clear Chat History</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all messages in this chat? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={clearChat}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              >
                Clear Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeWelcome;