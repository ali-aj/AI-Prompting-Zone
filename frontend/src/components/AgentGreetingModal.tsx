import type React from "react"
import { ArrowRight, Sparkles, Heart } from "lucide-react"
import { useState, useEffect } from 'react';

interface Agent {
  _id: string
  title: string
  subtitle: string
  prompt: string
  toolName: string
  color: string
  icon?: { data: string; contentType: string } | null
}

interface AgentGreetingModalProps {
  agent: Agent
  onNext: () => void
  onClose: () => void
}

const AgentGreetingModal: React.FC<AgentGreetingModalProps> = ({ agent, onNext, onClose }) => {
  const [fetchedIntroduction, setFetchedIntroduction] = useState('');
  const [loadingIntroduction, setLoadingIntroduction] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchIntroduction = async () => {
      if (!agent._id) return;
      setLoadingIntroduction(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/agents/${agent._id}/introduction`,
          { 
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setFetchedIntroduction(data.introduction);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching agent introduction:', error);
        if (isMounted) {
          setFetchedIntroduction('Could not load introduction.');
        }
      } finally {
        if (isMounted) {
          setLoadingIntroduction(false);
        }
      }
    };

    fetchIntroduction();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [agent._id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full my-8 flex flex-col max-h-[90vh]">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white text-center relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />

          <div className="relative z-10">
            {agent.icon && agent.icon.data ? (
              <img
                src={`data:${agent.icon.contentType};base64,${agent.icon.data}`}
                alt={agent.title}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl border-4 border-white">
                🤖
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2">{agent.title}</h2>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm opacity-90">{agent.subtitle}</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Content - Scrollable area */}
        <div className="p-8 overflow-y-auto flex-grow">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-purple-100">
              {loadingIntroduction ? (
                <p className="text-gray-800 text-lg leading-relaxed">Loading introduction...</p>
              ) : (
                <p className="text-gray-800 text-lg leading-relaxed">{fetchedIntroduction}</p>
              )}
            </div>
          </div>



          {/* Fun elements */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm">
              <Heart className="w-4 h-4" />
              Friendly
            </div>
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              Helpful
            </div>
          </div>
        </div>

        {/* Action buttons - Fixed at bottom */}
        <div className="p-8 pt-0 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgentGreetingModal

