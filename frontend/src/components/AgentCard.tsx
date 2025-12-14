import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Mic } from 'lucide-react';
import { useState } from 'react';
import AgentGreetingModal from './AgentGreetingModal';
import PromptingExplanationModal from './PromptingExplanationModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CertificateModal from './CertificateModal';
import { useVoiceChat } from '@/context/VoiceChatContext';
import posthog from 'posthog-js';

interface AgentCardProps {
  icon?: string | null;
  title: string;
  subtitle: string;
  prompt: string;
  toolName: string;
  color: string;
  videoUrl?: string | null;
  onWatchVideoClick: (videoUrl: string | null) => void;
  onStartPrompting?: (prompt?: string) => void;
  onStartChat?: () => void;
  agentId: string;
  isAppUnlocked: boolean;
  appLink?: string;
}

const AgentCard = ({ 
  icon, 
  title, 
  subtitle, 
  prompt, 
  toolName, 
  color, 
  videoUrl, 
  onWatchVideoClick, 
  onStartPrompting,
  agentId,
  isAppUnlocked,
  appLink
}: AgentCardProps) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showPromptingExplanation, setShowPromptingExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotLoggedIn, setShowNotLoggedIn] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<{ name?: string; completionDate?: string } | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const { openVoiceChat } = useVoiceChat();

  const handleAgentClick = async () => {
    posthog.capture('agent_card_click', { agentId, title });
    if (isAppUnlocked) {
      posthog.capture('app_unlocked_click', { agentId, title });
      if (onStartPrompting) {
        onStartPrompting();
      }
      return;
    }
    setLoading(true);
    try {
      setShowGreeting(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPromptingOrOpenApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAppUnlocked) {
      if (appLink) {
        posthog.capture('app_opened', { agentId, title, appLink });
        window.open(appLink, "_blank");
        return;
      }
      if (onStartPrompting) {
        posthog.capture('prompting_started', { agentId, title });
        onStartPrompting();
      }
    } else {
      setLoading(true);
      setShowPromptingExplanation(true);
      setLoading(false);
    }
  };

  const handleGreetingNext = () => {
    posthog.capture('greeting_modal_next', { agentId, title });
    setShowGreeting(false);
    setShowPromptingExplanation(true);
  };

  const handleStartChatting = (selectedPrompt?: string) => {
    posthog.capture('prompting_explanation_start_chatting', { agentId, title, selectedPrompt });
    setShowPromptingExplanation(false);
    if (!user || user.userType !== 'student') {
      setShowNotLoggedIn(true);
      return;
    }
    if (onStartPrompting) {
      onStartPrompting(selectedPrompt);
    }
  };

  const handleCloseModals = () => {
    posthog.capture('modal_closed', { agentId, title });
    setShowGreeting(false);
    setShowPromptingExplanation(false);
  };

  const agentData = {
    _id: agentId,
    title,
    subtitle,
    prompt,
    toolName,
    color,
    icon: icon ? { data: icon.split(',')[1], contentType: icon.split(';')[0].split(':')[1] } : null
  };

  // Check if this agent should have a conversational chat button
  const isConversationalAgent = title === "Spiral the Study Buddy" || title === "Gary Payton the Wizard";

  const handleStartChat = () => {
    if (!user || user.userType !== 'student') {
      setShowNotLoggedIn(true);
      return;
    }
    posthog.capture('conversation_button_click', { agentId, title });
    openVoiceChat(agentId, title);
  };

  return (
    <>
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

      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col relative overflow-hidden" onClick={handleAgentClick}>
        {/* Voice Button - Positioned as floating action button for conversational agents */}
        {isConversationalAgent && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartChat();
              }}
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-colors duration-200 flex items-center justify-center"
              title="Start Voice Conversation"
            >
              <Mic className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
        
        <CardContent className="p-4 sm:p-6 flex flex-col h-full">
          <div className="text-center mb-3 sm:mb-4">
            {icon && icon.startsWith('data:image') ? (
              <img src={icon} alt={`${title} Icon`} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full mx-auto mb-2" />
            ) : (
              <div className="text-3xl sm:text-4xl mb-2">{icon}</div>
            )}
            <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight">{title}</h3>
            <p className={`text-xs sm:text-sm ${color} mt-1`}>{subtitle}</p>
          </div>
          
          <div className="mb-3 sm:mb-4 flex-grow">
            <p className="text-xs text-gray-600 mb-1 sm:mb-2">Sample Prompt:</p>
            <p className="text-xs sm:text-sm text-gray-800 italic bg-gray-50 p-2 sm:p-3 rounded leading-tight">
              "{prompt}"
            </p>
          </div>
          
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700">
              <span className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </span>
              <span className="truncate">{toolName}</span>
            </div>
          </div>
          
          <div className="mt-auto space-y-2">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9" 
                onClick={(e) => {
                  e.stopPropagation();
                  posthog.capture('agent_video_watch', { agentId, title, videoUrl });
                  onWatchVideoClick(videoUrl);
                }}
              >
                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Watch Video</span>
                <span className="xs:hidden">Video</span>
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9"
                disabled={loading}
                onClick={handleStartPromptingOrOpenApp}
              >
                {loading ? 'Loading...' : (isAppUnlocked ? 'Open App' : 'Start Prompting')}
              </Button>
            </div>
            
            {isAppUnlocked && (
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9"
                onClick={async (e) => {
                  e.stopPropagation();
                  setCertificateLoading(true);
                  setShowCertificateModal(true); // Show modal immediately with loading state
                  try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/profile?agentId=${encodeURIComponent(agentId)}`, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                      },
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setCertificateData({ name: data.name, completionDate: data.completionDate });
                    } else {
                      setCertificateData({ });
                    }
                  } catch (err) {
                    setCertificateData({ });
                  } finally {
                    setCertificateLoading(false);
                  }
                }}
              >
                View Certificate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showGreeting && (
        <AgentGreetingModal
          agent={agentData}
          onNext={handleGreetingNext}
          onClose={handleCloseModals}
        />
      )}

      {showPromptingExplanation && (
        <PromptingExplanationModal
          agent={agentData}
          onStartChatting={handleStartChatting}
          onClose={handleCloseModals}
        />
      )}

      <CertificateModal 
        open={showCertificateModal}
        onOpenChange={(open) => {
          setShowCertificateModal(open);
          if (!open) setCertificateData(null);
        }}
        studentName={isAppUnlocked ? certificateData?.name : undefined}
        agentName={isAppUnlocked ? title : undefined}
        completionDate={isAppUnlocked ? certificateData?.completionDate : undefined}
        loading={certificateLoading}
      />
    </>
  );
};

export default AgentCard;