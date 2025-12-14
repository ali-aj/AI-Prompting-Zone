import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Send,
  Copy,
  Bot,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  Wand2,
  Brain,
  Trash2
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from 'sonner'
import customAgentChatService, { type CustomAgentChatResponse } from '@/services/customAgentChatService'
import type { ChatMessage } from '@/types/chat'

interface CustomAgentChatProps {
  onClose: () => void
  agentId: string
}

interface CustomAgent {
  _id: string
  title: string
  subtitle: string
  toolName?: string
  icon?: { data: string; contentType: string }
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
  agentName: string
}

const MessageGroup: React.FC<MessageGroupProps> = memo(({ role, messages, onCopy, copiedMessageId, agentName }) => {
  const isUser = role === "user"
  const [collapsed, setCollapsed] = useState(false)

  const markdownComponents = useMemo(() => ({
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '')
      const content = String(children).replace(/\n$/, '')

      if (!inline && match) {
        return (
          <div className="relative">
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="rounded-lg !bg-gray-900 !mt-2 !mb-2"
              {...props}
            >
              {content}
            </SyntaxHighlighter>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300"
              onClick={() => onCopy(content)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )
      }

      return (
        <code className="bg-gray-100 text-purple-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      )
    },
    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold mb-3 text-gray-900">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-gray-900">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-semibold mb-2 text-gray-900">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-purple-300 pl-4 py-2 my-4 bg-purple-50 italic text-gray-700">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline">
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 rounded-lg">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="px-4 py-2 text-sm text-gray-700">{children}</td>,
    hr: () => <hr className="my-6 border-t border-gray-200" />,
    img: ({ src, alt }) => (
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="max-w-full h-auto rounded-lg my-4 border border-gray-200"
      />
    ),
  }), [onCopy])

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-600">
            {isUser ? 'You' : agentName}
          </span>
          {!isUser && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5">
              <Wand2 className="w-2 h-2 mr-1" />
              Custom
            </Badge>
          )}
        </div>

        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="mb-2 h-6 text-xs text-gray-500 hover:text-gray-700"
          >
            {collapsed ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronUp className="w-3 h-3 mr-1" />}
            {messages.length} messages
          </Button>
        )}

        <div className={`space-y-2 ${collapsed ? 'hidden' : ''}`}>
          {messages.map((message, index) => {
            const messageKey = `${message.role}-${index}-${message.timestamp ? new Date(message.timestamp).getTime() : Date.now()}`
            return (
              <div
                key={messageKey}
                className={`relative group p-4 rounded-2xl shadow-sm ${isUser
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white border border-gray-200'
                  }`}
              >
                <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
                  <ReactMarkdown components={markdownComponents}>
                    {message.content}
                  </ReactMarkdown>
                </div>

                {!isUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={() => onCopy(message.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}

                {copiedMessageId === messageKey && (
                  <div className="absolute -top-8 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                    Copied!
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  )
})

const CustomAgentChat: React.FC<CustomAgentChatProps> = ({ onClose, agentId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [agent, setAgent] = useState<CustomAgent | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      const messageId = Date.now().toString()
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
      toast.success("Copied to clipboard!")
    })
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (!hasInitialized.current && agentId) {
      hasInitialized.current = true
      initializeChat()
    }
  }, [agentId])

  const initializeChat = async () => {
    try {
      setIsLoading(true)

      // Fetch chat history first
      const history = await customAgentChatService.getChatHistory(agentId)

      if (history.length === 0) {
        // Fetch agent details for the header
        const agentResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })

        if (agentResponse.ok) {
          const agentData = await agentResponse.json()
          setAgent({
            _id: agentData._id,
            title: agentData.title,
            subtitle: agentData.subtitle,
            toolName: agentData.toolName,
            icon: agentData.icon
          })
        }

      } else {
        setMessages(history)

        const agentResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })

        if (agentResponse.ok) {
          const agentData = await agentResponse.json()
          setAgent({
            _id: agentData._id,
            title: agentData.title,
            subtitle: agentData.subtitle,
            toolName: agentData.toolName,
            icon: agentData.icon
          })
        }
      }
    } catch (error) {
      console.error('Error initializing custom agent chat:', error)
      toast.error('Failed to load chat')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response: CustomAgentChatResponse = await customAgentChatService.chat(agentId, input)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')

      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      return
    }

    try {
      await customAgentChatService.clearChatHistory(agentId)
      setMessages([])
      toast.success('Chat history cleared successfully!')
    } catch (error) {
      console.error('Error clearing chat history:', error)
      toast.error('Failed to clear chat history')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const groupedMessages = useMemo(() => {
    const groups: { role: string; messages: ChatMessage[] }[] = []
    let currentGroup: { role: string; messages: ChatMessage[] } | null = null

    messages.forEach(message => {
      if (!currentGroup || currentGroup.role !== message.role) {
        currentGroup = { role: message.role, messages: [message] }
        groups.push(currentGroup)
      } else {
        currentGroup.messages.push(message)
      }
    })

    return groups
  }, [messages])

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-20 z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden" data-modal-content>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {agent?.icon ? (
              <img
                src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                alt={agent.title}
                className="w-12 h-12 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{agent?.title || 'Custom Agent'}</h2>
              <p className="text-purple-100 text-sm">{agent?.subtitle || 'Custom AI Agent'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">
                  <Wand2 className="w-2 h-2 mr-1" />
                  Custom Agent
                </Badge>
                {agent?.toolName && (
                  <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">
                    🛠️ {agent.toolName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-purple-50/30 to-pink-50/30">
          {groupedMessages.map((group, index) => (
            <MessageGroup
              key={index}
              role={group.role}
              messages={group.messages}
              onCopy={copyToClipboard}
              copiedMessageId={copiedMessageId}
              agentName={agent?.title || 'Custom Agent'}
            />
          ))}

          {isLoading && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="resize-none min-h-[44px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-2xl"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl h-11 px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomAgentChat
