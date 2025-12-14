import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Sparkles, Users, Zap } from "lucide-react"

const SupportSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
              FAQ + Beta Support Section
            </h2>
          </div>
          <p className="text-blue-600 text-lg max-w-2xl mx-auto leading-relaxed">
            We're here to help you navigate your AI learning journey with comprehensive support and resources.
          </p>
        </div>

        {/* Support Cards */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Beta Experience Card */}
          <Card className="group bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      BETA
                    </span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                    Data Experience
                  </h3>
                  <p className="text-blue-700 text-lg leading-relaxed">
                    This is a Beta Experience with active updates. We're improving the platform based on your feedback
                    and continuously adding new features to enhance your learning journey.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-cyan-600">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Constantly evolving</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Support Card */}
          <Card className="group bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                    Chat Support Note
                  </h3>
                  <p className="text-blue-700 text-lg leading-relaxed">
                    Spiral Buddy chat support is coming soon — just like ChatGPT, but built specifically for learners
                    with educational focus and safety features.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-cyan-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">learner-focused design</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  )
}

export default SupportSection
