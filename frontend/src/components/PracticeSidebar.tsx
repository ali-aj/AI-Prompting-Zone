import { Button } from '@/components/ui/button';
import { 
  X,
  Bot,
  LogOut,
  LogIn,
  Users,
  UserCog
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

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

interface PracticeSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  agents: Agent[];
  loading: boolean;
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  handleLogout: () => void;
  onCustomAgentsClick: () => void;
  onMyAgentsClick: () => void;
}

const PracticeSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  agents,
  loading,
  selectedAgent,
  onAgentSelect,
  showLogoutConfirm,
  setShowLogoutConfirm,
  handleLogout,
  onCustomAgentsClick,
  onMyAgentsClick
}: PracticeSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-20 w-80 bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-500 ease-in-out overflow-hidden md:translate-x-0 ${isSidebarOpen ? 'md:w-80' : 'md:w-0'}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">AI Agents</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Agent List - Flexible Height */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 overflow-y-auto space-y-3 p-6 pt-4">
              {/* Skeleton Loading Cards */}
              {Array.from({ length: 6 }).map((_, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg animate-pulse"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 p-6 pt-4">
              {agents.map((agent) => (
                <div 
                  key={agent._id} 
                  className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedAgent?._id === agent._id 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onAgentSelect(agent)}
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {agent.icon ? (
                      <img 
                        src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                        alt={agent.title}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <Bot className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 truncate">{agent.title}</div>
                    <div className="text-xs text-gray-500 truncate">{agent.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Agents and My Agents Buttons */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0 space-y-3">
          <Button 
            onClick={onCustomAgentsClick}
            className="w-full bg-transparent border border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <Users className="w-4 h-4 mr-2" />
            Custom Agents
          </Button>
          
          <Button 
            onClick={onMyAgentsClick}
            className="w-full bg-transparent border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <UserCog className="w-4 h-4 mr-2" />
            My Agents
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-purple-600">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {user?.username || 'User'}
              </div>
              <div className="text-xs text-gray-500">
                {user?.email || 'No email provided'}
              </div>
            </div>
            <div className="ml-auto">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                {user?.userType === 'student' ? 'Learner' : 'Free'}
              </span>
            </div>
          </div>
          <Button 
            onClick={user ? handleLogoutClick : () => navigate('/student/signin')}
            className={`w-full text-white text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              user 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-purple-600 hover:to-purple-700'
            }`}
          >
            {user ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden transition-opacity duration-500 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Logout Confirmation</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default PracticeSidebar;
