import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import Header from "@/components/Header"
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

const AdminSignIn = () => {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in")
      }

      login(data.token, { _id: data._id, username: data.username, userType: data.userType })
      navigate("/admin/dashboard")
    } catch (err) {
      console.error("Admin Sign In Error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Mountain background image - same as ClubsSignIn */}
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Super Admin</h2>
            <p className="text-gray-600 text-sm">Access system administration</p>
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
            {/* Username input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-gray-700 text-sm font-medium block">
                Username
              </label>
              <Input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-gray-700 text-sm font-medium block">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your password"
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
                  Signing In...
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

export default AdminSignIn