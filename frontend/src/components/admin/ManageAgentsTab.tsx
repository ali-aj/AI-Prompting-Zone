import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Loader2, Brain } from "lucide-react"
import { toast } from "sonner"

interface Agent {
  _id: string
  title: string
  subtitle: string
  prompt: string
  toolName: string
  videoUrl: string
  isActive: boolean
  order: number
  color: string
  icon?: { data: string; contentType: string }
  appLink?: string
}

const ManageAgentsTab = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    prompt: "",
    toolName: "",
    videoUrl: "",
    isActive: true,
    order: 0,
    appLink: "",
  })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setAgents(data)
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast.error("Failed to load agents")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0])
    }
  }

  const handleCreateAgent = async () => {
    setSaving(true)
    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, String(value))
    })
    if (iconFile) formDataToSend.append("icon", iconFile)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents/create-agent`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create agent")
      }

      toast.success("Agent created successfully!")
      resetForm()
      fetchAgents()
    } catch (error) {
      console.error("Error creating agent:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create agent")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAgent = async () => {
    if (!editingAgent) return
    setSaving(true)

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "title") formDataToSend.append(key, String(value))
    })
    if (iconFile) formDataToSend.append("icon", iconFile)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents/${editingAgent._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update agent")
      }

      toast.success("Agent updated successfully!")
      resetForm()
      fetchAgents()
    } catch (error) {
      console.error("Error updating agent:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update agent")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents/${agentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete agent")
      }

      toast.success("Agent deleted successfully!")
      fetchAgents()
    } catch (error) {
      console.error("Error deleting agent:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete agent")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      prompt: "",
      toolName: "",
      videoUrl: "",
      isActive: true,
      order: 0,
      appLink: "",
    })
    setIconFile(null)
    setEditingAgent(null)
    setShowForm(false)
  }

  const startEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      title: agent.title,
      subtitle: agent.subtitle,
      prompt: agent.prompt,
      toolName: agent.toolName,
      videoUrl: agent.videoUrl || "",
      isActive: agent.isActive,
      order: agent.order,
      appLink: agent.appLink || "",
    })
    setIconFile(null)
    setShowForm(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAgent) {
      handleUpdateAgent()
    } else {
      handleCreateAgent()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading agents...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Agents Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Create and manage your AI learning agents</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Agent
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              {editingAgent ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingAgent ? "Edit Agent" : "Create New Agent"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Agent Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter agent title"
                    disabled={!!editingAgent}
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Subtitle</label>
                  <Input
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Enter agent subtitle"
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Agent Icon</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                  {editingAgent?.icon?.data && !iconFile && (
                    <div className="flex items-center gap-2">
                      <img
                        src={`data:${editingAgent.icon.contentType};base64,${editingAgent.icon.data}`}
                        alt="Current Icon"
                        className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <span className="text-sm text-gray-500">Current icon</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Sample Prompt</label>
                <Textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  placeholder="Enter the sample prompt for this agent"
                  className="min-h-[100px] focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tool Name</label>
                  <Input
                    name="toolName"
                    value={formData.toolName}
                    onChange={handleInputChange}
                    placeholder="Enter tool name"
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Video URL</label>
                  <Input
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="Enter video URL (optional)"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tool Link</label>
                  <Input
                    name="appLink"
                    value={formData.appLink}
                    onChange={handleInputChange}
                    placeholder="Enter tool link"
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Display Order</label>
                  <Input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1 order-2 sm:order-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingAgent ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingAgent ? "Update Agent" : "Create Agent"}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="px-6 order-1 sm:order-2">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
        {agents.map((agent) => (
          <Card
            key={agent._id}
            className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 flex flex-col min-w-0"
          >
            <CardContent className="p-4 sm:p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {agent.icon ? (
                    <img
                      src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                      alt="Agent Icon"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                      {agent.title.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {agent.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{agent.subtitle}</p>
                  </div>
                </div>
                <Badge variant={agent.isActive ? "default" : "secondary"} className="text-xs flex-shrink-0 ml-2">
                  {agent.isActive ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Active</span>
                      <span className="sm:hidden">✓</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Inactive</span>
                      <span className="sm:hidden">✗</span>
                    </>
                  )}
                </Badge>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 flex-grow min-h-0">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tool</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{agent.toolName}</p>
                </div>
                {agent.videoUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Video</p>
                    <p className="text-xs sm:text-sm text-blue-600 truncate" title={agent.videoUrl}>
                      {agent.videoUrl.length > 30 ? `${agent.videoUrl.substring(0, 30)}...` : agent.videoUrl}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">#{agent.order}</p>
                </div>

                {agent.appLink && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tool Link</p>
                    <a
                      href={agent.appLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs sm:text-sm block truncate hover:text-blue-800 transition-colors"
                      title={agent.appLink}
                    >
                      {agent.appLink.length > 25 ? `${agent.appLink.substring(0, 25)}...` : agent.appLink}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 pt-3 sm:pt-4 border-t mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(agent)}
                  className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-xs px-2 py-1 h-7 sm:h-8 min-w-0 justify-center"
                >
                  <Edit className="w-3 h-3 flex-shrink-0" />
                  <span className="ml-1 hidden lg:inline text-xs truncate">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAgent(agent._id)}
                  className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs px-2 py-1 h-7 sm:h-8 min-w-0 justify-center"
                >
                  <Trash2 className="w-3 h-3 flex-shrink-0" />
                  <span className="ml-1 hidden lg:inline text-xs truncate">Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Brain className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first AI agent</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Agent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ManageAgentsTab
