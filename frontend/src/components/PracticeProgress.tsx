import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import {
  Trophy,
  Star,
  Target,
  Zap,
  Brain,
  Rocket,
  Crown,
  Award,
  Medal,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
  Flame,
  FileText,
  Coins,
  Battery,
  Gift,
  Wand2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { progressService, type StudentProgress } from "@/services/progressService"
import posthog from 'posthog-js';
import CertificateModal from "@/components/CertificateModal"
import { useAuth } from "@/context/AuthContext"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  requirement: number
  type: "prompts" | "apps" | "customAgents"
  color: string
  bgColor: string
  milestone?: number
}

interface MilestoneData {
  percentage: number
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const milestones: MilestoneData[] = [
  {
    percentage: 25,
    title: "Getting Started!",
    description: "You're on your way! Keep up the great work!",
    icon: <Rocket className="w-8 h-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    percentage: 50,
    title: "Halfway Hero!",
    description: "Amazing progress! You're halfway there!",
    icon: <Medal className="w-8 h-8" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    percentage: 75,
    title: "Almost There!",
    description: "So close! You're doing fantastic!",
    icon: <Star className="w-8 h-8" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    percentage: 100,
    title: "Champion!",
    description: "Incredible! You've mastered everything!",
    icon: <Crown className="w-8 h-8" />,
    color: "text-gold-600",
    bgColor: "bg-gradient-to-r from-yellow-400 to-orange-400",
  },
]

const badges: BadgeData[] = [
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your first prompt",
    icon: <Target className="w-6 h-6" />,
    requirement: 1,
    type: "prompts",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    milestone: 25,
  },
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Complete 3 prompts",
    icon: <Zap className="w-6 h-6" />,
    requirement: 3,
    type: "prompts",
    color: "text-green-600",
    bgColor: "bg-green-100",
    milestone: 25,
  },
  {
    id: "on-fire",
    name: "On Fire",
    description: "Complete 5 prompts",
    icon: <Flame className="w-6 h-6" />,
    requirement: 5,
    type: "prompts",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    milestone: 50,
  },
  {
    id: "halfway-hero",
    name: "Halfway Hero",
    description: "Complete 6 prompts",
    icon: <Medal className="w-6 h-6" />,
    requirement: 6,
    type: "prompts",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    milestone: 50,
  },
  {
    id: "almost-there",
    name: "Almost There",
    description: "Complete 9 prompts",
    icon: <Star className="w-6 h-6" />,
    requirement: 9,
    type: "prompts",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    milestone: 75,
  },
  {
    id: "prompt-master",
    name: "Prompt Master",
    description: "Complete all 12 prompts",
    icon: <Crown className="w-6 h-6" />,
    requirement: 12,
    type: "prompts",
    color: "text-gold-600",
    bgColor: "bg-gradient-to-r from-yellow-400 to-orange-400",
    milestone: 100,
  },
  {
    id: "app-explorer",
    name: "App Explorer",
    description: "Unlock your first app",
    icon: <Rocket className="w-6 h-6" />,
    requirement: 1,
    type: "apps",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    milestone: 25,
  },
  {
    id: "tool-collector",
    name: "Tool Collector",
    description: "Unlock 3 apps",
    icon: <Brain className="w-6 h-6" />,
    requirement: 3,
    type: "apps",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    milestone: 25,
  },
  {
    id: "app-enthusiast",
    name: "App Enthusiast",
    description: "Unlock 6 apps",
    icon: <Sparkles className="w-6 h-6" />,
    requirement: 6,
    type: "apps",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    milestone: 50,
  },
  {
    id: "power-user",
    name: "Power User",
    description: "Unlock 9 apps",
    icon: <Award className="w-6 h-6" />,
    requirement: 9,
    type: "apps",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    milestone: 75,
  },
  {
    id: "app-master",
    name: "App Master",
    description: "Unlock all 12 apps",
    icon: <Trophy className="w-6 h-6" />,
    requirement: 12,
    type: "apps",
    color: "text-red-600",
    bgColor: "bg-gradient-to-r from-red-400 to-pink-400",
    milestone: 100,
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "Complete everything!",
    icon: <Shield className="w-6 h-6" />,
    requirement: 12,
    type: "prompts",
    color: "text-violet-600",
    bgColor: "bg-gradient-to-r from-violet-400 to-purple-400",
    milestone: 100,
  },
  {
    id: "agent-builder",
    name: "Agent Builder",
    description: "Create your first custom agent",
    icon: <Wand2 className="w-6 h-6" />,
    requirement: 1,
    type: "customAgents",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    milestone: 25,
  },
  {
    id: "creative-genius",
    name: "Creative Genius",
    description: "Create 3 custom agents",
    icon: <Sparkles className="w-6 h-6" />,
    requirement: 3,
    type: "customAgents",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    milestone: 50,
  },
  {
    id: "agent-master",
    name: "Agent Master",
    description: "Create 5 custom agents",
    icon: <Crown className="w-6 h-6" />,
    requirement: 5,
    type: "customAgents",
    color: "text-gold-600",
    bgColor: "bg-gradient-to-r from-yellow-400 to-orange-400",
    milestone: 75,
  },
]



// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-10">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

// Energy Bar Component
const EnergyBar = ({ current, max, label }: { current: number; max: number; label: string }) => {
  const percentage = Math.min((current / max) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Battery className="w-4 h-4" />
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {current}/{max}
        </span>
      </div>
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
      </div>
      <div className="text-xs text-gray-500 text-center">{Math.round(percentage)}% Complete</div>
    </div>
  )
}

// Coin Counter Component
const CoinCounter = ({ count }: { count: number }) => {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full shadow-lg">
      <Coins className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
      <span className="font-bold text-lg">{count}</span>
      <span className="text-sm">coins</span>
    </div>
  )
}

const PracticeProgress = () => {
  const { user } = useAuth()
  const [progress, setProgress] = useState<StudentProgress>({
    prompts: 0,
    appsUnlocked: [],
  })
  const [loading, setLoading] = useState(true)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await progressService.getProgress()
        setProgress(data)
        // Track prompt completions
        posthog.capture('practice_progress_loaded', { prompts: data.prompts, appsUnlocked: data.appsUnlocked.length });
        if (data.prompts > 0) {
          posthog.capture('prompt_completed', { prompts: data.prompts });
        }
        if (data.appsUnlocked.length > 0) {
          posthog.capture('app_unlocked', { appsUnlocked: data.appsUnlocked.length });
        }
      } catch (error) {
        console.error("Error fetching progress:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  const appsUnlocked = progress?.appsUnlocked || []
  const prompts = progress?.prompts || 0
  const customAgentsCreated = progress?.customAgentsCreated || 0

  const earnedBadges = badges.filter((badge) => {
    if (badge.type === "prompts") {
      return prompts >= badge.requirement
    } else if (badge.type === "apps") {
      return appsUnlocked.length >= badge.requirement
    } else if (badge.type === "customAgents") {
      return customAgentsCreated >= badge.requirement
    }
    return false
  })

  // Track badge achievements
  useEffect(() => {
    earnedBadges.forEach((badge) => {
      posthog.capture('badge_earned', { badgeId: badge.id, badgeName: badge.name, type: badge.type });
    });
  }, [earnedBadges.length]);

  const getBadgeStatus = (badge: BadgeData) => {
    if (badge.type === "prompts") {
      return prompts >= badge.requirement
    } else if (badge.type === "apps") {
      return appsUnlocked.length >= badge.requirement
    } else if (badge.type === "customAgents") {
      return customAgentsCreated >= badge.requirement
    }
    return false
  }

  const getMilestoneForProgress = (percentage: number) => {
    return milestones.find((m) => percentage >= m.percentage) || milestones[0]
  }

  const promptPercentage = (prompts / 12) * 100
  const appPercentage = (appsUnlocked.length / 12) * 100
  const overallPercentage = (promptPercentage + appPercentage) / 2

  const currentMilestone = getMilestoneForProgress(overallPercentage)
  const totalCoins = earnedBadges.length * 10 + prompts * 5 + appsUnlocked.length * 8

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xl font-semibold text-gray-700">Loading your progress...</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-400 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Floating Stars */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-yellow-400 animate-pulse opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            fontSize: `${10 + Math.random() * 6}px`,
          }}
        >
          ⭐
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header with Coin Counter */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-xl">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Learning Adventure
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Track your amazing progress and unlock awesome rewards as you learn!
          </p>
          <CoinCounter count={totalCoins} />
        </div>

        {/* Current Milestone Display */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center">
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-20 h-20 rounded-full mb-4",
                    currentMilestone.bgColor,
                  )}
                >
                  <div className={currentMilestone.color}>{currentMilestone.icon}</div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{currentMilestone.title}</h3>
                <p className="text-lg text-gray-600 mb-6">{currentMilestone.description}</p>

                {/* Overall Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-gray-900">{Math.round(overallPercentage)}%</span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-2000 ease-out relative"
                      style={{ width: `${overallPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Prompts Progress */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-2 border-indigo-200/50 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center mb-8">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mr-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-indigo-900 mb-1">Prompt Mastery</h3>
                  <p className="text-indigo-600 text-sm">Complete challenges to level up!</p>
                </div>
              </div>

              {/* Custom Progress Bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                    <Battery className="w-4 h-4" />
                    Energy Level
                  </span>
                  <span className="text-lg font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full">
                    {prompts}/12
                  </span>
                </div>
                <div className="relative h-6 bg-indigo-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${promptPercentage}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {Math.round(promptPercentage)}% Complete
                  </span>
                </div>
              </div>

              {/* Milestone indicators */}
              <div className="flex justify-between mt-6 px-2">
                {[25, 50, 75, 100].map((milestone) => (
                  <Tooltip key={milestone} content={`${milestone}% milestone`}>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 transition-all duration-300",
                          promptPercentage >= milestone 
                            ? "bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-500 shadow-lg" 
                            : "bg-indigo-100 border-indigo-300",
                        )}
                      />
                      <span className="text-xs text-indigo-600 font-medium">{milestone}%</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Apps Progress */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200/50 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center mb-8">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mr-4">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-1">App Collection</h3>
                  <p className="text-emerald-600 text-sm">Unlock amazing tools and features!</p>
                </div>
              </div>

              {/* Custom Progress Bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                    <Battery className="w-4 h-4" />
                    Power Level
                  </span>
                  <span className="text-lg font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
                    {appsUnlocked.length}/12
                  </span>
                </div>
                <div className="relative h-6 bg-emerald-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${appPercentage}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {Math.round(appPercentage)}% Complete
                  </span>
                </div>
              </div>

              {/* Milestone indicators */}
              <div className="flex justify-between mt-6 px-2">
                {[25, 50, 75, 100].map((milestone) => (
                  <Tooltip key={milestone} content={`${milestone}% milestone`}>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 transition-all duration-300",
                          appPercentage >= milestone 
                            ? "bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-500 shadow-lg" 
                            : "bg-emerald-100 border-emerald-300",
                        )}
                      />
                      <span className="text-xs text-emerald-600 font-medium">{milestone}%</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-orange-200 rounded-3xl overflow-hidden mb-12">
          <div className="h-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-orange-200">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-2xl sm:text-3xl text-orange-800">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                <span>Earn Your Achievements</span>
              </div>
              <Badge variant="outline" className="text-base sm:text-lg px-3 py-1 sm:px-4 sm:py-2 border-orange-300 text-orange-700 sm:ml-auto">
                {earnedBadges.length}/{badges.length} Collected
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {badges.map((badge) => {
                const isEarned = getBadgeStatus(badge)
                return (
                  <Tooltip key={badge.id} content={badge.description}>
                    <div
                      className={cn(
                        "group relative p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer",
                        isEarned
                          ? "bg-gradient-to-br from-white to-yellow-50 shadow-xl hover:shadow-2xl border-yellow-400 hover:scale-105"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 opacity-80 hover:opacity-95",
                      )}
                    >
                      {/* Earned Badge Glow Effect */}
                      {isEarned && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-2xl blur-sm animate-pulse" />
                      )}

                      <div className="relative z-10">
                        {/* Badge Icon */}
                        <div
                          className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-300",
                            isEarned
                              ? `${badge.bgColor} ${badge.color} shadow-lg group-hover:scale-110 group-hover:rotate-12`
                              : "bg-gray-300 text-gray-600",
                          )}
                        >
                          {badge.icon}
                        </div>

                        {/* Badge Info */}
                        <div className="text-center">
                          <h4 className={cn("font-bold text-lg mb-2", isEarned ? "text-gray-900" : "text-gray-800")}>
                            {badge.name}
                          </h4>

                          {/* Progress Indicator */}
                          <div
                            className={cn("text-xs font-medium mb-3", isEarned ? "text-green-600" : "text-gray-700")}
                          >
                            {badge.type === "prompts"
                              ? `${Math.min(prompts, badge.requirement)}/${badge.requirement} prompts`
                              : badge.type === "apps"
                              ? `${Math.min(appsUnlocked.length, badge.requirement)}/${badge.requirement} apps`
                              : `${Math.min(customAgentsCreated, badge.requirement)}/${badge.requirement} agents`}
                          </div>

                          {/* Earned Badge Indicator */}
                          {isEarned && (
                            <div className="mt-3">
                              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Earned!
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Section */}
        <Card className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-purple-200/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <Gift className="w-8 h-8 text-purple-600" />
                <h3 className="text-3xl font-bold text-purple-900">Awesome Rewards Await!</h3>
              </div>
              <p className="text-purple-700 max-w-2xl mx-auto text-lg">
                Keep learning to unlock amazing prizes and show off your achievements!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-xl text-purple-900 mb-2">Share Progress</h4>
                <p className="text-purple-700">Show your friends how awesome you are!</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-xl text-purple-900 mb-2">Certificates</h4>
                <p className="text-purple-700 mb-4">Earn official certificates for your achievements!</p>
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Prompting Certificate
                </button>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-xl text-purple-900 mb-2">Special Access</h4>
                <p className="text-purple-700">Unlock exclusive features and content!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        open={showCertificateModal}
        onOpenChange={setShowCertificateModal}
        loading={false}
      />
    </section>
  )
}

export default PracticeProgress