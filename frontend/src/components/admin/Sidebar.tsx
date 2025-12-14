import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LogOut, Brain, Users, FileText, MessageSquare, Menu, X, ChevronRight, BookOpen } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/admin/signin")
  }

  const tabs = [
    { id: "agents", label: "AI Agents", icon: Brain, description: "Manage AI Agents" },
    { id: "learners", label: "Learners", icon: Users, description: "Learner Management" },
    { id: "license-requests", label: "License Requests", icon: FileText, description: "Organization Requests" },
    { id: "dynamic-prompts", label: "Dynamic Prompts", icon: MessageSquare, description: "Content Management" },
    { id: "trainer-manual", label: "Trainer Manual", icon: BookOpen, description: "Training Manual Zone" },
  ]

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">TX</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">TrainingX.AI</h1>
            <p className="text-xs text-gray-500">Super Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={`w-full justify-start h-auto p-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsMobileMenuOpen(false)
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500 hidden lg:block">{tab.description}</div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Footer Actions */}
      {/* Removed Sign Out button as it's now in the Header */}
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg border-gray-200"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 flex-col shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-80 h-full bg-white border-r border-gray-200 flex-col shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}

export default Sidebar
