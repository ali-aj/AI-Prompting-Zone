import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Wand2, 
  Edit, 
  Trash2, 
  Eye,
  User, 
  Brain, 
  Sparkles,
  Play,
  Loader
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AgentBuilder from './AgentBuilder';

interface CustomAgent {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  prompt?: string;
  toolName?: string;
  isPublic: boolean;
  createdBy?: {
    name: string;
    username: string;
  };
  icon?: {
    data: string;
    contentType: string;
  };
  createdAt: string;
}

interface CustomAgentsProps {
  onStartChat?: (agentId: string) => void;
}

const CustomAgents: React.FC<CustomAgentsProps> = ({ onStartChat }) => {
  const [myAgents, setMyAgents] = useState<CustomAgent[]>([]);
  const [publicAgents, setPublicAgents] = useState<CustomAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const [loadingEditAgent, setLoadingEditAgent] = useState<string | null>(null);
  const [showNotLoggedIn, setShowNotLoggedIn] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      
      // Fetch user's custom agents
      const myResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/my-agents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (myResponse.ok) {
        const myData = await myResponse.json();
        setMyAgents(myData);
      }

      // Fetch public agents
      const publicResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/public`);
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        setPublicAgents(publicData);
      }
    } catch (error) {
      console.error('Error fetching custom agents:', error);
      toast.error('Failed to load custom agents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      toast.success('Agent deleted successfully!');
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleEditAgent = async (agent: CustomAgent) => {
    try {
      setLoadingEditAgent(agent._id);
      
      // Fetch complete agent data including prompt
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/${agent._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }

      const fullAgentData = await response.json();
      setEditingAgent(fullAgentData);
      setShowBuilder(true);
    } catch (error) {
      console.error('Error fetching agent details:', error);
      toast.error('Failed to load agent details for editing');
    } finally {
      setLoadingEditAgent(null);
    }
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingAgent(null);
    setLoadingEditAgent(null);
  };

  const handleCreateAgent = () => {
    if (!user || user.userType !== 'student') {
      setShowNotLoggedIn(true);
      return;
    }
    setShowBuilder(true);
  };

  const handleStartChat = (agentId: string) => {
    if (!user || user.userType !== 'student') {
      setShowNotLoggedIn(true);
      return;
    }
    if (onStartChat) {
      onStartChat(agentId);
    }
  };

  const renderAgentCard = (agent: CustomAgent, showActions: boolean = true) => (
    <Card
      key={agent._id}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden"
    >
      {/* Custom Agent Indicator */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
      
      <CardContent className="p-6">
        {/* Header section with icon and name */}
        <div className="relative mb-4">
          {/* Custom Agent Badge */}
          <div className="absolute -top-2 -right-2 z-10">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
              <Wand2 className="w-3 h-3 mr-1" />
              Custom
            </Badge>
          </div>

          {/* Agent icon */}
          <div className="mb-4">
            {agent.icon && agent.icon.data ? (
              <div className="relative">
                <img
                  src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                  alt={agent.title}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Agent name and description */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {agent.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {agent.subtitle}
          </p>

          {/* Creator info for public agents */}
          {agent.createdBy && activeTab === 'community' && (
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <User className="w-3 h-3" />
              By {agent.createdBy.name}
            </div>
          )}

          {/* Tool name */}
          {agent.toolName && (
            <div className="mb-4">
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                🛠️ {agent.toolName}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {onStartChat && (
            <Button
              onClick={() => handleStartChat(agent._id)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Chatting
            </Button>
          )}
          
          {showActions && activeTab === 'my' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditAgent(agent)}
                disabled={loadingEditAgent === agent._id}
                className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 disabled:opacity-60 disabled:hover:bg-gray-50"
              >
                {loadingEditAgent === agent._id ? (
                  <>
                    <Loader className="w-3 h-3 mr-1 animate-spin" />
                    <span className="text-xs">Loading...</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteAgent(agent._id)}
                disabled={loadingEditAgent === agent._id}
                className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-60 disabled:hover:bg-gray-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
          
          {activeTab === 'community' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading custom agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header with Create Button */}
      <div className="text-center">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-xl">
            <Wand2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Custom Agents
          </h2>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          Create Your Own AI Agent in 5 Minutes
        </p>
        <Button
          onClick={handleCreateAgent}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <Button
          variant="ghost"
          onClick={() => setActiveTab('my')}
          className={`flex-1 transition-all duration-200 ${
            activeTab === 'my' 
              ? 'bg-white shadow-sm text-gray-900 font-medium hover:bg-white' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          My Agents ({myAgents.length})
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('community')}
          className={`flex-1 transition-all duration-200 ${
            activeTab === 'community' 
              ? 'bg-white shadow-sm text-gray-900 font-medium hover:bg-white' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Community Gallery ({publicAgents.length})
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'my' ? (
        <div>
          {myAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myAgents.map((agent) => renderAgentCard(agent, true))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Custom Agents Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first custom AI agent to get started!
                </p>
                <Button
                  onClick={handleCreateAgent}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Create Your First Agent
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div>
          {publicAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {publicAgents.map((agent) => renderAgentCard(agent, false))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Public Agents Yet
                </h3>
                <p className="text-gray-600">
                  Be the first to share your custom agent with the community!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Agent Builder Modal */}
      <AgentBuilder
        isOpen={showBuilder}
        onClose={handleCloseBuilder}
        onAgentCreated={fetchAgents}
        agentData={editingAgent}
      />

      {/* Not Logged In Modal */}
      <Dialog open={showNotLoggedIn} onOpenChange={setShowNotLoggedIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You are not logged in</DialogTitle>
            <DialogDescription>
              Please log in to start chatting with agents and unlock all features.
            </DialogDescription>
          </DialogHeader>
          <Button className="w-full mt-4" onClick={() => navigate('/student/signin')}>
            Go to Login
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomAgents;
