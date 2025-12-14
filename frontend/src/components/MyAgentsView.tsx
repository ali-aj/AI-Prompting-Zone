import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Bot,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  UserCog
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";

interface CustomAgent {
  _id: string
  name?: string
  title: string
  subtitle: string
  description: string
  prompt: string
  toolName?: string
  videoUrl?: string
  appLink?: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
  __v?: number
  createdBy?: {
    _id: string;
    username: string;
    name: string;
  };
  icon?: {
    data: string;
    contentType: string;
  };
}

interface MyAgentsViewProps {
  onAgentSelect: (agent: CustomAgent) => void;
}

const MyAgentsView = ({ onAgentSelect }: MyAgentsViewProps) => {
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchMyAgents();
  }, [token]);

  const fetchMyAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/my-agents`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch my agents');
      }

      const data = await response.json();
      setCustomAgents(data);
    } catch (error) {
      console.error('Error fetching my agents:', error);
      setCustomAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      // Refresh the list
      fetchMyAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent. Please try again.');
    }
  };

  const filteredAgents = customAgents.filter(agent =>
    agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">My Agents</h2>
          <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-purple-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <Plus className="w-4 h-4 mr-2" />
            Create New Agent
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search my agents..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="flex-1 pt-6 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Skeleton Loading Cards */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <UserCog className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No agents found' : 'No agents created yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first custom agent to get started'
              }
            </p>
            {!searchTerm && (
              <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-purple-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create First Agent
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <div 
                key={agent._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => onAgentSelect(agent)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {agent.icon && agent.icon.data ? (
                      <img
                        src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                        alt={agent.title || 'Agent'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {agent.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Created {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit - you can implement this later
                        console.log('Edit agent:', agent._id);
                      }}
                      title="Edit agent"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      onClick={(e) => handleDeleteAgent(agent._id, e)}
                      title="Delete agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {agent.subtitle || agent.description || 'No description available'}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bot className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Custom AI Agent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgentsView;
