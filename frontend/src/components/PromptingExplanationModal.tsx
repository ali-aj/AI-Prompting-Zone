import type React from "react"
import { MessageCircle, Lightbulb, Play, ArrowRight, Zap } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"

interface Agent {
  _id: string
  title: string
  subtitle: string
  prompt: string
  toolName: string
  color: string
  icon?: { data: string; contentType: string } | null
}

interface PromptingExplanationModalProps {
  agent: Agent
  onStartChatting: (initialPrompt?: string) => void
  onClose: () => void
}

const PromptingExplanationModal: React.FC<PromptingExplanationModalProps> = ({ agent, onStartChatting, onClose }) => {
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const hasFetched = useRef(false)

  useEffect(() => {
    const fetchDynamicPrompts = async () => {
      if (hasFetched.current) return
      
      try {
        hasFetched.current = true
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/agents/dynamic-prompts/by-agent/${agent._id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch dynamic prompts')
        }

        const data = await response.json()
        setDynamicPrompts(data.generatedUserPrompts || [])
      } catch (error) {
        console.error('Error fetching dynamic prompts:', error)
        setDynamicPrompts([
          "Help me with my homework",
          "Teach me a new word"
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDynamicPrompts()
  }, [agent._id, token])

  const handlePromptClick = (prompt: string) => {
    onStartChatting(prompt)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white text-center relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">What's a Prompt?</h2>
            <p className="text-blue-100">Let me explain how we'll chat together!</p>
          </div>
        </div>

        {/* Content - Scrollable area */}
        <div className="p-8 overflow-y-auto flex-grow">
          {/* Main explanation */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Here's how it works:</h3>
                <p className="text-gray-700 leading-relaxed">
                  A prompt is when you type something to ask me for help or to do something fun. Try typing a prompt
                  like: "Help me with my homework" or "Teach me a new word." I'll show you what I can do!
                </p>
              </div>
            </div>
          </div>

          {/* Example prompts */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Try these example prompts:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      ...
                    </div>
                    <span className="text-gray-700">Loading prompts...</span>
                  </div>
                </div>
              ) : (
                dynamicPrompts.map((prompt, index) => (
                  <div
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900">"{prompt}"</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Unlock info */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Unlock: {agent.toolName}</h4>
                <p className="text-green-700 text-sm">Complete prompts to unlock this amazing tool!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - Fixed at bottom */}
        <div className="p-8 pt-0 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Go Back
          </button>
          <button
            onClick={() => onStartChatting()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            Start Chatting
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PromptingExplanationModal
