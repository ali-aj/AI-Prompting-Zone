import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Check, X, Trash2, Building, Users, Calendar, Mail, User, Activity, Shield, Clock, Edit, Save, BarChart2, BookOpen, FileText, Eye } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import Header from "@/components/Header"

interface Club {
  _id: string
  organizationName: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface Student {
  _id: string
  username: string
  name: string
  email: string
  status: "Pending" | "Approved" | "Rejected"
  createdAt: string
}

interface StudentProgress {
  prompts: number
  appsUnlocked: string[]
  studentInfo: {
    name: string
    username: string
    email: string
    status: string
  }
}

const ClubDashboard = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<string | null>(null)
  const [viewingProgress, setViewingProgress] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", username: "" })
  const [saving, setSaving] = useState(false)
  const [openManual, setOpenManual] = useState<{ fileUrl: string; fileName: string; _id: string } | null>(null)
  const [manualBlobUrl, setManualBlobUrl] = useState<string | null>(null)
  const [manualLoading, setManualLoading] = useState(false)

  const {
    data: club,
    isLoading: isClubLoading,
    error: clubError,
  } = useQuery<Club>({
    queryKey: ["club", user?.clubId],
    queryFn: async () => {
      if (!user?.clubId) throw new Error("No user ID")
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/clubs/${user.clubId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch club data")
      return response.json()
    },
    enabled: !!user?.clubId,
  })

  const {
    data: students,
    isLoading: isStudentsLoading,
    error: studentsError,
  } = useQuery<Student[]>({
    queryKey: ["students", user?.clubId],
    queryFn: async () => {
      if (!user?.clubId) throw new Error("No club ID")
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/club/${user.clubId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch learners data")
      return response.json()
    },
    enabled: !!user?.clubId,
  })

  // Add new query for student progress
  const {
    data: studentProgress,
    isLoading: isProgressLoading,
    error: progressError,
  } = useQuery<StudentProgress>({
    queryKey: ["studentProgress", viewingProgress],
    queryFn: async () => {
      if (!viewingProgress) throw new Error("No student ID")
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student-progress/student/${viewingProgress}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch student progress")
      return response.json()
    },
    enabled: !!viewingProgress,
  })

  // Add query for trainer manuals
  const {
    data: latestManual,
    isLoading: isManualsLoading,
    error: manualsError,
  } = useQuery({
    queryKey: ["latestManual"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manuals/latest`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) {
        if (response.status === 404) return null // No manuals available
        throw new Error("Failed to fetch latest manual")
      }
      return response.json()
    },
    enabled: !!user && user.userType === "admin",
  })

  // Approve student mutation
  const approveStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/${studentId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to approve learner")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", user?.clubId] })
      toast({
        title: "Success",
        description: "Learner approved successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve learner",
        variant: "destructive",
      })
    },
  })

  // Reject student mutation
  const rejectStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/${studentId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to reject learner")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", user?.clubId] })
      toast({
        title: "Success",
        description: "Learner rejected successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject learner",
        variant: "destructive",
      })
    },
  })

  // Delete student mutation
  const deleteStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/${studentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to delete learner")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", user?.clubId] })
      toast({
        title: "Success",
        description: "Learner deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete Learner",
        variant: "destructive",
      })
    },
  })

  // Edit student mutation
  const editStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/${studentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) throw new Error("Failed to update learner")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", user?.clubId] })
      setEditing(null)
      toast({
        title: "Success",
        description: "Learner updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update learner",
        variant: "destructive",
      })
    },
  })

  const handleEdit = (student: Student) => {
    setEditing(student._id)
    setEditForm({
      name: student.name,
      email: student.email || "",
      username: student.username,
    })
  }

  const handleEditSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await editStudent.mutateAsync(editing)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (clubError || studentsError) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    }
  }, [clubError, studentsError, toast])

  // Handle secure manual viewing
  useEffect(() => {
    if (openManual && openManual._id) {
      setManualLoading(true)
      
      // Use the protected backend route to fetch the PDF as blob
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manuals/view/${openManual._id}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch file")
          return res.blob()
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          setManualBlobUrl(url)
        })
        .catch((error) => {
          console.error('Error fetching manual:', error)
          toast({
            title: "Error",
            description: "Failed to load training manual",
            variant: "destructive",
          })
          setOpenManual(null)
        })
        .finally(() => setManualLoading(false))

      return () => {
        if (manualBlobUrl && manualBlobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(manualBlobUrl)
        }
        setManualBlobUrl(null)
      }
    }
  }, [openManual, toast])

  // Additional security measures for manual viewing
  useEffect(() => {
    if (openManual) {
      // Disable keyboard shortcuts that might allow copying
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 's' || e.key === 'p')) ||
          (e.metaKey && (e.key === 'c' || e.key === 'a' || e.key === 's' || e.key === 'p')) ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I')
        ) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }

      document.addEventListener('keydown', handleKeyDown, true)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true)
      }
    }
  }, [openManual])

  if (isClubLoading || isStudentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading club dashboard...</p>
        </div>
      </div>
    )
  }

  if (!club) return null

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const pendingStudents = students?.filter((s) => s.status === "Pending") || []
  const approvedStudents = students?.filter((s) => s.status === "Approved") || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59 130 246) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <Header />

      <div className="relative z-10 pt-16">
        {/* Enhanced Header Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Club Dashboard</h1>
                  <p className="text-gray-600">Manage your organization and students</p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
                  <span className="text-sm font-medium text-gray-700">Dashboard Active</span>
                </div>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200"
                >
                  <Shield className="w-4 h-4" />
                  Club Admin
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="group bg-white/70 backdrop-blur-sm border-blue-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Learners</p>
                    <p className="text-2xl font-bold text-gray-900">{students?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/70 backdrop-blur-sm border-green-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Approved Learner</p>
                    <p className="text-2xl font-bold text-gray-900">{approvedStudents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/70 backdrop-blur-sm border-yellow-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Learners</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingStudents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8">
            {/* Enhanced Club Information Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden rounded-2xl">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Building className="w-6 h-6 text-blue-600" />
                  Organization Information
                  <Badge className={`ml-auto ${getStatusColor(club.status)}`}>{club.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="w-4 h-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-700">Organization Name</h3>
                      </div>
                      <p className="text-gray-900 font-medium">{club.organizationName}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-700">Created Date</h3>
                      </div>
                      <p className="text-gray-900">{new Date(club.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-700">Description</h3>
                    </div>
                    <p className="text-gray-900 leading-relaxed">{club.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trainer Manuals Section */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden rounded-2xl">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Trainer Manuals
                  {latestManual && (
                    <Badge variant="outline" className="ml-auto">
                      Version {latestManual.version}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {isManualsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <span className="ml-3 text-gray-600">Loading trainer manuals...</span>
                  </div>
                ) : manualsError ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Manuals</h3>
                    <p className="text-gray-600">Failed to load trainer manuals. Please try again later.</p>
                  </div>
                ) : latestManual ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {latestManual.fileName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Version {latestManual.version} • Uploaded {new Date(latestManual.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Latest Training Manual</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => setOpenManual({
                            fileUrl: latestManual.fileUrl,
                            fileName: latestManual.fileName,
                            _id: latestManual._id
                          })}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Manual
                        </Button>
                      </div>
                    </div>
                    
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Training Manual Available</h3>
                    <p className="text-gray-600">Training manuals will appear here when uploaded by administrators.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Learners Management Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden rounded-2xl">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Users className="w-6 h-6 text-green-600" />
                  Learner Management
                  <Badge variant="outline" className="ml-auto">
                    {students?.length || 0} Total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {students && students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Learner</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Joined</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => (
                          <tr
                            key={student._id}
                            className={`border-b hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{student.name}</p>
                                  <p className="text-sm text-gray-500">@{student.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{student.email || "No email"}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">
                                  {new Date(student.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                  onClick={() => setViewingProgress(student._id)}
                                >
                                  <BarChart2 className="h-4 w-4" />
                                </Button>
                                {student.status !== "Approved" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                                    onClick={() => approveStudent.mutate(student._id)}
                                    disabled={approveStudent.isPending}
                                  >
                                    {approveStudent.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                {student.status === "Pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                    onClick={() => rejectStudent.mutate(student._id)}
                                    disabled={rejectStudent.isPending}
                                  >
                                    {rejectStudent.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                  onClick={() => handleEdit(student)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this learner?")) {
                                      deleteStudent.mutate(student._id)
                                    }
                                  }}
                                  disabled={deleteStudent.isPending}
                                >
                                  {deleteStudent.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No learners found</h3>
                    <p className="text-gray-600">Learners will appear here when they join your organization</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Progress View Modal */}
      {viewingProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Learner Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isProgressLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : progressError ? (
                <div className="text-center py-8 text-red-600">
                  Failed to load progress data
                </div>
              ) : studentProgress ? (
                <>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Prompts</p>
                        <p className="text-3xl font-bold text-blue-600">{studentProgress.prompts}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Apps Unlocked</p>
                        <p className="text-3xl font-bold text-purple-600">{studentProgress.appsUnlocked.length}</p>
                      </div>
                    </div>
                  </div>

                  {studentProgress.appsUnlocked.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Unlocked Apps</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {studentProgress.appsUnlocked.map((app, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{app}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewingProgress(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Learner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Username</label>
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)} className="px-6">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Viewing Modal */}
      {openManual && (
        <Dialog open={!!openManual} onOpenChange={() => {
          setOpenManual(null)
          if (manualBlobUrl) {
            URL.revokeObjectURL(manualBlobUrl)
            setManualBlobUrl(null)
          }
        }}>
          <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-white rounded-2xl overflow-hidden flex flex-col">
            <DialogHeader className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <BookOpen className="w-6 h-6 text-purple-600" />
                {openManual.fileName}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 flex flex-col">
              {manualLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Loading training manual...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we securely load the content</p>
                  </div>
                </div>
              ) : manualBlobUrl ? (
                <div 
                  className="flex-1 bg-gray-50"
                  style={{ userSelect: 'none' }}
                  onContextMenu={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                >
                  <iframe
                    src={manualBlobUrl}
                    className="w-full h-full border-none"
                    style={{
                      pointerEvents: 'auto',
                      background: '#f8fafc',
                    }}
                    title={openManual.fileName}
                    onLoad={(e) => {
                      // Prevent right-click and copy operations in iframe
                      try {
                        const iframe = e.target as HTMLIFrameElement
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
                        if (iframeDoc) {
                          iframeDoc.addEventListener('contextmenu', (e) => e.preventDefault())
                          iframeDoc.addEventListener('copy', (e) => e.preventDefault())
                          iframeDoc.addEventListener('cut', (e) => e.preventDefault())
                          iframeDoc.addEventListener('selectstart', (e) => e.preventDefault())
                        }
                      } catch (error) {
                        // Cross-origin restrictions may prevent this, but that's okay
                        console.log('Could not add iframe security listeners (expected for cross-origin)')
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg text-gray-900">Failed to load manual</p>
                    <p className="text-sm text-gray-500 mt-2">Please try again or contact support</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ClubDashboard
