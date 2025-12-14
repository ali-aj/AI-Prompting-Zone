import React, { useState, useEffect } from 'react';
import {
    PlayCircle,
    Users,
    Zap,
    Award,
    TrendingUp,
    Target,
    ChevronRight,
    CheckCircle,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ProcessStep {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    completedColor: string;
}

const ProcessBar: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const navigate = useNavigate();

    const steps: ProcessStep[] = [
        {
            id: 1,
            title: "Enter Prompting Zone",
            subtitle: "Your Journey Begins",
            description: "Step into our interactive learning environment where AI meets education",
            icon: <PlayCircle className="w-6 h-6" />,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            completedColor: "bg-blue-600"
        },
        {
            id: 2,
            title: "Meet Agent",
            subtitle: "Your AI Mentor",
            description: "Connect with personalized AI tutors tailored to your learning style",
            icon: <Users className="w-6 h-6" />,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            completedColor: "bg-purple-600"
        },
        {
            id: 3,
            title: "Practice → Unlock App",
            subtitle: "Learn & Create",
            description: "Practice skills and unlock real-world applications like Canva, Padlet, and more",
            icon: <Zap className="w-6 h-6" />,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
            completedColor: "bg-yellow-600"
        },
        {
            id: 4,
            title: "Earn Certificate",
            subtitle: "Validate Skills",
            description: "Get recognized with certificates and badges that showcase your achievements",
            icon: <Award className="w-6 h-6" />,
            color: "text-green-600",
            bgColor: "bg-green-100",
            completedColor: "bg-green-600"
        },
        {
            id: 5,
            title: "Track Progress",
            subtitle: "Monitor Growth",
            description: "Watch your skills develop with detailed analytics and progress tracking",
            icon: <TrendingUp className="w-6 h-6" />,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            completedColor: "bg-orange-600"
        },
        {
            id: 6,
            title: "Match to Career",
            subtitle: "Find Your Path",
            description: "Discover career paths, trades, and business opportunities that match your skills",
            icon: <Target className="w-6 h-6" />,
            color: "text-pink-600",
            bgColor: "bg-pink-100",
            completedColor: "bg-pink-600"
        }
    ];

    // Auto-progress animation
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % steps.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [steps.length]);

    // Smooth progress bar animation
    useEffect(() => {
        const progress = ((activeStep + 1) / steps.length) * 100;
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100);

        return () => clearTimeout(timer);
    }, [activeStep, steps.length]);

    const handleStepClick = (stepIndex: number) => {
        setActiveStep(stepIndex);
    };

    const handleGetStarted = () => {
        navigate('/practice');
    };

    return (
        <section className="py-20 bg-transparent relative overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
                        🚦 Your Learning
                        <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Journey Process
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Follow the clear path from beginner to career-ready. Every step is designed to build your skills,
                        confidence, and future opportunities.
                    </p>
                </div>

                {/* Main Process Bar */}
                <div className="relative bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 md:p-12 shadow-2xl">
                    {/* Overall Progress Bar */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-500">Overall Progress</span>
                            <span className="text-sm font-medium text-gray-900">
                                Step {activeStep + 1} of {steps.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${animatedProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Steps Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-4">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`relative cursor-pointer transition-all duration-500 ${index === activeStep ? 'transform scale-105' : 'hover:scale-102'
                                    }`}
                                onClick={() => handleStepClick(index)}
                            >
                                {/* Step Card */}
                                <div className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-500
                  ${index === activeStep
                                        ? 'bg-white border-gray-300 shadow-xl'
                                        : index < activeStep
                                            ? 'bg-green-50 border-green-200 shadow-md'
                                            : 'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md'
                                    }
                `}>
                                    {/* Step Number */}
                                    <div className={`
                    absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all duration-500
                    ${index < activeStep
                                            ? 'bg-green-500'
                                            : index === activeStep
                                                ? step.completedColor
                                                : 'bg-gray-400'
                                        }
                  `}>
                                        {index < activeStep ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : index === activeStep ? (
                                            <Clock className="w-5 h-5" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>

                                    {/* Icon */}
                                    <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto transition-all duration-500
                    ${index === activeStep
                                            ? step.bgColor + ' ' + step.color
                                            : index < activeStep
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-400'
                                        }
                  `}>
                                        {step.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="text-center">
                                        <h3 className={`
                      font-bold text-sm mb-1 transition-colors duration-500
                      ${index === activeStep
                                                ? 'text-gray-900'
                                                : index < activeStep
                                                    ? 'text-green-800'
                                                    : 'text-gray-500'
                                            }
                    `}>
                                            {step.title}
                                        </h3>
                                        <p className={`
                      text-xs transition-colors duration-500
                      ${index === activeStep
                                                ? 'text-gray-600'
                                                : index < activeStep
                                                    ? 'text-green-600'
                                                    : 'text-gray-400'
                                            }
                    `}>
                                            {step.subtitle}
                                        </p>
                                    </div>

                                    {/* Active Step Glow */}
                                    {index === activeStep && (
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
                                    )}
                                </div>

                                {/* Connection Arrow */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                                        <ChevronRight className={`
                      w-6 h-6 transition-colors duration-500
                      ${index < activeStep
                                                ? 'text-green-500'
                                                : index === activeStep
                                                    ? 'text-blue-500 animate-pulse'
                                                    : 'text-gray-300'
                                            }
                    `} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Active Step Details */}
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-gray-200">
                            <div className={`inline-flex items-center gap-3 mb-4 ${steps[activeStep].color}`}>
                                {steps[activeStep].icon}
                                <h3 className="text-2xl font-bold">{steps[activeStep].title}</h3>
                            </div>
                            <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                                {steps[activeStep].description}
                            </p>

                            {/* Action Button */}
                            {activeStep === 0 && (
                                <Button
                                    onClick={handleGetStarted}
                                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                >
                                    Start Your Journey →
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Manual Controls */}
                    <div className="mt-8 flex justify-center gap-2">
                        {steps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleStepClick(index)}
                                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${index === activeStep
                                        ? 'bg-blue-500 scale-125'
                                        : index < activeStep
                                            ? 'bg-green-400'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }
                `}
                            />
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
                        <div className="text-gray-600">Clear Steps</div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                        <div className="text-gray-600">Learning Paths</div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-pink-600 mb-2">100%</div>
                        <div className="text-gray-600">Career Ready</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProcessBar; 