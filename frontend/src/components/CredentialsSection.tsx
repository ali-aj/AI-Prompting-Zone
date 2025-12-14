import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Badge, BarChart3, Smartphone, Star, Trophy } from "lucide-react"

const credentials = [
  {
    icon: <Award className="w-8 h-8 text-amber-600" />,
    title: "AI Prompting Certificates",
    description: "Earn official certificates for completing prompting courses with industry recognition.",
    color: "from-amber-400 to-orange-400",
    bgColor: "bg-amber-50",
  },
  {
    icon: <Trophy className="w-8 h-8 text-yellow-600" />,
    title: "Digital Badges for Completed Paths",
    description: "Collect beautiful badges as you progress through agent challenges and skill levels.",
    color: "from-yellow-400 to-amber-400",
    bgColor: "bg-yellow-50",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
    title: "Progress Reports",
    description: "Comprehensive tracking for learner progress across clubs, schools, and families.",
    color: "from-orange-400 to-red-400",
    bgColor: "bg-orange-50",
  },
  {
    icon: <Smartphone className="w-8 h-8 text-amber-700" />,
    title: "Lifelong Access",
    description: "Available on mobile or desktop anytime, anywhere with cloud synchronization.",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50",
  },
]

const CredentialsSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg">
              <Badge className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 via-yellow-600 to-orange-700 bg-clip-text text-transparent">
              Credentials That Matter
            </h2>
          </div>
          <p className="text-amber-700 text-lg max-w-2xl mx-auto leading-relaxed">
            Build a portfolio of achievements that showcase your AI prompting expertise and unlock new opportunities.
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {credentials.map((credential, index) => (
            <Card
              key={index}
              className="group bg-white/80 backdrop-blur-sm border border-yellow-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] rounded-2xl overflow-hidden"
            >
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${credential.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {credential.icon}
                    </div>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-bold text-amber-900 mb-3 group-hover:text-amber-700 transition-colors duration-300">
                      {credential.title}
                    </h3>
                    <p className="text-amber-700 leading-relaxed mb-4">{credential.description}</p>
                    <div className="flex items-center gap-2 text-orange-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">Professional Recognition</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CredentialsSection
