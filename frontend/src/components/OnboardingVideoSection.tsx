import type React from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { PlayCircle, Zap, ArrowRight } from "lucide-react"

const OnboardingVideoSection: React.FC = () => {
  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)

      // Handle YouTube links
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        let videoId = ""
        if (urlObj.hostname.includes("youtube.com")) {
          const params = new URLSearchParams(urlObj.search)
          videoId = params.get("v") || ""
        } else {
          videoId = urlObj.pathname.split("/").pop() || ""
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      }

      // Handle Google Drive links
      if (urlObj.hostname.includes("drive.google.com")) {
        const match = urlObj.pathname.match(/\/file\/d\/([^/]+)\/view/)
        if (match && match[1]) {
          const fileId = match[1]
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }

      // Handle Loom links
      if (urlObj.hostname.includes("loom.com")) {
        if (urlObj.pathname.includes("/share/")) {
          const shareId = urlObj.pathname.split("/").pop() || ""
          if (shareId) {
            return `https://www.loom.com/embed/${shareId}`
          }
        } else if (urlObj.pathname.includes("/embed/")) {
          return url
        }
      }

      return url
    } catch (e) {
      console.error("Error parsing video URL:", e)
      return null
    }
  }

  const videoUrl = "https://youtu.be/wJUDmcJ_crA"
  const embedBase = getEmbedUrl(videoUrl)
  const embedUrl = embedBase
    ? `${embedBase}?rel=0&modestbranding=1&controls=1&playsinline=1`
    : null

  const navigate = useNavigate()

  return (
    <section className="relative bg-white text-gray-900 py-24 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Video Card - Takes 3 columns on large screens */}
          <div className="relative group animate-fade-in-left animation-delay-400 lg:col-span-3">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              
              {/* Video container */}
              <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="aspect-video relative">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      title="AI Learning Demo"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-600">
                      <div className="text-center">
                        <PlayCircle className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                        <p className="text-lg font-sans">Video Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Side - Takes 2 columns on large screens */}
          <div className="space-y-8 animate-fade-in-right animation-delay-600 lg:col-span-2">
            <div className="space-y-6 text-center md:text-center lg:text-left">
              <h3 className="text-3xl lg:text-4xl font-bold font-sans text-gray-900 leading-tight">
                Your AI Prompting
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Adventure Begins
                </span>
              </h3>
              
              <p className="text-lg text-gray-700 font-sans leading-relaxed text-left">
                Discover how our AI-powered platform adapts to your learning style, 
                provides real-time feedback, and guides you through different challenges 
                that make complex concepts simple and engaging.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                "Interactive AI agents that understand your pace",
                "Real-time feedback and personalized guidance", 
                "Gamified learning with progress tracking"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 animate-fade-in-up justify-start" style={{ animationDelay: `${800 + index * 200}ms` }}>
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="text-gray-700 font-sans">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="animate-fade-in-up animation-delay-1200 flex justify-center md:justify-center lg:justify-start">
              <Button
                onClick={() => window.open("/practice", "_blank")}
                className="group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white font-semibold font-sans px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-500/30 bg-[length:200%_100%] hover:bg-[position:100%_0]"
              >
                <span className="flex items-center gap-3">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fade-in-right 0.8s ease-out forwards; }
        
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
        .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
        .animation-delay-800 { animation-delay: 0.8s; opacity: 0; }
        .animation-delay-1000 { animation-delay: 1s; opacity: 0; }
        .animation-delay-1200 { animation-delay: 1.2s; opacity: 0; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </section>
  )
}

export default OnboardingVideoSection