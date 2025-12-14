import React, { useState, useEffect } from 'react';
import {
    Zap,
    Smartphone,
    User,
    TrendingUp,
    Play,
    CheckCircle,
    Target,
    Brain
} from 'lucide-react';

interface HighlightItem {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    bgGradient: string;
    textColor: string;
    accentColor: string;
    features: string[];
}

const HighlightSections: React.FC = () => {
    const [activeHighlight, setActiveHighlight] = useState(0);

    const highlights: HighlightItem[] = [
        {
            id: 1,
            title: "Learn AI by Doing",
            subtitle: "Not Watching",
            description: "Skip the boring lectures. Jump straight into hands-on AI experiences that teach you through action and experimentation.",
            icon: <Zap className="w-12 h-12" />,
            bgGradient: "from-yellow-400 via-orange-500 to-red-500",
            textColor: "text-white",
            accentColor: "text-yellow-300",
            features: [
                "Interactive AI conversations",
                "Hands-on project creation",
                "Real-time skill building",
                "Learning through exploration"
            ]
        },
        {
            id: 2,
            title: "Fully Personalized",
            subtitle: "Journeys",
            description: "Your learning path adapts to your style, pace, and goals. Every student gets a unique experience tailored just for them.",
            icon: <User className="w-12 h-12" />,
            bgGradient: "from-green-400 via-teal-500 to-cyan-600",
            textColor: "text-white",
            accentColor: "text-green-300",
            features: [
                "Adaptive learning algorithms",
                "Personalized content delivery",
                "Individual learning pace",
                "Custom skill development paths"
            ]
        },
        {
            id: 3,
            title: "AI That Grows",
            subtitle: "With You",
            description: "Our AI agents remember every interaction, learning your preferences to become smarter, more helpful tutors over time.",
            icon: <TrendingUp className="w-12 h-12" />,
            bgGradient: "from-pink-500 via-purple-500 to-violet-600",
            textColor: "text-white",
            accentColor: "text-pink-300",
            features: [
                "Continuous learning AI",
                "Memory of past interactions",
                "Evolving teaching methods",
                "Increasingly personalized guidance"
            ]
        }
    ];

    // Auto-cycle through highlights
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveHighlight(prev => (prev + 1) % highlights.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [highlights.length]);

    return (
        <section className="py-20 bg-transparent relative overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                        ⚡ Why We're
                        <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            DIFFERENT
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
                        Stop settling for ordinary education. Experience the future of learning with AI that actually cares about your success.
                    </p>
                </div>

                {/* Main Highlight Display */}
                <div className="relative">
                    {/* Large Feature Card */}
                    <div className={`relative bg-gradient-to-br ${highlights[activeHighlight].bgGradient} rounded-3xl p-8 md:p-16 shadow-2xl overflow-hidden transform transition-all duration-1000`}>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                backgroundSize: '30px 30px'
                            }} />
                        </div>

                        {/* Floating accent elements */}
                        <div className="absolute top-8 right-8 opacity-20">
                            <Brain className="w-32 h-32 text-white" />
                        </div>

                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            {/* Left: Main Content */}
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-4 bg-white/20 rounded-2xl backdrop-blur-sm ${highlights[activeHighlight].textColor}`}>
                                        {highlights[activeHighlight].icon}
                                    </div>
                                    <div className="text-6xl font-black text-white/80">
                                        {highlights[activeHighlight].id}
                                    </div>
                                </div>

                                <h3 className={`text-4xl md:text-6xl font-black mb-2 ${highlights[activeHighlight].textColor} leading-tight`}>
                                    {highlights[activeHighlight].title}
                                </h3>
                                <h4 className={`text-2xl md:text-3xl font-bold mb-6 ${highlights[activeHighlight].accentColor}`}>
                                    {highlights[activeHighlight].subtitle}
                                </h4>
                                <p className={`text-lg md:text-xl leading-relaxed mb-8 ${highlights[activeHighlight].textColor} opacity-90`}>
                                    {highlights[activeHighlight].description}
                                </p>

                                {/* Feature Checkmarks */}
                                <div className="space-y-3">
                                    {highlights[activeHighlight].features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle className={`w-6 h-6 ${highlights[activeHighlight].accentColor}`} />
                                            <span className={`text-lg font-medium ${highlights[activeHighlight].textColor}`}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Visual Element */}
                            <div className="relative">
                                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />

                                    {/* Interactive visual based on highlight */}
                                    <div className="relative z-10 text-center">
                                        {activeHighlight === 0 && (
                                            <div className="space-y-4">
                                                <Play className="w-16 h-16 text-white mx-auto animate-pulse" />
                                                <div className="text-white font-bold text-xl">Hands-On Learning</div>
                                                <div className="flex justify-center gap-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: `${i * 0.2}s` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeHighlight === 1 && (
                                            <div className="space-y-4">
                                                <User className="w-16 h-16 text-white mx-auto animate-pulse" />
                                                <div className="text-white font-bold text-xl">Your Unique Path</div>
                                                <div className="flex justify-center">
                                                    <div className="relative w-24 h-24">
                                                        {[...Array(3)].map((_, i) => (
                                                            <div key={i} className={`absolute inset-0 border-4 border-white/30 rounded-full animate-ping`}
                                                                style={{ animationDelay: `${i * 0.5}s` }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeHighlight === 2 && (
                                            <div className="space-y-4">
                                                <TrendingUp className="w-16 h-16 text-white mx-auto animate-bounce" />
                                                <div className="text-white font-bold text-xl">Evolving AI</div>
                                                <div className="flex justify-center gap-1">
                                                    {[...Array(8)].map((_, i) => (
                                                        <div key={i} className="w-2 bg-white/60 rounded-full animate-pulse"
                                                            style={{
                                                                height: `${20 + Math.random() * 30}px`,
                                                                animationDelay: `${i * 0.3}s`
                                                            }} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex justify-center gap-3 mt-8">
                        {highlights.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveHighlight(index)}
                                className={`w-4 h-4 rounded-full transition-all duration-300 ${index === activeHighlight
                                        ? 'bg-white scale-125 shadow-lg'
                                        : 'bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid md:grid-cols-3 gap-6 mt-16 justify-items-center">
                    {highlights.map((highlight, index) => (
                        <div
                            key={highlight.id}
                            className={`text-center p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer w-full max-w-sm flex flex-col items-center justify-center ${index === activeHighlight
                                    ? 'bg-white/10 border-white/30 backdrop-blur-md'
                                    : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
                                }`}
                            onClick={() => setActiveHighlight(index)}
                        >
                            <div className={`flex items-center justify-center mb-4 ${index === activeHighlight ? 'text-white' : 'text-gray-400'}`}>
                                {highlight.icon}
                            </div>
                            <div className={`font-bold text-lg mb-2 ${index === activeHighlight ? 'text-white' : 'text-gray-300'}`}>
                                {highlight.title}
                            </div>
                            <div className={`text-sm ${index === activeHighlight ? 'text-gray-300' : 'text-gray-500'}`}>
                                {highlight.subtitle}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
      `}</style>
        </section>
    );
};

export default HighlightSections; 