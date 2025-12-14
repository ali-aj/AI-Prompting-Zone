import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Bot
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import AgentDetailsModal from './AgentDetailsModal';

interface CustomAgent {
  _id: string
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

interface CustomAgentsViewProps {
  onAgentSelect: (agent: CustomAgent) => void;
}

const CustomAgentsView = ({ onAgentSelect }: CustomAgentsViewProps) => {
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<CustomAgent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchCustomAgents();
  }, [token]);

  const fetchCustomAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/custom-agents/public`,
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch public custom agents');
      }

      const data = await response.json();
      setCustomAgents(data);
    } catch (error) {
      console.error('Error fetching public custom agents:', error);
      setCustomAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = customAgents.filter(agent =>
    agent.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAgentClick = (agent: CustomAgent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAgent(null);
  };

  const handleStartChat = (agent: CustomAgent) => {
    onAgentSelect(agent);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search public custom agents..."
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
            <Bot className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No agents found' : 'No public custom agents yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Be the first to share your custom agent with the community!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredAgents.map((agent) => (
              <div 
                key={agent._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                onClick={() => handleAgentClick(agent)}
              >
                <div className="flex items-center gap-3">
                  {/* Agent Avatar */}
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    {agent.icon && agent.icon.data ? (
                      <img
                        src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                        alt={agent.title || 'Agent'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <Bot className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  
                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-base">
                      {agent.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {agent.subtitle || agent.description || 'No description available'}
                    </p>
                    {agent.createdBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        By {agent.createdBy.name || agent.createdBy.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Details Modal */}
      <AgentDetailsModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onStartChat={handleStartChat}
      />
    </div>
  );
};

export default CustomAgentsView;
