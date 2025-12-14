import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, Loader2, MessageSquare, Bot, User, Settings } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

interface Agent {
  _id: string
  title: string
  subtitle: string
}

interface DynamicPrompt {
  _id?: string
  agentId: string
  systemPrompt: string
  userPrompt: string
}

const DynamicPromptsTab = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [prompts, setPrompts] = useState<DynamicPrompt[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { token } = useAuth()

  const [newPrompt, setNewPrompt] = useState<DynamicPrompt>({
    agentId: "",
    systemPrompt: "",
    userPrompt: "",
  })
  const [editingPrompt, setEditingPrompt] = useState<DynamicPrompt | null>(null)

  useEffect(() => {
    Promise.all([fetchAgents(), fetchPrompts()]).finally(() => setLoading(false))
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents`)
      const data = await response.json()
      setAgents(data)
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast.error("Failed to load agents")
    }
  }

  const fetchPrompts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents/dynamic-prompts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      if (!response.ok) throw new Error("Failed to fetch prompts")
      const data = await response.json()
      setPrompts(data)
    } catch (error) {
      console.error("Error fetching prompts:", error)
      toast.error("Failed to load prompts")
    }
  }

  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId)
    setNewPrompt((prev) => ({ ...prev, agentId }))
  }

  const handleSavePrompt = async () => {
    if (!newPrompt.agentId || !newPrompt.systemPrompt || !newPrompt.userPrompt) {
      toast.error("Please fill in all fields")
      return
    }

    setSaving(true)
    try {
      const url = editingPrompt ? 
        `${import.meta.env.VITE_BACKEND_URL}/api/agents/dynamic-prompts/${editingPrompt._id}` : 
        `${import.meta.env.VITE_BACKEND_URL}/api/agents/dynamic-prompts`;
      const method = editingPrompt ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPrompt),
      })

      if (!response.ok) throw new Error("Failed to save prompt")

      toast.success(`Prompt ${editingPrompt ? "updated" : "saved"} successfully!`)
      resetForm()
      fetchPrompts()
    } catch (error) {
      console.error("Error saving prompt:", error)
      toast.error(`Failed to ${editingPrompt ? "update" : "save"} prompt`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return

    setDeleting(promptId)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agents/dynamic-prompts/${promptId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to delete prompt")

      toast.success("Prompt deleted successfully!")
      fetchPrompts()
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast.error("Failed to delete prompt")
    } finally {
      setDeleting(null)
    }
  }

  const resetForm = () => {
    setNewPrompt({
      agentId: "",
      systemPrompt: "",
      userPrompt: "",
    })
    setSelectedAgent("")
    setEditingPrompt(null)
  }

  const handleEditPrompt = (prompt: DynamicPrompt) => {
    setEditingPrompt(prompt)
    setSelectedAgent(prompt.agentId)
    setNewPrompt({ ...prompt })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading dynamic prompts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Prompts</h2>
          <p className="text-gray-600 mt-1">Create and manage AI agent prompt templates</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MessageSquare className="w-4 h-4" />
          <span>{prompts.length} total prompts</span>
        </div>
      </div>

      {/* Create New Prompt */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Plus className="w-5 h-5" />
            Create New Dynamic Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Select Agent
              </label>
              <Select value={selectedAgent} onValueChange={handleAgentChange}>
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent._id} value={agent._id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        {agent.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={resetForm} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Reset Form
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                System Prompt
              </label>
              <Textarea
                value={newPrompt.systemPrompt}
                onChange={(e) => setNewPrompt((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="Enter the system prompt template that defines the AI's behavior and context..."
                className="min-h-[120px] focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">This defines how the AI should behave and respond to user inputs</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                User Prompt
              </label>
              <Textarea
                value={newPrompt.userPrompt}
                onChange={(e) => setNewPrompt((prev) => ({ ...prev, userPrompt: e.target.value }))}
                placeholder="Enter the user prompt template that will be shown to learners..."
                className="min-h-[120px] focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">This is what users will see and interact with</p>
            </div>
          </div>

          <Button
            onClick={handleSavePrompt}
            disabled={saving || !selectedAgent || !newPrompt.systemPrompt || !newPrompt.userPrompt}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Prompt...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Dynamic Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Existing Dynamic Prompts ({prompts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {prompts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No dynamic prompts found</h3>
              <p className="text-gray-600">Create your first dynamic prompt to get started</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {prompts.map((prompt) => {
                const agent = agents.find((a) => a._id === prompt.agentId)
                return (
                  <Card key={prompt._id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {agent?.title?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{agent?.title || "Unknown Agent"}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {agent?.subtitle || "No subtitle"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPrompt(prompt)}
                            className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => prompt._id && handleDeletePrompt(prompt._id)}
                            disabled={deleting === prompt._id}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                          >
                            {deleting === prompt._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Settings className="w-4 h-4" />
                            System Prompt
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border">
                            <p className="text-sm text-gray-800 leading-relaxed">{prompt.systemPrompt}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <User className="w-4 h-4" />
                            User Prompt
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-800 leading-relaxed">{prompt.userPrompt}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicPromptsTab
