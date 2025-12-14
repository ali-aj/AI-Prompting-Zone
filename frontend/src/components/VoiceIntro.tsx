import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VoiceIntro: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const hasAutoPlayedRef = useRef(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            setIsPlaying(false);
            setTimeout(() => setIsVisible(false), 1000);
        };

        const handleLoadStart = () => {
            setIsLoading(true);
            setLoadError(false);
        };

        const handleCanPlayThrough = () => {
            setIsLoading(false);
            setIsReady(true);
            setIsExpanded(true);
            // Auto-play only on first visit in this session
            if (!hasAutoPlayedRef.current && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('voicePlayed')) {
                audio.play().catch(err => console.error('Auto-play failed:', err));
                sessionStorage.setItem('voicePlayed', 'true');
                hasAutoPlayedRef.current = true;
            }
        };

        const handlePlay = () => {
            console.log('Audio play event fired');
            setIsPlaying(true);
        };

        const handlePause = () => {
            console.log('Audio pause event fired');
            setIsPlaying(false);
        };

        const handleError = () => {
            setIsLoading(false);
            setLoadError(true);
            console.error('Error loading audio file');
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);

        setIsLoading(true); // Start loading

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplaythrough', handleCanPlayThrough);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
        };
    }, []); // Empty dependency array is fine since listeners are set once

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (audio.paused || audio.ended) {
                if (audio.ended) audio.currentTime = 0;
                audio.play()
                    .then(() => {
                        setIsPlaying(true);
                        setIsExpanded(true);
                    })
                    .catch(error => {
                        console.error('Play failed:', error);
                        setLoadError(true);
                    });
            } else {
                audio.pause();
                setIsPlaying(false); // Set immediately after pause
                console.log('Pause called'); // Debug
            }
        } catch (error) {
            console.error('Error toggling audio:', error);
            setLoadError(true);
        }
    };

    const handleClose = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            console.log('Close called, audio paused'); // Debug
        }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            <audio
                ref={audioRef}
                preload="auto"
                src="voice/deepgram-aura-2-amalthea-en.wav"
            >
                Your browser does not support the audio element.
            </audio>

            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col items-center">
                {!isExpanded ? (
                    <div
                        className="relative group cursor-pointer"
                        onClick={togglePlay}
                        title="Voice Introduction Loading..."
                    >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-200">
                            {loadError ? (
                                <span className="text-white text-xs">❌</span>
                            ) : isLoading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Play className="w-5 h-5 text-white" />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        {/* Expanded Player */}
                        <div className="flex flex-col items-center">
                            <div className="mt-4 flex items-center gap-3">
                                <Button
                                    onClick={togglePlay}
                                    disabled={loadError || (!isReady && isLoading)}
                                    className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 hover:from-purple-400 hover:via-blue-400 hover:to-indigo-400 text-white font-semibold px-6 py-2 text-sm rounded-full shadow-lg hover:shadow-purple-300/50 transition-all duration-300 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadError ? (
                                        <span className="text-xs">❌ Error</span>
                                    ) : isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Loading...
                                        </>
                                    ) : isPlaying ? (
                                        <>
                                            <Pause className="w-4 h-4 mr-2" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Play
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleClose}
                                    variant="ghost"
                                    className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 rounded-full w-10 h-10 p-0 border border-white/30 hover:border-white/50 transition-all duration-200"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default VoiceIntro;