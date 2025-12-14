import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/Header"
import { GraduationCap, User, Mail, Lock, Building2, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

interface Club {
  _id: string
  name: string
  organizationName: string
}

const StudentRegister = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    club: "",
  })
  const [clubs, setClubs] = useState<Club[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/clubs`)
        const data = await response.json()
        if (response.ok) {
          setClubs(data)
        } else {
          setError(data.error || "Failed to fetch clubs")
        }
      } catch (err) {
        setError("An error occurred while fetching clubs.")
      }
    }
    fetchClubs()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (error) setError("") // Clear error when user starts typing
  }

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, club: value })
    if (error) setError("")
  }

  const validateEmail = (email: string) => {
    if (!email) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validation
    if (!formData.username || !formData.password || !formData.name || !formData.club) {
      setError("Username, Password, Name, and Club are required.")
      setLoading(false)
      return
    }

    if (formData.email && !validateEmail(formData.email)) {
      setError("Please enter a valid email address or leave the field empty.")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register learner")
      }

      // Show success and redirect
      navigate("/student/signin", {
        state: { message: "Registration successful! Please sign in." },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:flex-1 lg:relative">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/pexels-dayana-joseph-68270166-8312669.jpg"
            alt="Person with headphones working on laptop in modern workspace"
          />
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 mt-10">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold font-sans text-gray-900 mb-2">Create your account</h1>
              <p className="text-gray-600 font-sans">
                Already have an account?{" "}
                <Link
                  to="/student/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium font-sans"
                >
                  Sign in here!
                </Link>
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-sans">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Two-column layout for form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium font-sans">Full Name</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 font-sans focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium font-sans">Username</label>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 font-sans focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Password with strength indicator */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium font-sans">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 font-sans focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium font-sans">
                      Email <span className="text-gray-500 text-xs font-medium font-sans">(Optional)</span>
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 font-sans focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Enter your email (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Club Selection - Full width */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium font-sans">Select Your Club</label>
                <Select value={formData.club} onValueChange={handleSelectChange} required>
                  <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-sans focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                    <SelectValue placeholder="Choose your club" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 shadow-xl">
                    {clubs.map((club) => (
                      <SelectItem key={club._id} value={club._id} className="text-gray-900 hover:bg-blue-50 font-medium font-sans">
                        {club.organizationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-purple-600 hover:to-purple-700 text-white font-semibold font-sans px-8 py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20 w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Start Your Journey"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentRegister