import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Sparkles, ArrowRight, Star, Zap } from "lucide-react"

interface AgentData {
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
}

const funEmojis = [
  "🌀",
  "🤖",
  "🎨",
  "🧠",
  "🚀",
  "📚",
  "💡",
  "🎵",
  "🌟",
  "🧩",
  "🦄",
  "🎲",
  "🕹️",
  "📝",
  "🔬",
  "🎮",
  "🧬",
  "🌈",
  "🎯",
  "🧸",
]

const gradientColors = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
]

function getEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // YouTube
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId = ""
      if (urlObj.hostname.includes("youtube.com")) {
        const params = new URLSearchParams(urlObj.search)
        videoId = params.get("v") || ""
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.split("/").pop() || ""
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
    // Google Drive
    if (urlObj.hostname.includes("drive.google.com")) {
      const match = urlObj.pathname.match(/\/file\/d\/([^/]+)\/view/)
      if (match && match[1]) {
        const fileId = match[1]
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
    }
    // Loom
    if (urlObj.hostname.includes("loom.com")) {
      if (urlObj.pathname.includes("/share/")) {
        const shareId = urlObj.pathname.split("/").pop() || ""
        if (shareId) {
          return `https://www.loom.com/embed/${shareId}`
        }
      } else if (urlObj.pathname.includes("/embed/")) {
        return url
      }
    }
    return url
  } catch (e) {
    console.error("Error parsing video URL:", e)
    return null
  }
}

const AgentsSection: React.FC = () => {
  const [agents, setAgents] = useState<AgentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: AgentData[] = await response.json()
        setAgents(data.filter((agent) => agent.isActive))
      } catch (error) {
        console.error("Error fetching agents for AgentsSection:", error)
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  const handleWatchVideoClick = (videoUrl: string | null) => {
    if (videoUrl) {
      const embedUrl = getEmbedUrl(videoUrl)
      if (embedUrl) {
        setCurrentVideoUrl(embedUrl)
        setShowVideoModal(true)
      } else {
        alert("Could not generate embed URL for this video link.")
      }
    } else {
      alert("No video available for this agent yet.")
    }
  }

  const handleCloseVideoModal = () => {
    setShowVideoModal(false)
    setCurrentVideoUrl(null)
  }

  if (loading) {
    return (
      <section className="py-20 bg-purple-900 text-center text-white">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 animate-spin" />
          Loading AI Agents...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-purple-900 text-center text-red-400">
        <div className="flex items-center justify-center gap-3">
          <Zap className="w-6 h-6" />
          Error loading AI Agents: {error.message}
        </div>
      </section>
    )
  }

  const displayAgents = agents.filter((agent) => agent.toolName)

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">Meet Your AI Agents</h2>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Choose your AI learning companion and unlock powerful apps designed to accelerate your skills
          </p>
        </div>

        {/* Agents grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayAgents.map((agent, idx) => (
            <Card
              key={agent._id}
              className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 overflow-hidden"
            >
              {/* Gradient top border */}
              <div className={`h-1 bg-gradient-to-r ${gradientColors[idx % gradientColors.length]}`} />

              <CardContent className="p-0">
                {/* Header section with icon and name */}
                <div className="relative p-6 pb-4">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-3xl opacity-50" />

                  {/* Agent icon */}
                  <div className="relative z-10 mb-4">
                    {agent.icon && agent.icon.data && agent.icon.contentType ? (
                      <div className="relative">
                        <img
                          src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                          alt={`${agent.title} Icon`}
                          className="w-20 h-20 object-cover rounded-2xl mx-auto shadow-lg border-4 border-white"
                        />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          className={`w-20 h-20 bg-gradient-to-r ${gradientColors[idx % gradientColors.length]} rounded-2xl mx-auto shadow-lg flex items-center justify-center text-4xl border-4 border-white`}
                        >
                          {funEmojis[idx % funEmojis.length]}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Agent name */}
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2 group-hover:text-purple-700 transition-colors duration-300">
                    {agent.title}
                  </h3>
                </div>

                {/* Content section */}
                <div className="px-6 pb-6">
                  {/* Sample prompt */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sample Prompt</span>
                      </div>
                      <p className="text-gray-800 italic text-sm leading-relaxed">"{agent.prompt}"</p>
                    </div>
                  </div>

                  {/* App info */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">Unlocks App</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{agent.toolName}</p>
                  </div>

                  {/* Category badge */}
                  <div className="mb-6">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${gradientColors[idx % gradientColors.length]} text-white rounded-full text-sm font-medium shadow-lg`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      {agent.subtitle}
                    </span>
                  </div>

                  {/* Unlock message */}
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-blue-800 text-sm text-center font-medium">
                        🎯 Complete a prompt with your agent to unlock this app
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  <Button
                    variant={agent.videoUrl ? "default" : "outline"}
                    className={`w-full rounded-xl font-semibold text-sm py-3 transition-all duration-300 ${
                      agent.videoUrl
                        ? `bg-gradient-to-r ${gradientColors[idx % gradientColors.length]} hover:shadow-lg hover:scale-105 text-white border-0`
                        : "text-gray-400 border-gray-300 cursor-not-allowed opacity-60"
                    }`}
                    disabled={!agent.videoUrl}
                    onClick={() => handleWatchVideoClick(agent.videoUrl || null)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Play className="h-4 w-4" />
                      <span>Watch Introduction</span>
                      {agent.videoUrl && (
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced Video Modal */}
      {showVideoModal && currentVideoUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Agent Introduction</h3>
              </div>
              <button
                onClick={handleCloseVideoModal}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Container */}
            <div className="relative bg-gray-900" style={{ paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={currentVideoUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Agent Video"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AgentsSection
