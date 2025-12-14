import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import type { ChatMessage } from "../types/chat"
import agentChatService from "../services/agentChatService"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"
import { format } from "date-fns"
import { Smile, Send, Trash2, User, Bot, Copy, Check, ChevronDown, ChevronUp, Trophy, Sparkles, Mic } from "lucide-react"
import { toast } from "sonner"
import { useVoiceChat } from "@/context/VoiceChatContext"

interface AgentChatProps {
  onClose: () => void
  agentId: string
  initialPrompt?: string
}

interface Agent {
  _id: string
  title: string
  subtitle: string
  color?: string
  toolName: string
}

interface CodeProps {
  inline?: boolean
  className?: string
  children: React.ReactNode
}

interface MessageGroupProps {
  role: string
  messages: ChatMessage[]
  onCopy: (content: string) => void
  copiedMessageId: string | null
}

interface ChatSession {
  _id: string;
  agentId: string;
  userId: string;
  context: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Level progression interfaces
type TaskLevel = 'Starter' | 'Growth' | 'Mastery';

interface LevelInfo {
  currentLevel: TaskLevel;
  promptCount: number;
  isAppUnlocked: boolean;
}

// Utility to extract markdown links from a string
function extractMarkdownLinks(text: string) {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: { title: string; url: string }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    links.push({ title: match[1], url: match[2] });
  }
  return links;
}

