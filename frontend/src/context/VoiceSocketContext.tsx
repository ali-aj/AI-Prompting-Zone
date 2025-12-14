import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext, base64ToArrayBuffer } from "../lib/voiceModeutlis";
import VolMeterWorket from "../lib/worklets/vol-meter";
import { useAuth } from "./AuthContext";
import { useVoiceChat } from "./VoiceChatContext";
import agentChatService from "../services/agentChatService";

interface VoiceSocketContextValue {
    connected: boolean;
    connect: () => void;
    disconnect: () => void;
    sendAudioChunk: (base64: string) => void;
    volume: number;
}

const VoiceSocketContext = createContext<VoiceSocketContextValue | undefined>(
    undefined,
);

export const VoiceSocketProvider: React.FC<React.PropsWithChildren<{}>> = ({
    children,
}) => {
    const { user } = useAuth();
    const { currentAgentTitle, currentAgentId } = useVoiceChat();

    const wsRef = useRef<WebSocket | null>(null);
    const audioStreamerRef = useRef<AudioStreamer | null>(null);

    const [connected, setConnected] = useState(false);
    const [volume, setVolume] = useState(0);

    // Buffers to merge partial transcriptions so we only log full sentences
    const userBufferRef = useRef("");
    const assistantBufferRef = useRef("");
    const userTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const assistantTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /** Flush and log the buffer for a role, then clear it */
    const flushBuffer = useCallback(async (role: "user" | "assistant") => {
        const bufRef = role === "user" ? userBufferRef : assistantBufferRef;
        const timeoutRef = role === "user" ? userTimeoutRef : assistantTimeoutRef;
        
        // Clear any pending timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        const txt = bufRef.current.trim();
        if (txt) {
            console.log(`[VoiceChat] ${role === "user" ? "User" : "Assistant"}:`, txt);
            
            // Save to database if we have an agent ID and user is logged in
            if (currentAgentId && user?._id) {
                try {
                    await agentChatService.saveVoiceMessage(currentAgentId, role, txt);
                } catch (error) {
                    console.warn('Failed to save voice message to database:', error);
                }
            }
            
            bufRef.current = "";
        }
    }, [currentAgentId, user]);

    /** Schedule a delayed flush for incomplete sentences */
    const scheduleFlush = useCallback((role: "user" | "assistant") => {
        const timeoutRef = role === "user" ? userTimeoutRef : assistantTimeoutRef;
        
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Schedule flush in 3 seconds if no punctuation received
        timeoutRef.current = setTimeout(() => {
            flushBuffer(role);
        }, 3000);
    }, [flushBuffer]);

    // lazily create AudioStreamer once
    useEffect(() => {
        if (!audioStreamerRef.current) {
            audioContext({ id: "audio-out" }).then((ctx) => {
                const streamer = new AudioStreamer(ctx);
                streamer
                    .addWorklet<any>("vumeter-out", VolMeterWorket, (ev: any) => {
                        setVolume(ev.data.volume);
                    })
                    .then(() => {
                        audioStreamerRef.current = streamer;
                    });
            });
        }
    }, []);

    const disconnect = useCallback(() => {
        // Clear any pending timeouts
        if (userTimeoutRef.current) {
            clearTimeout(userTimeoutRef.current);
            userTimeoutRef.current = null;
        }
        if (assistantTimeoutRef.current) {
            clearTimeout(assistantTimeoutRef.current);
            assistantTimeoutRef.current = null;
        }
        
        // Flush any remaining buffers before disconnecting
        if (userBufferRef.current.trim()) {
            flushBuffer("user");
        }
        if (assistantBufferRef.current.trim()) {
            flushBuffer("assistant");
        }
        
        if (wsRef.current) {
            try {
                wsRef.current.send(JSON.stringify({ type: "disconnect" }));
            } catch (_) { }
            wsRef.current.close();
            wsRef.current = null;
        }
        setConnected(false);
    }, [flushBuffer]);

    const connect = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            return;
        }

        // Get WebSocket URL from environment or construct it
        let WS_URL = import.meta.env.VITE_VOICE_WS_URL;
        
        if (!WS_URL) {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            if (backendUrl) {
                // Convert HTTP(S) backend URL to WebSocket URL
                const wsUrl = backendUrl.replace(/^https?:\/\//, '');
                const protocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
                WS_URL = `${protocol}://${wsUrl}/voice-chat`;
            } else {
                // Fallback logic for different environments
                const protocol = window.location.protocol === "https:" ? "wss" : "ws";
                const host = window.location.hostname;
                
                // For production deployment on Vercel, don't use port
                if (host.includes('vercel.app') || host.includes('netlify.app')) {
                    // This shouldn't happen in production, but fallback to current host
                    WS_URL = `${protocol}://${host}/voice-chat`;
                } else {
                    // For local development
                    const port = 5000; // fallback dev backend port
                    WS_URL = `${protocol}://${host}:${port}/voice-chat`;
                }
            }
        }

        console.log('Connecting to WebSocket:', WS_URL);

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "init_session",
                    userId: user?._id || "guest",
                    agentTitle: currentAgentTitle || "AI Assistant",
                }),
            );
            setConnected(true);
        };

        ws.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data);
                if (msg.type === "audio" && msg.data) {
                    const buffer = base64ToArrayBuffer(msg.data);
                    audioStreamerRef.current?.addPCM16(new Uint8Array(buffer));
                } else if (msg.type === "interrupted") {
                    // stop playback immediately
                    audioStreamerRef.current?.stop();
                } else if (msg.type === "user_text") {
                    userBufferRef.current += msg.text;
                    // Heuristic: flush when sentence-ending punctuation arrives
                    if (/[.!?]$/.test(msg.text.trim())) {
                        flushBuffer("user");
                    } else {
                        // Schedule a delayed flush for incomplete sentences
                        scheduleFlush("user");
                    }
                } else if (msg.type === "assistant_text") {
                    assistantBufferRef.current += msg.text;
                    if (/[.!?]$/.test(msg.text.trim())) {
                        flushBuffer("assistant");
                    } else {
                        // Schedule a delayed flush for incomplete sentences
                        scheduleFlush("assistant");
                    }
                } else if (msg.type === "error") {
                    console.error("Voice chat error:", msg.message);
                }
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        };

        ws.onerror = (e) => {
            console.error("Voice WS error", e);
        };

        ws.onclose = () => {
            setConnected(false);
        };
    }, [currentAgentTitle, currentAgentId, user]);

    const sendAudioChunk = useCallback((base64: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({ type: "audio_chunk", audioData: base64 }),
            );
        }
    }, []);

    return (
        <VoiceSocketContext.Provider
            value={{ connected, connect, disconnect, sendAudioChunk, volume }}
        >
            {children}
        </VoiceSocketContext.Provider>
    );
};

export const useVoiceSocket = () => {
    const ctx = useContext(VoiceSocketContext);
    if (!ctx) {
        throw new Error("useVoiceSocket must be used within VoiceSocketProvider");
    }
    return ctx;
}; 