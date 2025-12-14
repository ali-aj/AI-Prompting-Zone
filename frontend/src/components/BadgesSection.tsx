import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { progressService, type StudentProgress } from "@/services/progressService"
import { useAuth } from "@/context/AuthContext"
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
  Shield,
  Flame,
} from "lucide-react"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  requirement: number
  type: "prompts" | "apps"
  color: string
  bgColor: string
}

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
  },
]

const BadgesSection = () => {
  const { user, token } = useAuth()
  const [progress, setProgress] = useState<StudentProgress>({
    prompts: 0,
    appsUnlocked: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (!token || !user) {
          setLoading(false)
          return
        }

        const data = await progressService.getProgress()
        setProgress(data)
      } catch (error) {
        console.error("Error fetching progress:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [token, user])

  const appsUnlocked = progress?.appsUnlocked || []
  const prompts = progress?.prompts || 0

  const earnedBadges = badges.filter((badge) => {
    if (badge.type === "prompts") {
      return prompts >= badge.requirement
    } else if (badge.type === "apps") {
      return appsUnlocked.length >= badge.requirement
    }
    return false
  })

  const getBadgeStatus = (badge: BadgeData) => {
    if (badge.type === "prompts") {
      return prompts >= badge.requirement
    } else if (badge.type === "apps") {
      return appsUnlocked.length >= badge.requirement
    }
    return false
  }

  // Don't show the section if user is not authenticated or loading
  if (loading || !user || !token) {
    return null
  }

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Your badges Journey
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Celebrate your learning journey with these earned badges
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-xl text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              Loading badges...
            </div>
          </div>
        )}

        {/* Badges Summary */}
        {!loading && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-gray-200/50 rounded-3xl overflow-hidden mb-12">
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{earnedBadges.length}</div>
                  <p className="text-gray-700 font-medium">Badges Earned</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{badges.length}</div>
                  <p className="text-gray-700 font-medium">Total Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earned Badges Grid */}
        {!loading && earnedBadges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {earnedBadges.map((badge) => (
              <Card
                key={badge.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden"
              >
                {/* Gradient top border */}
                <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
                
                <CardContent className="p-6">
                  {/* Badge Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 ${badge.bgColor} ${badge.color} shadow-lg group-hover:scale-110`}
                  >
                    {badge.icon}
                  </div>

                  {/* Badge Info */}
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-2 text-gray-900">
                      {badge.name}
                    </h4>
                    <p className="text-sm mb-3 text-gray-600">
                      {badge.description}
                    </p>

                    {/* Earned Badge Indicator */}
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Earned!
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Badges Message */}
        {!loading && earnedBadges.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-xl text-gray-600 mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
              No badges earned yet
            </div>
            <p className="text-gray-500 mb-6">
              Start your learning journey to earn your first badge!
            </p>
          </div>
        )}

        {/* Call to Action */}
        {!loading && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Continue your journey to unlock more badges and master new skills!
            </p>
            <a
              href="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <TrendingUp className="w-5 h-5" />
              Continue Learning
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

export default BadgesSection 