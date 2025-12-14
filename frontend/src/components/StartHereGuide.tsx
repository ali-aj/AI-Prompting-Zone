import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  MessageSquare, 
  Unlock, 
  Award, 
  Download,
  ArrowRight,
  Compass
} from "lucide-react"

const steps = [
  {
    icon: <Users className="w-8 h-8" />,
    title: "Choose Your Agent",
    description: "Pick an AI agent that matches your learning goals",
    number: 1,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: "Follow the Prompts", 
    description: "Complete interactive prompts to learn new skills",
    number: 2,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    icon: <Unlock className="w-8 h-8" />,
    title: "Unlock Your App",
    description: "Get access to real-world apps like Canva or Padlet",
    number: 3,
    color: "text-green-500",
    bgColor: "bg-green-50", 
    borderColor: "border-green-200",
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Collect Badges",
    description: "Earn achievements and track your progress",
    number: 4,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: "Download Certificate",
    description: "Get your official certificate to share your success",
    number: 5,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
]

const StartHereGuide: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl shadow-xl">
              <Compass className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start Here - Your Learning Journey
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Follow these 5 simple steps to master AI tools and earn certificates!
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Step Card */}
              <Card className={`${step.bgColor} ${step.borderColor} border-2 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 h-full`}>
                <CardContent className="p-8 text-center h-full flex flex-col">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-gray-200">
                      <span className="text-sm font-bold text-gray-700">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`${step.color} mb-6 mx-auto flex justify-center`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow Connector (except for last item and mobile) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col items-center gap-6 p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xl font-semibold">Ready to begin?</span>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-300"></div>
            </div>
            <p className="text-gray-600 text-base max-w-md leading-relaxed">
              Scroll down to choose your first AI agent and start your learning adventure!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StartHereGuide
