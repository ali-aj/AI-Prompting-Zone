import type React from "react"
import { TrendingUp, Users, Award, Zap } from "lucide-react"

const AboutSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Why Prompting.AI is{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Different
            </span>
          </h2>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 shadow-xl border border-gray-100">
            <p className="text-xl leading-relaxed text-gray-700 mb-8">
              <span className="font-semibold text-gray-900">Prompting.AI</span> is built on over a decade of{" "}
              <span className="font-semibold text-blue-600">AI literacy</span> and{" "}
              <span className="font-semibold text-blue-600">real-world classroom experience</span>. In 2015, we launched{" "}
              <span className="font-semibold text-purple-600">Spiral Buddy</span>, achieving{" "}
              <span className="font-bold text-green-600">70% reading growth</span> in just two weeks. Now, we're
              applying that same AI-driven approach to <span className="font-semibold text-indigo-600">workforce</span>,{" "}
              <span className="font-semibold text-indigo-600">trade</span>, and{" "}
              <span className="font-semibold text-indigo-600">business skill development</span>.
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">70%</h3>
                <p className="text-gray-600">Reading Growth in 2 Weeks</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">10+</h3>
                <p className="text-gray-600">Years of AI Experience</p>
              </div>
              {/* <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">1000+</h3>
                <p className="text-gray-600">Learners Impacted</p>
              </div> */}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default AboutSection
