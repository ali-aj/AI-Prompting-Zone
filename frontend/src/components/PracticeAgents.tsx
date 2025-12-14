import { useState, useEffect } from "react"
import AgentCard from "./AgentCard"
import AgentChat from "./AgentChat"
import { progressService } from '../services/progressService';

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

const PracticeAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [showAgentChat, setShowAgentChat] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>()
  const [unlockedApps, setUnlockedApps] = useState<string[]>([])

  // Helper function to get embed URL based on video source
  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)

      // Handle YouTube links
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

      // Handle Google Drive links
      if (urlObj.hostname.includes("drive.google.com")) {
        const match = urlObj.pathname.match(/\/file\/d\/([^/]+)\/view/)
        if (match && match[1]) {
          const fileId = match[1]
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }

      // Handle Loom links
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
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  // New useEffect to fetch student progress
  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        const progress = await progressService.getProgress();
        if (progress && progress.appsUnlocked) {
          setUnlockedApps(progress.appsUnlocked);
        }
      } catch (error) {
        console.error("Error fetching student progress:", error);
      }
    };
    fetchStudentProgress();
  }, []);

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

  const handleStartChatting = (agentId: string, prompt?: string) => {
    setSelectedAgentId(agentId)
    setInitialPrompt(prompt)
    setShowAgentChat(true)
  }

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xl font-semibold text-gray-700">Loading agents...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="p-8 bg-red-50 border border-red-200 rounded-3xl">
            <span className="text-xl text-red-600 font-semibold">Error loading agents: {error.message}</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl shadow-xl">
              <span className="text-4xl">🧠</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meet Your Prompting Agents
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            These aren’t just chatbots. Our agents are built using Agentic AI — they adapt, grow with the user, and guide them through real tasks using Reactive Parallelism and Continuous AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {agents.map((agent) => (
            <AgentCard
              key={agent._id}
              agentId={agent._id}
              icon={agent.icon ? `data:${agent.icon.contentType};base64,${agent.icon.data}` : ""}
              title={agent.title}
              subtitle={agent.subtitle}
              prompt={agent.prompt}
              toolName={agent.toolName}
              color={agent.color || "text-purple-600"}
              videoUrl={agent.videoUrl}
              onWatchVideoClick={handleWatchVideoClick}
              onStartPrompting={(prompt) => handleStartChatting(agent._id, prompt)}
              onStartChat={() => handleStartChatting(agent._id)}
              isAppUnlocked={unlockedApps.includes(agent.toolName)}
              appLink={agent.appLink}
            />
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && currentVideoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-end">
              <button onClick={handleCloseVideoModal} className="text-gray-500 hover:text-gray-700 text-xl">
                &times;
              </button>
            </div>
            <div
              className="mt-2"
              style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}
            >
              <iframe
                src={currentVideoUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Agent Video"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* AgentChat Modal */}
      {showAgentChat && selectedAgentId && (
        <AgentChat 
          onClose={() => {
            setShowAgentChat(false)
            setSelectedAgentId(null)
            setInitialPrompt(undefined)
          }} 
          agentId={selectedAgentId}
          initialPrompt={initialPrompt}
        />
      )}
    </section>
  )
}

export default PracticeAgents