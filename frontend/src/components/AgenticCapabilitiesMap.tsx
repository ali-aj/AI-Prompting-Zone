import React, { useState, useEffect } from 'react';
import { Brain, Zap, RotateCcw, Target, TrendingUp, Cpu, Network } from 'lucide-react';

interface ProcessingStage {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    description: string;
    color: string;
    position: { x: number; y: number };
}

const AgenticCapabilitiesMap: React.FC = () => {
    const [activeStage, setActiveStage] = useState<string | null>(null);
    const [animationPhase, setAnimationPhase] = useState(0);

    // Define the processing stages
    const stages: ProcessingStage[] = [
        {
            id: 'input',
            title: 'Smart Input',
            subtitle: 'Multi-Modal Reception',
            icon: <Brain className="w-8 h-8" />,
            description: 'Voice, text, and contextual data flow into our neural intake system',
            color: 'from-blue-500 to-cyan-500',
            position: { x: 10, y: 50 }
        },
        {
            id: 'processing',
            title: 'Deep Processing',
            subtitle: 'Parallel Analysis',
            icon: <Cpu className="w-8 h-8" />,
            description: 'Multiple AI models process simultaneously across different reasoning paths',
            color: 'from-purple-500 to-pink-500',
            position: { x: 30, y: 30 }
        },
        {
            id: 'adaptation',
            title: 'Dynamic Adaptation',
            subtitle: 'Learning & Evolution',
            icon: <Network className="w-8 h-8" />,
            description: 'Real-time personality and approach adjustments based on your learning style',
            color: 'from-green-500 to-emerald-500',
            position: { x: 50, y: 50 }
        },
        {
            id: 'action',
            title: 'Intelligent Action',
            subtitle: 'Contextual Response',
            icon: <Target className="w-8 h-8" />,
            description: 'Personalized educational content delivered with perfect timing',
            color: 'from-orange-500 to-red-500',
            position: { x: 70, y: 30 }
        },
        {
            id: 'feedback',
            title: 'Continuous Feedback',
            subtitle: 'Growth Loop',
            icon: <RotateCcw className="w-8 h-8" />,
            description: 'Every interaction feeds back to improve future responses',
            color: 'from-indigo-500 to-purple-500',
            position: { x: 90, y: 50 }
        }
    ];

    // Animation cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationPhase(prev => (prev + 1) % 100);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Particle flow animation
    const ParticleFlow = ({ from, to, delay = 0 }: { from: { x: number; y: number }, to: { x: number; y: number }, delay?: number }) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const progress = ((animationPhase + delay) % 100) / 100;

        return (
            <div
                className="absolute w-2 h-2 bg-white rounded-full opacity-80 shadow-lg"
                style={{
                    left: `${from.x + dx * progress}%`,
                    top: `${from.y + dy * progress}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.1s linear'
                }}
            />
        );
    };

    // Neural connection lines
    const ConnectionLine = ({ from, to, active = false }: { from: { x: number; y: number }, to: { x: number; y: number }, active?: boolean }) => {
        const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
        const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;

        return (
            <div
                className={`absolute h-0.5 bg-gradient-to-r ${active ? 'from-cyan-400 to-purple-400' : 'from-gray-400 to-gray-600'} opacity-60`}
                style={{
                    left: `${from.x}%`,
                    top: `${from.y}%`,
                    width: `${length * 0.8}%`,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '0 50%',
                    filter: active ? 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.5))' : 'none'
                }}
            />
        );
    };

    // Parallel processing streams
    const ParallelStream = ({ streamId, delay }: { streamId: number, delay: number }) => {
        const yOffset = 20 + streamId * 15;
        return (
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
                        style={{
                            left: `${10 + ((animationPhase + delay + i * 20) % 100) * 0.8}%`,
                            top: `${yOffset}%`,
                            animationDelay: `${i * 200}ms`,
                            filter: 'drop-shadow(0 0 2px rgba(0, 255, 255, 0.8))'
                        }}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className="py-20 bg-transparent relative overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                        🧠 Agentic AI
                        <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Capabilities Map
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Peek behind the curtain. See how our AI agents think, learn, and evolve in real-time to create your perfect learning experience.
                    </p>
                </div>

                {/* Main visualization area */}
                <div className="relative bg-black/20 backdrop-blur-md border border-gray-800 rounded-3xl p-4 md:p-8 lg:p-12 min-h-[400px] md:min-h-[600px] overflow-hidden">
                    {/* Reactive Parallelism indicator */}
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 flex items-center gap-1 md:gap-2 text-cyan-400 text-xs md:text-sm font-mono">
                        <Zap className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                        <span className="hidden sm:inline">Reactive Parallelism Active</span>
                        <span className="sm:hidden">Active</span>
                    </div>

                    {/* Continuous AI indicator */}
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 flex items-center gap-1 md:gap-2 text-purple-400 text-xs md:text-sm font-mono">
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
                        <span className="hidden sm:inline">Continuous AI Learning</span>
                        <span className="sm:hidden">Learning</span>
                    </div>

                    {/* Parallel processing streams */}
                    {[...Array(3)].map((_, i) => (
                        <ParallelStream key={i} streamId={i} delay={i * 30} />
                    ))}

                    {/* Connection lines between stages */}
                    {stages.slice(0, -1).map((stage, index) => (
                        <ConnectionLine
                            key={`connection-${index}`}
                            from={stage.position}
                            to={stages[index + 1].position}
                            active={activeStage === stage.id || activeStage === stages[index + 1].id}
                        />
                    ))}

                    {/* Feedback loop connection */}
                    <ConnectionLine
                        from={stages[4].position}
                        to={stages[0].position}
                        active={activeStage === 'feedback' || activeStage === 'input'}
                    />

                    {/* Particle flows */}
                    {stages.slice(0, -1).map((stage, index) => (
                        <ParticleFlow
                            key={`particle-${index}`}
                            from={stage.position}
                            to={stages[index + 1].position}
                            delay={index * 20}
                        />
                    ))}

                    {/* Feedback particle flow */}
                    <ParticleFlow
                        from={stages[4].position}
                        to={stages[0].position}
                        delay={80}
                    />

                    {/* Processing stages */}
                    {stages.map((stage) => (
                        <div
                            key={stage.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${activeStage === stage.id ? 'scale-110 z-20' : 'z-10 hover:scale-105'
                                }`}
                            style={{ left: `${stage.position.x}%`, top: `${stage.position.y}%` }}
                            onMouseEnter={() => setActiveStage(stage.id)}
                            onMouseLeave={() => setActiveStage(null)}
                        >
                            {/* Stage circle */}
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-2xl border-2 md:border-4 border-white/20 ${activeStage === stage.id ? 'animate-pulse shadow-cyan-400/50' : ''
                                }`}>
                                <div className="text-white scale-75 sm:scale-90 md:scale-100">
                                    {stage.icon}
                                </div>
                            </div>

                            {/* Stage label */}
                            <div className="absolute top-full mt-2 md:mt-4 left-1/2 transform -translate-x-1/2 text-center">
                                <h3 className="text-white font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                                    {stage.title}
                                </h3>
                                <p className="text-gray-400 text-xs whitespace-nowrap hidden sm:block">
                                    {stage.subtitle}
                                </p>
                            </div>

                            {/* Hover tooltip */}
                            {activeStage === stage.id && (
                                <div className="absolute bottom-full mb-2 md:mb-4 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md border border-gray-700 rounded-lg p-3 md:p-4 w-48 md:w-64 shadow-2xl z-30">
                                    <div className="text-white text-xs md:text-sm leading-relaxed">
                                        {stage.description}
                                    </div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 md:border-l-8 md:border-r-8 md:border-t-8 border-transparent border-t-gray-700" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Central neural network visualization */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 pointer-events-none">
                        <div className="relative w-full h-full">
                            {/* Pulsing core */}
                            <div className="absolute inset-0 bg-gradient-radial from-cyan-400/20 to-transparent rounded-full animate-ping" />
                            <div className="absolute inset-2 sm:inset-4 bg-gradient-radial from-purple-400/30 to-transparent rounded-full animate-pulse" />
                            <div className="absolute inset-4 sm:inset-8 bg-gradient-radial from-pink-400/40 to-transparent rounded-full animate-bounce" />

                            {/* Neural connections */}
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-px h-8 sm:h-12 md:h-16 bg-gradient-to-t from-transparent via-cyan-400/50 to-transparent"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                                        animation: `pulse ${2 + i * 0.2}s infinite`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Key features grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
                    <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4 md:p-6">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <Zap className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                            <h3 className="text-white font-bold text-sm md:text-base">Reactive Parallelism</h3>
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm">
                            Multiple AI processes run simultaneously, each handling different aspects of your learning journey in real-time.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 md:p-6">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <Brain className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                            <h3 className="text-white font-bold text-sm md:text-base">Genetic AI Logic</h3>
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm">
                            Our AI evolves its teaching approach by learning from successful interactions and adapting to your unique style.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-md border border-green-500/30 rounded-2xl p-4 md:p-6">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                            <h3 className="text-white font-bold text-sm md:text-base">Continuous Learning</h3>
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm">
                            Every interaction becomes learning data, making your AI tutors smarter and more personalized over time.
                        </p>
                    </div>
                </div>
            </div>

            {/* CSS for gradient radial */}
            <style>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
        </section>
    );
};

export default AgenticCapabilitiesMap; 