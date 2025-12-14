import type React from "react"
import { Mail, Phone } from "lucide-react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 relative z-20 font-sans border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Prompting.AI Logo"
                className="h-8 w-auto"
              />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Prompting.AI
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Built on over a decade of AI literacy and real-world classroom experience. Transforming education through
              proven AI-driven approaches to workforce, trade, and business skill development.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>support@Prompting.AI</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>Available 24/7 for platform support</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg text-center md:text-left">Platform</h4>
            <ul className="space-y-3 text-sm text-center md:text-left">
              <li>
                <a href="/" className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/practice"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Practice Zone
                </a>
              </li>
              <li>
                <a
                  href="/#agents"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1"
                >
                  AI Agents
                </a>
              </li>
              <li>
                <a
                  href="/#credentials"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1"
                >
                  Credentials
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg text-center md:text-left">Support & Legal</h4>
            <ul className="space-y-3 text-sm text-center md:text-left">
              <li>
                <a
                  href="/#support"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/#licensing"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1"
                >
                  Organization Licensing
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand Callout */}
        <div className="mt-16 mb-8 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[1px] rounded-2xl">
            <div className="bg-gray-900 rounded-2xl px-8 py-6">
              <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                PromptToSuccess.AI
              </h3>
              <p className="text-gray-400 text-lg font-medium">
                — Powered by <span className="text-white font-bold">Prompting.AI</span>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Prompting.AI. All rights reserved. • Built with proven AI methodology since 2015.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
