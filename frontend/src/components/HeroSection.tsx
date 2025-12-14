import type React from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

const HeroSection: React.FC = () => {
  const navigate = useNavigate()
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const fullText = "Become a Prompt Master Champion for All"
  
  useEffect(() => {
    const typeSpeed = 100 // Speed for typing
    const deleteSpeed = 50 // Speed for deleting
    const pauseTime = 2000 // Pause when text is complete
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing phase
        if (displayText.length < fullText.length) {
          setDisplayText(fullText.substring(0, displayText.length + 1))
        } else {
          // Start deleting after a pause
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        // Deleting phase
        if (displayText.length > 0) {
          setDisplayText(fullText.substring(0, displayText.length - 1))
        } else {
          // Start typing again
          setIsDeleting(false)
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed)
    
    return () => clearTimeout(timer)
  }, [displayText, isDeleting, fullText])

  return (
    <section className="relative min-h-screen bg-transparent overflow-hidden">
      <video
        src="/5892372-hd_1280_720_30fps.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold font-sans text-white mb-6 animate-fade-in-up animation-delay-200" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'
          }}>
            Endless Possibilities <br />
            <span className="text-white font-light inline-block">
              {displayText}
              <span className="animate-pulse ml-1">|</span>
            </span>
          </h1>

          <h2 className="text-xl md:text-2xl font-medium font-sans text-white mb-8 tracking-wide animate-fade-in-up animation-delay-400 leading-relaxed opacity-90" style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            Your Skills. Your Future. Your Gain.
          </h2>

          <div className="animate-fade-in-up animation-delay-600 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none mx-auto">
            <Button
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-purple-600 hover:to-purple-700 text-white font-semibold font-sans px-8 py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20 w-full sm:w-auto"
              onClick={() => window.open("/practice", "_blank")}
            >
              Prompting Zone
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-gray-900 hover:bg-white/90 hover:text-gray-900 font-semibold font-sans px-8 py-3 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group w-full sm:w-auto"
              onClick={() => {
                // Add learn more functionality here
                console.log("Learn More clicked")
              }}
            >
              <span className="flex items-center gap-2 justify-center">
                Learn More 
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Custom CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @keyframes shooting-star {
          0% { opacity: 0; transform: translateX(-100px) translateY(0px); }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateX(300px) translateY(100px); }
        }
        
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-30px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-15px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-shooting-star { animation: shooting-star 3s linear infinite; }
        .animate-float-particle { animation: float-particle 6s ease-in-out infinite; }
        
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
      `}</style>
    </section>
  )
}

export default HeroSection
