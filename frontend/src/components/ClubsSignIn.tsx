import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import { useAuth } from "@/context/AuthContext"
import { Building2, Eye, EyeOff, Loader2, AlertCircle, Mail } from "lucide-react"

const ClubsSignIn = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/clubs/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in")
      }

      login(data.token, {
        _id: data._id,
        username: data.email,
        userType: data.userType,
        email: data.email,
        clubId: data.clubId,
      })

      navigate("/club/dashboard")
    } catch (err) {
      setError("Invalid credentials. Please check your email and password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Mountain background image */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1920 1080\"%3E%3Cpath fill=\"%234f46e5\" d=\"M0 1080h1920V400L1440 200 960 400 480 100 0 400z\"%3E%3C/path%3E%3Cpath fill=\"%236366f1\" d=\"M0 1080h1920V500L1440 300 960 500 480 200 0 500z\"%3E%3C/path%3E%3Cpath fill=\"%237c3aed\" d=\"M0 1080h1920V600L1440 400 960 600 480 300 0 600z\"%3E%3C/path%3E%3C/svg%3E')",
          backgroundPosition: "center 100px"
        }}
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-white/5" />

      <Header />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Centered modal card */}
        <div className="bg-blue-50/100 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Club Portal</h2>
            <p className="text-gray-600 text-sm">Manage your organization's learning</p>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <div className="space-y-2">
              <label className="text-gray-700 text-sm font-medium block">Email Address</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your club email"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="text-gray-700 text-sm font-medium block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-semibold rounded-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ClubsSignIn