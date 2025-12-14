import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import Sidebar from "./Sidebar"
import StudentsTab from "./StudentsTab"
import LicenseRequestsTab from "./LicenseRequestsTab"
import ManageAgentsTab from "./ManageAgentsTab"
import DynamicPromptsTab from "./DynamicPromptsTab"
import TrainerManualZone from './TrainerManualZone'
import Header from "@/components/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, FileText, MessageSquare, Activity, TrendingUp, Sparkles, Loader2, BookOpen } from "lucide-react"

interface DashboardCounts {
  totalAgents: number;
  totalStudents: number;
  pendingRequests: number;
  totalClubs: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("agents")
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoadingCounts(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/dashboard-counts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard counts');
        }

        const data = await response.json();
        setCounts(data);
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
        setCounts(null); // Set to null on error
      } finally {
        setLoadingCounts(false);
      }
    };

    if (token) {
      fetchCounts();
    }
  }, [token]);

  const getTabInfo = (tabId: string) => {
    const tabMap = {
      agents: {
        title: "AI Agents Management",
        description: "Create, edit, and manage your AI learning agents",
        icon: Brain,
        color: "from-blue-500 to-purple-500",
        bgColor: "from-blue-50 to-purple-50",
      },
      learners: {
        title: "Learner Management",
        description: "Monitor and manage learner accounts and progress",
        icon: Users,
        color: "from-green-500 to-emerald-500",
        bgColor: "from-green-50 to-emerald-50",
      },
      "license-requests": {
        title: "License Requests",
        description: "Review and approve organization license applications",
        icon: FileText,
        color: "from-orange-500 to-red-500",
        bgColor: "from-orange-50 to-red-50",
      },
      "dynamic-prompts": {
        title: "Dynamic Prompts",
        description: "Configure AI prompt templates and responses",
        icon: MessageSquare,
        color: "from-purple-500 to-pink-500",
        bgColor: "from-purple-50 to-pink-50",
      },
      "trainer-manual": {
        title: "Trainer Manual Zone",
        description: "Upload, manage, and securely view training manuals",
        icon: BookOpen,
        color: "from-yellow-500 to-orange-400",
        bgColor: "from-yellow-50 to-orange-50",
      },
    }
    return tabMap[tabId as keyof typeof tabMap] || tabMap.agents
  }

  const renderTab = () => {
    switch (activeTab) {
      case "agents":
        return <ManageAgentsTab />
      case "learners":
        return <StudentsTab />
      case "license-requests":
        return <LicenseRequestsTab />
      case "dynamic-prompts":
        return <DynamicPromptsTab />
      case "trainer-manual":
        return <TrainerManualZone />
      default:
        return <ManageAgentsTab />
    }
  }

  const currentTab = getTabInfo(activeTab)
  const TabIcon = currentTab.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-green-200/20 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "4s" }}
      />

      <Header /> {/* Global Header */}

      <div className="flex pt-16 relative z-10">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 flex flex-col overflow-hidden lg:ml-[20rem]"> {/* Adjusted margin here */}
          {/* Enhanced Header (Admin-specific) */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${currentTab.color} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <TabIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{currentTab.title}</h1>
                    <p className="text-gray-600 text-sm">{currentTab.description}</p>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600">System Online</span>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Admin Panel
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Quick Stats Bar */}
              {loadingCounts ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">Loading dashboard data...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="group bg-white/70 backdrop-blur-sm border-blue-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">AI Agents</p>
                          <p className="text-2xl font-bold text-gray-900">{counts?.totalAgents || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group bg-white/70 backdrop-blur-sm border-green-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Total Learners</p>
                          <p className="text-2xl font-bold text-gray-900">{counts?.totalStudents || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group bg-white/70 backdrop-blur-sm border-orange-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
                          <p className="text-2xl font-bold text-gray-900">{counts?.pendingRequests || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group bg-white/70 backdrop-blur-sm border-purple-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Total Clubs</p>
                          <p className="text-2xl font-bold text-gray-900">{counts?.totalClubs || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Main Content Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 overflow-hidden rounded-3xl">
                <div className={`h-2 bg-gradient-to-r ${currentTab.color}`} />
                <div className={`bg-gradient-to-r ${currentTab.bgColor} px-8 py-6 border-b border-gray-100`}>
                  <div className="flex items-center gap-3">
                    <TabIcon className="w-6 h-6 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900">{currentTab.title} Dashboard</h2>
                    <Badge variant="outline" className="ml-auto">
                      Active Section
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-gray-100">
                      {renderTab()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
