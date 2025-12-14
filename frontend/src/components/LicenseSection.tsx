import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Building, Users, Settings, HeadphonesIcon, Send, CheckCircle } from "lucide-react"
import type React from "react"
import { useState } from "react"

const LicenseSection: React.FC = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [organization, setOrganization] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = {
      name,
      email,
      organization,
      message,
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/license-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        // Reset form
        setName("")
        setEmail("")
        setOrganization("")
        setMessage("")
        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000)
      }
    } catch (error) {
      console.error("Error submitting contact request:", error)
    }
  }

  return (
    <section id="club-request" className="relative py-24 bg-transparent overflow-hidden scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Want This Platform For Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              School or Organization?
            </span>
          </h2>

          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            We offer custom branding, admin dashboards, and dedicated training support. Fill out the form below, and our
            team will be in touch!
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Custom Branding</h3>
                <p className="text-sm text-gray-600">Your logo and colors</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
                <p className="text-sm text-gray-600">Full control and analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <HeadphonesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Training Support</h3>
                <p className="text-sm text-gray-600">Dedicated assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl max-w-2xl mx-auto rounded-2xl">
          <CardContent className="p-8">
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">We've received your message and will be in touch within 24 hours.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Name *</label>
                    <Input
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Email *</label>
                    <Input
                      type="email"
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Organization *</label>
                  <Input
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="School, company, or organization name"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Message *</label>
                  <Textarea
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tell us about your needs, number of users, and how you'd like to use the platform..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  type="submit"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </section>
  )
}

export default LicenseSection
