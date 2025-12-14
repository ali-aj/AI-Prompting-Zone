import { Input } from '@/components/ui/input';
import { 
  Send, 
  Mic, 
  Copy,
  Menu,
  Bot,
  User,
  Check
} from 'lucide-react';
import { useRef, useEffect } from 'react';
import type { ChatMessage } from "../types/chat";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import CustomAgentsView from "./CustomAgentsView";
import MyAgentsView from "./MyAgentsView";

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

interface MainChatAreaProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedAgent: Agent | null;
  messages: ChatMessage[];
  isLoading: boolean;
  copiedMessageId: string | null;
  showCustomAgents: boolean;
  showMyAgents: boolean;
  dynamicPrompts: string[];
  promptsLoading: boolean;
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleVoiceRecord: () => void;
  copyToClipboard: (content: string) => void;
  handlePromptClick: (prompt: string) => void;
  handleCustomAgentSelect: (agent: any) => void;
  markdownComponents: any;
}

const MainChatArea = ({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedAgent,
  messages,
  isLoading,
  copiedMessageId,
  showCustomAgents,
  showMyAgents,
  dynamicPrompts,
  promptsLoading,
  message,
  setMessage,
  handleSubmit,
  handleVoiceRecord,
  copyToClipboard,
  handlePromptClick,
  handleCustomAgentSelect,
  markdownComponents
}: MainChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when agent is selected (to show initial prompts)
  useEffect(() => {
    if (selectedAgent) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedAgent]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Custom Agents Header */}
      {showCustomAgents && (
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
            
            {/* Center: Custom Agents Title */}
            <div className="flex items-center gap-3 flex-1 justify-center">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                {/* Icon can be added here if needed */}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Custom Agents</h3>
              </div>
            </div>
            
            {/* Right: Spacer for balance */}
            <div className="flex items-center">
              {!isSidebarOpen && <div className="w-6"></div>}
            </div>
          </div>
        </div>
      )}

      {/* My Agents Header */}
      {showMyAgents && (
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
            
            {/* Center: My Agents Title */}
            <div className="flex items-center gap-3 flex-1 justify-center">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                {/* Icon can be added here if needed */}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">My Agents</h3>
              </div>
            </div>
            
            {/* Right: Spacer for balance */}
            <div className="flex items-center">
              {!isSidebarOpen && <div className="w-6"></div>}
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto max-h-full">
        {showCustomAgents ? (
          <div className="max-w-4xl mx-auto h-full">
            <CustomAgentsView onAgentSelect={handleCustomAgentSelect} />
          </div>
        ) : showMyAgents ? (
          <div className="max-w-4xl mx-auto h-full">
            <MyAgentsView onAgentSelect={handleCustomAgentSelect} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 h-full">
            {/* Welcome Message or Agent Info */}
            {!selectedAgent && (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an AI Agent</h3>
                  <p className="text-gray-600">Choose an agent from the sidebar to start chatting</p>
                </div>
              </div>
            )}

          {/* Message List */}
          {selectedAgent && (
            <div className="space-y-6">
              {messages.length === 0 && !isLoading ? (
                <div className="h-full flex flex-col">
                  {/* Agent Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      {selectedAgent.icon ? (
                        <img 
                          src={`data:${selectedAgent.icon.contentType};base64,${selectedAgent.icon.data}`}
                          alt={selectedAgent.title}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Bot className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedAgent.title}</h1>
                    <p className="text-gray-700 mt-2">{selectedAgent.subtitle}</p>
                  </div>

                  {/* Example Prompts */}
                  <div className="flex-1 max-w-4xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {promptsLoading ? (
                        // Loading skeleton for prompts
                        Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
                          >
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                              </div>
                              <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        dynamicPrompts.map((prompt, index) => (
                          <div
                            key={index}
                            onClick={() => handlePromptClick(prompt)}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 hover:border-gray-300"
                          >
                            <p className="text-gray-700 text-sm leading-relaxed">{prompt}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={`${msg.timestamp}-${index}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-6`}>
                    <div className={`flex gap-3 max-w-2xl ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {msg.role === "user" ? (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            {selectedAgent?.icon ? (
                              <img 
                                src={`data:${selectedAgent.icon.contentType};base64,${selectedAgent.icon.data}`}
                                alt={selectedAgent.title}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <Bot className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`rounded-2xl p-4 ${
                          msg.role === "user" 
                            ? "bg-purple-600 text-white" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {msg.role === "user" ? (
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown components={markdownComponents}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Message Actions and Timestamp */}
                        <div className={`flex items-center mt-2 gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          {msg.role === "assistant" && (
                            <button
                              onClick={() => copyToClipboard(msg.content)}
                              className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs py-1 px-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              {copiedMessageId === `${msg.timestamp}-${index}` ? (
                                <>
                                  <Check className="w-3 h-3" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy
                                </>
                              )}
                            </button>
                          )}
                          {msg.timestamp && (
                            <div className="text-xs text-gray-400">
                              {format(new Date(msg.timestamp), "HH:mm")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="flex gap-3 max-w-2xl">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        {selectedAgent?.icon ? (
                          <img 
                            src={`data:${selectedAgent.icon.contentType};base64,${selectedAgent.icon.data}`}
                            alt={selectedAgent.title}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <Bot className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                    </div>

                    {/* Skeleton Message Content */}
                    <div className="flex flex-col items-start space-y-2">
                      <div className="rounded-2xl p-4 bg-gray-100 min-w-80">
                        {/* Skeleton lines with shimmer effect */}
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-4/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-3/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          </div>
        )}
      </div>

      {/* Input Area */}
      {!showCustomAgents && !showMyAgents && (
        <div className="p-6 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className={`relative group ${!selectedAgent ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
              
              {/* Input container */}
              <div className="relative flex items-center bg-white border border-gray-300 rounded-xl p-3 group-focus-within:border-purple-400 transition-colors duration-300">
                {/* Microphone button - only show for specific agents */}
                {selectedAgent && (selectedAgent.title === "Spiral the Study Buddy" || selectedAgent.title === "Gary Payton the Wizard") && (
                  <button 
                    type="button" 
                    onClick={handleVoiceRecord}
                    className="text-gray-400 hover:text-purple-600 mr-3 transition-colors duration-200 hover:scale-105" 
                    disabled={!selectedAgent}
                    title="Start voice chat"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
                
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedAgent ? `Chat with ${selectedAgent.title}...` : "Select an agent to start chatting"}
                  className="flex-1 border-0 focus:ring-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={!selectedAgent || isLoading}
                />
                
                <button 
                  type="submit"
                  className={`rounded-lg p-2 transition-colors ${
                    selectedAgent && !isLoading && message.trim()
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!selectedAgent || isLoading || !message.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default MainChatArea;
