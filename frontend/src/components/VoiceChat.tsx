import { VoiceSocketProvider } from '@/context/VoiceSocketContext';
import ControlTray from './control-tray/ControlTray';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useVoiceChat } from '@/context/VoiceChatContext';

// VoiceSocketProvider does not require the Gemini API key on the client.

function VoiceChat() {
  const { isVoiceChatOpen, currentAgentTitle, closeVoiceChat } = useVoiceChat();

  return (
    <Dialog open={isVoiceChatOpen} onOpenChange={closeVoiceChat}>
      <DialogContent className="max-w-lg mx-auto bg-gradient-to-b from-gray-900 to-black rounded-3xl shadow-2xl border-0 p-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            Voice Chat {currentAgentTitle ? `with ${currentAgentTitle}` : 'with AI Assistant'}
          </DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {currentAgentTitle ? currentAgentTitle.charAt(0) : 'A'}
              </span>
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">
                {currentAgentTitle || 'AI Assistant'}
              </h3>
              <p className="text-gray-400 text-xs">Voice conversation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={closeVoiceChat}
              className="w-8 h-8 rounded-full hover:bg-gray-700 flex items-center justify-center transition-colors"
              aria-label="Close voice chat"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-8">
          <VoiceSocketProvider>
            {/* Central Visualization */}
            <div className="flex flex-col items-center mb-8">
              {/* Main Audio Visualization Circle */}
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl voice-visualization voice-glow">
                  <div className="w-28 h-28 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  </div>
                </div>
                {/* Multiple animated rings for depth */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 voice-ring"></div>
                <div className="absolute inset-2 rounded-full border border-white/20 voice-ring animation-delay-75"></div>
                <div className="absolute inset-4 rounded-full border border-white/10 voice-ring animation-delay-150"></div>

                {/* Floating particles effect */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-3 -left-3 w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-75"></div>
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-150"></div>
              </div>

              {/* Status Text */}
              <div className="text-center mb-6">
                <p className="text-white text-xl font-medium mb-2">
                  {currentAgentTitle ? `Talking with ${currentAgentTitle}` : 'Ready to chat'}
                </p>

                {/* Mini Waveform Visualization */}
                <div className="flex items-end justify-center gap-1 mb-3 h-6">
                  <div className="waveform-bar w-1 bg-gradient-to-t from-blue-500 to-purple-500"></div>
                  <div className="waveform-bar w-1 bg-gradient-to-t from-purple-500 to-pink-500"></div>
                  <div className="waveform-bar w-1 bg-gradient-to-t from-blue-500 to-purple-500"></div>
                  <div className="waveform-bar w-1 bg-gradient-to-t from-purple-500 to-pink-500"></div>
                  <div className="waveform-bar w-1 bg-gradient-to-t from-blue-500 to-purple-500"></div>
                </div>

                <p className="text-gray-300 text-sm mb-1">
                  Ready for conversation
                </p>
                <p className="text-gray-500 text-xs">
                  Speak naturally • I'll respond in real-time
                </p>
              </div>

              {/* Control Section */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center">
                    <ControlTray />
                  </div>
                  <span className="text-gray-400 text-xs">Voice controls</span>
                </div>
              </div>

              {/* Connection Status Bar */}
              <div className="flex items-center justify-center gap-3 px-4 py-2 bg-gray-800/50 rounded-full backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">Connected</span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-75"></div>
                  <span className="text-blue-400 text-xs font-medium">Real-time</span>
                </div>
              </div>
            </div>
          </VoiceSocketProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VoiceChat;
