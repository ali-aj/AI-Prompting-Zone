import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Lightbulb,
  TrendingUp,
  Users,
  Rocket,
  Calendar,
  Brain,
  Award,
  Target,
  Quote,
  Heart,
  Sparkles,
  Building,
  Star,
} from "lucide-react"

const FounderJourneySection: React.FC = () => {
  const milestones = [
    {
      year: "2015",
      title: "The Spark",
      description:
        "Spiral Buddy was born from a simple observation: students needed personalized, engaging learning companions.",
      icon: <Lightbulb className="w-6 h-6" />,
      color: "from-yellow-400 to-orange-400",
      bgColor: "bg-yellow-50",
    },
    {
      year: "2015-2017",
      title: "Breakthrough Results",
      description: "Achieved 70% reading growth in just 2 weeks, proving AI could revolutionize education.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-400 to-emerald-400",
      bgColor: "bg-green-50",
    },
    {
      year: "2018-2022",
      title: "Real-World Impact",
      description: "Deployed in classrooms, impacting 1000+ students and refining our AI-driven approach.",
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-400 to-cyan-400",
      bgColor: "bg-blue-50",
    },
    {
      year: "2023-2024",
      title: "TrainingX.AI Evolution",
      description: "Expanded beyond education to workforce development, bringing AI literacy to all learners.",
      icon: <Rocket className="w-6 h-6" />,
      color: "from-purple-400 to-pink-400",
      bgColor: "bg-purple-50",
    },
  ]

  const achievements = [
    { number: "10+", label: "Years of AI Experience", icon: <Calendar className="w-5 h-5" /> },
    { number: "70%", label: "Reading Growth in 2 Weeks", icon: <TrendingUp className="w-5 h-5" /> },
    { number: "1000+", label: "Students Impacted", icon: <Users className="w-5 h-5" /> },
    { number: "12+", label: "AI Agents Developed", icon: <Brain className="w-5 h-5" /> },
  ]

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59 130 246) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "4s" }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg transform -rotate-3">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              The Founder's Journey
            </h2>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            From a classroom innovation to a global AI education platform — discover the decade-long journey that shaped
            TrainingX.AI
          </p>
          
          <div className="flex justify-center mt-6">
            <div className="h-1 w-32 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Founder Story Card - Takes 8 columns */}
          <Card className="lg:col-span-8 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardContent className="p-8">
              {/* Founder Photo and Quote in Same Row */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="relative mb-6 md:mb-0 md:mr-4 flex-shrink-0 flex justify-center w-full md:w-auto">
                  <div className="relative w-60 h-60 md:w-60 md:h-60">
                    <img
                      src="founder.jpeg"
                      alt="Derrick O'Neal - TrainingX.AI Founder"
                      className="rounded-full object-cover border-4 border-white shadow-xl w-full h-full"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <Quote className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 rounded-2xl p-6 border border-blue-100 shadow-xl">
                  <Quote className="w-8 h-8 text-blue-500 mb-4" />
                  <blockquote className="text-lg font-medium text-slate-700 italic leading-relaxed mb-4">
                    "In 2015, I witnessed something extraordinary: students who struggled with traditional learning
                    methods suddenly thrived when paired with an AI companion. That 70% reading improvement in just two
                    weeks wasn't just a statistic — it was proof that AI could democratize education."
                  </blockquote>
                  <div className="text-left">
                    <p className="font-bold text-slate-800">— Derrick O'Neal</p>
                    <p className="text-sm text-slate-500">Founder & CEO, TrainingX.AI</p>
                    <p className="text-sm text-slate-500">Educator & AI Innovation Pioneer</p>
                  </div>
                </div>
              </div>

              {/* Mission Statement */}
              <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 rounded-2xl p-6 border border-blue-100 shadow-xl relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full -ml-8 -mb-8 blur-xl"></div>
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-800 bg-clip-text text-transparent">Our Long-Term Vision</h3>
                </div>
                
                <div className="space-y-3 relative z-10">
                  <p className="text-slate-700 leading-relaxed">
                    We're building a future where <span className="font-semibold">every learner masters AI literacy</span> and develops 
                    the prompting skills needed to unlock their full potential in an AI-powered world.
                  </p>
                  
                  <p className="text-slate-700 leading-relaxed">
                    By 2030, we aim to empower 100 million students, professionals, and entrepreneurs with the tools to 
                    leverage AI as a transformative force for personal growth, career advancement, and societal progress.
                  </p>
                  
                  <div className="flex items-center pt-2">
                    <div className="h-1 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                    <p className="font-medium text-indigo-700">Together, we're shaping the future of human-AI collaboration</p>
                  </div>
                </div>
              </div>

              {/* Why Educational Partners Trust Us - Moved from below */}
              <div className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-300/10 to-indigo-300/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-300/10 to-pink-300/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Why Educational Partners Trust Us</h3>
                </div>
                
                <p className="text-blue-100 text-sm mb-5">
                  Built on a foundation of real classroom experience and proven results
                </p>

                <div className="grid grid-cols-3 gap-4 relative z-10">
                  <div className="text-center group">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Classroom-Tested</h4>
                    <p className="text-blue-100 text-xs">
                      Validated in real educational environments
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Innovation-Driven</h4>
                    <p className="text-blue-100 text-xs">
                      Evolving with latest AI advances
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Scalable Solutions</h4>
                    <p className="text-blue-100 text-xs">
                      From classrooms to school districts
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline - Takes 4 columns */}
          <div className="lg:col-span-4">
            {/* Evolution Timeline - Stunning Version */}
            <Card className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden relative h-full">
              <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/10 to-pink-200/10 rounded-full -mr-20 -mt-20 blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/10 to-indigo-200/10 rounded-full -ml-16 -mb-16 blur-xl"></div>
              <div className="absolute h-full w-1 left-[30px] top-0 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 opacity-20"></div>
              
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-700 bg-clip-text text-transparent">Innovation Journey</h3>
                </div>

                <div className="space-y-8 relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[18px] top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-indigo-300 to-purple-300 opacity-30"></div>
                  
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-4 group relative">
                      {/* Timeline dot */}
                      <div className="absolute left-[14px] top-[18px] w-8 h-8 rounded-full border-3 border-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md z-10"></div>
                      
                      <div className="flex-shrink-0 w-10">
                        {/* This is just a spacer */}
                      </div>
                      
                      <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-indigo-50/60 group-hover:shadow-xl group-hover:border-indigo-100 transition-all duration-300 transform group-hover:-translate-y-1">
                        <Badge variant="outline" className="mb-2 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-100 font-medium text-xs">
                          {milestone.year}
                        </Badge>
                        
                        <div className="flex items-center mb-2">
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${milestone.color} rounded-lg flex items-center justify-center text-white shadow-sm mr-2`}
                          >
                            {milestone.icon}
                          </div>
                          <h4 className="font-bold text-slate-800">{milestone.title}</h4>
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed text-sm pl-2 border-l-2 border-indigo-100">
                          {milestone.description}
                        </p>
                        
                        {/* Visual indicator */}
                        <div className={`h-1 w-12 bg-gradient-to-r ${milestone.color} rounded-full mt-2 opacity-80`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-white/10">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-white font-medium">Ready to transform education with proven AI solutions?</span>
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default FounderJourneySection