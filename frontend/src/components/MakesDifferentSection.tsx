import type React from "react"
import {
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Building,
  Network,
  Smartphone,
  Target,
  Brain,
  Briefcase,
} from "lucide-react"

const features = [
  {
    icon: <Zap className="w-12 h-12 text-white" />,
    title: "Built on Reactive Parallelism",
    description:
      "Agents adapt in real-time to learner needs, providing personalized experiences that evolve instantly.",
    highlight: "Real-time adaptation",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
  },
  {
    icon: <TrendingUp className="w-12 h-12 text-white" />,
    title: "Uses Continuous AI",
    description: "Learners grow with the system over time, building skills that compound and accelerate progress.",
    highlight: "Continuous growth",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
  {
    icon: <Building className="w-12 h-12 text-white" />,
    title: "Covers Multiple Industries",
    description: "From school to career and entrepreneurship - comprehensive skill development across all sectors.",
    highlight: "All industries",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
  },
  {
    icon: <Network className="w-12 h-12 text-white" />,
    title: "Designed to Scale",
    description: "API-ready for schools, clubs, and nonprofits with enterprise-grade infrastructure.",
    highlight: "Enterprise ready",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
  },
  {
    icon: <Smartphone className="w-12 h-12 text-white" />,
    title: "Mobile-First with Real Results",
    description: "Fun, simple, and effective platform delivering measurable outcomes on any device.",
    highlight: "Proven results",
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50",
  },
]

const MakesDifferentSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What Makes Us{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Different?
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
            Experience the power of proven AI-driven education that transforms learning into an engaging, measurable
            journey.
          </p>

          {/* Key differentiators */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Spiral Method Success</h3>
                  <p className="text-blue-100 text-sm">Raised scores 70% in just 2 weeks with proven methodology</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Agents Built with Real Logic</h3>
                  <p className="text-blue-100 text-sm">Advanced AI reasoning that understands context and adapts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Built for Careers & Trades</h3>
                  <p className="text-blue-100 text-sm">
                    Real-world skills for entrepreneurship and professional growth
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Continuous AI That Works</h3>
                  <p className="text-blue-100 text-sm">
                    Long-term learning that compounds over time for lasting impact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              {/* Icon container */}
              <div className="relative mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-blue-100 leading-relaxed text-sm mb-6">{feature.description}</p>

              {/* Highlight badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-medium text-cyan-300">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                Key Feature
              </div>

              {/* Hover arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-8 py-4 shadow-xl">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">Ready to experience the difference?</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MakesDifferentSection
