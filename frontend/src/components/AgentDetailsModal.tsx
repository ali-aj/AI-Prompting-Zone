import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  X,
  Bot
} from 'lucide-react';

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

interface AgentDetailsModalProps {
  agent: CustomAgent | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (agent: CustomAgent) => void;
}

const AgentDetailsModal = ({ agent, isOpen, onClose, onStartChat }: AgentDetailsModalProps) => {
  if (!agent) return null;

  const handleStartChat = () => {
    onStartChat(agent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">

        <div className="pt-6">
          {/* Agent Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              {agent.icon && agent.icon.data ? (
                <img
                  src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                  alt={agent.title || 'Agent'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <Bot className="w-8 h-8 text-purple-600" />
              )}
            </div>
          </div>

          {/* Agent Title */}
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            {agent.title}
          </h2>

          {/* Creator Info */}
          {agent.createdBy && (
            <p className="text-center text-sm text-gray-600 mb-2">
              By {agent.createdBy.name || agent.createdBy.username}
            </p>
          )}

          {/* Subtitle */}
          {agent.subtitle && (
            <p className="text-center text-sm text-gray-600 mb-4">
              {agent.subtitle}
            </p>
          )}

          {/* Description */}
          <p className="text-center text-gray-700 mb-6">
            {agent.description}
          </p>

          {/* Conversation Starters */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Starter Prompt</h3>
            <div className="grid">
                <button 
                  className="text-left p-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleStartChat}
                >
                  {agent.prompt}
                </button>
            </div>
          </div>

          {/* More by creator */}
          {agent.createdBy && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                More by {agent.createdBy.name || agent.createdBy.username}
              </h3>
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    {agent.icon && agent.icon.data ? (
                      <img
                        src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                        alt={agent.title || 'Agent'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{agent.title}</p>
                    <p className="text-xs text-gray-600 truncate">{agent.description}</p>
                    <p className="text-xs text-gray-500">
                      By {agent.createdBy.name || agent.createdBy.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Start Chat Button */}
          <Button 
            onClick={handleStartChat}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-purple-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl py-3 rounded-lg"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDetailsModal;