const MessageGroup: React.FC<MessageGroupProps & { agentName: string }> = memo(({ role, messages, onCopy, copiedMessageId, agentName }) => {
  const isUser = role === "user"
  const [collapsed, setCollapsed] = useState(false)

  const markdownComponents = useMemo(() => ({
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "")
      return !inline && match ? (
        <div className="relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(String(children))}
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
      )
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
    h4: ({ children }) => <h4 className="text-base font-bold text-gray-900 mb-2 mt-4">{children}</h4>,
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
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-500">{children}</td>,
    hr: () => <hr className="my-6 border-t border-gray-200" />,
    img: ({ src, alt }) => (
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="max-w-full h-auto rounded-lg my-4 border border-gray-200"
      />
    ),
  }), [onCopy, copiedMessageId])

  return (
    <div className={`py-4 ${isUser ? "bg-white" : "bg-gray-50"} border-b border-gray-100`}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
          )}
          <div className="font-medium text-sm text-gray-700">{isUser ? "You" : agentName}</div>
        </div>

        <div className="pl-11 space-y-4">
          {messages.map((message, idx) => {
            // Only extract links for assistant messages
            const links = !isUser ? extractMarkdownLinks(message.content) : [];
            // Remove links from the markdown content for display
            let contentWithoutLinks = message.content;
            if (links.length > 0) {
              links.forEach(link => {
                // Remove the link markdown from the content
                contentWithoutLinks = contentWithoutLinks.replace(`[${link.title}](${link.url})`, '');
              });
            }
            return (
              <div key={`${message.timestamp}-${idx}`} className={`relative ${collapsed && idx > 0 ? "hidden" : "block"}`}>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown components={markdownComponents}>
                    {contentWithoutLinks.trim()}
                  </ReactMarkdown>
                </div>
                {/* Render Learn More/See Example buttons for links */}
                {!isUser && links.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white text-center font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all text-base sm:text-sm"
                        style={{ minWidth: 140 }}
                      >
                        {i === 0 ? 'Learn More' : 'See Example'}
                      </a>
                    ))}
                  </div>
                )}

                {!isUser && (
                  <div className="flex items-center justify-end mt-2 gap-2">
                    <button
                      onClick={() => onCopy(message.content)}
                      className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs py-1 px-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {copiedMessageId === `${message.timestamp}-${idx}` ? (
                        <>
                          <Check className="w-3 h-3" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                    {message.timestamp && (
                      <div className="text-xs text-gray-400">{format(new Date(message.timestamp), "HH:mm")}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {messages.length > 1 && (
          <div className="pl-11 mt-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {collapsed ? (
                <>
                  <ChevronDown className="w-3 h-3" /> Show {messages.length - 1} more messages
                </>
              ) : (
                <>
                  <ChevronUp className="w-3 h-3" /> Collapse thread
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

const AgentChat: React.FC<AgentChatProps> = ({ onClose, agentId, initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [agent, setAgent] = useState<Agent | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInitialPromptHandled = useRef(false)

  // New state for level progression
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    currentLevel: 'Starter',
    promptCount: 0,
    isAppUnlocked: false,
  });
  const [showMockAppModal, setShowMockAppModal] = useState(false);
  const [hasShownUnlockModal, setHasShownUnlockModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { openVoiceChat } = useVoiceChat();

  // Memoize the input change handler to prevent unnecessary re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  // Memoize the copy function to prevent re-creating it on every render
  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        const id = `${new Date().getTime()}`
        setCopiedMessageId(id)
        setTimeout(() => {
          setCopiedMessageId(null)
        }, 2000)
      },
      (err) => {
        console.error("Could not copy text: ", err)
      },
    )
  }, [])

  // Memoize the emoji click handler
  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }, [])

  // Voice recording handler
  const handleVoiceRecord = useCallback(() => {
    openVoiceChat(agentId, agent?.title);
  }, [agentId, agent?.title, openVoiceChat]);

  // Memoize the scroll function with throttling
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  // Throttled version of scroll to prevent excessive scrolling during rapid updates
  const throttledScrollToBottom = useCallback(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [scrollToBottom])

  // Group messages efficiently with useMemo
  const groupedMessages = useMemo(() => {
    const groups: { role: string; messages: ChatMessage[] }[] = []
    let currentGroup: { role: string; messages: ChatMessage[] } | null = null

    if (messages && messages.length > 0) {
      messages.forEach((message) => {
        if (!currentGroup || currentGroup.role !== message.role) {
          if (currentGroup) {
            groups.push(currentGroup)
          }
          currentGroup = { role: message.role, messages: [message] }
        } else {
          currentGroup.messages.push(message)
        }
      })

      if (currentGroup) {
        groups.push(currentGroup)
      }
    }
    return groups
  }, [messages])

  useEffect(() => {
    const initializeChat = async () => {
      setIsInitializing(true);
      await Promise.all([
        loadAgentDetails(),
        loadChatHistory()
      ]);
      setIsInitializing(false);
    };

    initializeChat();
  }, [agentId])

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && !isInitialPromptHandled.current && !isInitializing) {
      isInitialPromptHandled.current = true;
      // Use setTimeout to ensure the chat is fully initialized
      setTimeout(() => {
        handleSubmit(new Event('submit') as any, initialPrompt);
      }, 100);
    }
  }, [initialPrompt, agentId, isInitializing]);

  const loadAgentDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents/${agentId}`)
      if (!response.ok) throw new Error('Failed to fetch agent details')
      const data = await response.json()
      setAgent(data)
    } catch (error) {
      console.error("Error loading agent details:", error)
    }
  }

  const loadChatHistory = async () => {
    try {
      const history = await agentChatService.getChatHistory(agentId)
      if (history && history.length > 0) {
        // Convert string timestamps to Date objects
        const formattedHistory = history.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }))
        setMessages(formattedHistory)

        // Load level info from the first chat session
        const chatSession = await agentChatService.getActiveChat(agentId);
        if (chatSession && chatSession.context) {
          try {
            const contextData = JSON.parse(chatSession.context);
            setLevelInfo({
              currentLevel: contextData.level || 'Starter',
              promptCount: contextData.promptCount || formattedHistory.length,
              isAppUnlocked: contextData.isAppUnlocked || false,
            });
            // Don't show the modal when loading chat history - it should only show when first unlocked
            setHasShownUnlockModal(contextData.isAppUnlocked || false);
          } catch (error) {
            console.error('Error parsing context:', error);
          }
        }
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      setMessages([])
    }
  }

  useEffect(() => {
    const cleanup = throttledScrollToBottom()
    return cleanup
  }, [messages, throttledScrollToBottom])

  const handleSubmit = useCallback(async (e: React.FormEvent, customInput?: string) => {
    e.preventDefault()
    const messageToSend = customInput || input
    if (!messageToSend.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!customInput) {
      setInput("")
    }
    setIsLoading(true)

    try {
      const response = await agentChatService.chat(agentId, messageToSend);

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

      // Update level info from response
      if (response.currentLevel && response.promptCount !== undefined) {
        setLevelInfo({
          currentLevel: response.currentLevel,
          promptCount: response.promptCount,
          isAppUnlocked: response.isAppUnlockReady || false,
        });
      }

      // Show level progression notifications
      if (response.currentLevel && response.currentLevel !== levelInfo.currentLevel) {
        const levelDescriptions = {
          'Starter': 'Beginner level - Simple concepts and basic understanding',
          'Growth': 'Intermediate level - More detailed explanations and intermediate concepts',
          'Mastery': 'Advanced level - Complex topics and deep analytical thinking'
        };

        toast.success(`Level Up! 🎉`, {
          description: `You've reached ${response.currentLevel} level! ${levelDescriptions[response.currentLevel as keyof typeof levelDescriptions]}`,
          icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
          duration: 5000,
        });
      }

      // Show app unlock notification
      if (response.isAppUnlockReady && !levelInfo.isAppUnlocked && !hasShownUnlockModal) {
        setShowMockAppModal(true);
        setHasShownUnlockModal(true);
        toast.success(`App Unlocked! 🏆`, {
          description: `You've unlocked ${agent?.toolName}!`,
          icon: <Trophy className="w-5 h-5 text-yellow-400" />,
          duration: 4000,
        });
      }

    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, agentId, levelInfo.currentLevel, levelInfo.isAppUnlocked, hasShownUnlockModal, agent?.toolName])

  const clearChat = useCallback(async () => {
    try {
      await agentChatService.clearChatHistory(agentId)
      setMessages([])
      setLevelInfo({
        currentLevel: 'Starter',
        promptCount: 0,
        isAppUnlocked: false,
      });
      setShowMockAppModal(false);
      setHasShownUnlockModal(false);
    } catch (error) {
      console.error("Error clearing chat:", error)
    }
  }, [agentId])

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {isInitializing ? (
        <div className="bg-white rounded-xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl" data-modal-content>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-300"></div>
              </div>
              <p className="text-gray-600 text-lg">Loading chat...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl" data-modal-content>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Chat with {agent?.title || 'Agent'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelInfo.currentLevel === 'Starter' ? 'bg-blue-100 text-blue-700' :
                    levelInfo.currentLevel === 'Growth' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                    {levelInfo.currentLevel} Level
                  </span>
                  <span className="text-gray-500">• {levelInfo.promptCount} prompts</span>
                  {levelInfo.currentLevel === 'Starter' && levelInfo.promptCount < 25}
                  {levelInfo.currentLevel === 'Growth' && levelInfo.promptCount < 40}
                  {levelInfo.currentLevel === 'Mastery' && !levelInfo.isAppUnlocked}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-white" style={{ contain: 'layout style paint' }}>
            {!messages || messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-4">
                <Bot className="w-12 h-12 text-purple-300" />
                <p>Start a conversation with {agent?.title || 'Agent'}</p>
              </div>
            ) : (
              <div className="min-h-full">
                {groupedMessages.map((group, index) => (
                  <MessageGroup
                    key={`${group.role}-${index}-${group.messages[0]?.timestamp}`}
                    role={group.role}
                    messages={group.messages}
                    onCopy={copyToClipboard}
                    copiedMessageId={copiedMessageId}
                    agentName={agent?.title || 'Agent'}
                  />
                ))}
              </div>
            )}
            {isLoading && (
              <div className="py-4 bg-gray-50 border-b border-gray-100">
                <div className="max-w-2xl mx-auto px-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="font-medium text-sm text-gray-700">{agent?.title || 'Agent'}</div>
                  </div>
                  <div className="pl-11">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-300"></div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={(e) => handleSubmit(e)} className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleVoiceRecord}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Start voice conversation"
              >
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={`Type your message... (${levelInfo.currentLevel} Level)`}
                className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
            {showEmojiPicker && (
              <div className="absolute bottom-20 right-4 z-10">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </form>

          {/* Mock App Modal */}
          {showMockAppModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {agent?.toolName || 'Mock App'}
                  </h2>
                  <button onClick={() => setShowMockAppModal(false)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                    ✕
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 text-center text-gray-600">
                  <div>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-4 text-green-600">
                      Congratulations!
                    </h2>
                    <p className="text-xl mb-2">
                      You have successfully unlocked
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mb-6">
                      {agent?.toolName || 'Your App'}!
                    </p>
                    <p className="text-lg text-gray-500">
                      Great job on reaching Mastery level and completing all the challenges!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default AgentChat
