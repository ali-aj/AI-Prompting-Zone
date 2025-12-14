import { useState } from "react"
import CustomAgents from "./CustomAgents"
import CustomAgentChat from "./CustomAgentChat"

const PracticeCustomAgents = () => {
  const [showAgentChat, setShowAgentChat] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  const handleStartChatting = (agentId: string) => {
    setSelectedAgentId(agentId)
    setShowAgentChat(true)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6">
        <CustomAgents onStartChat={handleStartChatting} />
      </div>

      {/* Custom Agent Chat Modal */}
      {showAgentChat && selectedAgentId && (
        <CustomAgentChat 
          onClose={() => {
            setShowAgentChat(false)
            setSelectedAgentId(null)
          }} 
          agentId={selectedAgentId}
        />
      )}
    </section>
  )
}

export default PracticeCustomAgents
