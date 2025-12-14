import { memo, useEffect, useState } from "react";
import { useVoiceSocket } from "../../context/VoiceSocketContext";
import { AudioRecorder } from "../../lib/audio-recorder";
import { useVoiceChat } from "../../context/VoiceChatContext";

function ControlTray() {
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [micMuted, setMicMuted] = useState(false);

  const { connected, connect, disconnect, sendAudioChunk } = useVoiceSocket();
  const { isVoiceChatOpen } = useVoiceChat();

  // Auto-connect when component mounts
  useEffect(() => {
    if (!connected && isVoiceChatOpen) {
      connect();
    }
  }, [connected, connect, isVoiceChatOpen]);

  // Disconnect when voice chat is closed
  useEffect(() => {
    if (!isVoiceChatOpen && connected) {
      disconnect();
      audioRecorder.stop();
    }
  }, [isVoiceChatOpen, connected, disconnect, audioRecorder]);

  useEffect(() => {
    const onData = (base64: string) => {
      sendAudioChunk(base64);
    };
    if (connected && !micMuted && audioRecorder && isVoiceChatOpen) {
      audioRecorder.on("data", onData).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off("data", onData);
    };
  }, [connected, sendAudioChunk, micMuted, audioRecorder, isVoiceChatOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRecorder.stop();
      if (connected) {
        disconnect();
      }
    };
  }, [audioRecorder, connected, disconnect]);

  return (
    <section className="control-tray">
      <nav className="actions-nav">
        <button
          className="action-button mic-button"
          onClick={() => setMicMuted(!micMuted)}
          aria-label={micMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {!micMuted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </button>
      </nav>
    </section>
  );
}

export default memo(ControlTray);