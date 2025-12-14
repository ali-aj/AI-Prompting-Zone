import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Edit, Trash2, Save, X, Loader2, UserCheck, Building } from "lucide-react"
import { toast } from "sonner"

interface Student {
  _id: string
  name: string
  email: string
  username: string
  club: {
    name: string
  }
  prompts?: number
  appsUnlocked?: string[]
}

const StudentsTab = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", username: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { token } = useAuth()

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch learners")
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching learners:", error)
      toast.error("Failed to load learners")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filtered = students.filter(
    (s) =>
      s._id.toString().includes(search) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.username && s.username.toLowerCase().includes(search.toLowerCase())) ||
      (s.club?.name && s.club.name.toLowerCase().includes(search.toLowerCase())),
  )

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this learner?")) return

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to delete learner")
      setStudents(students.filter((s) => s._id !== id))
      toast.success("Student deleted successfully")
    } catch (error) {
      console.error("Error deleting learner:", error)
      toast.error("Failed to delete learner")
    }
  }

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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/${editing}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) throw new Error("Failed to update learner")
      const updatedStudent = await response.json()
      setStudents(students.map((s) => (s._id === editing ? updatedStudent : s)))
      setEditing(null)
      toast.success("Student updated successfully")
    } catch (error) {
      console.error("Error updating learner:", error)
      toast.error("Failed to update learner")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading learners...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Learner Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor learner accounts</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{students.length} total learners</span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, email, username, or club..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Learners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Learners ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Learner</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Organization</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Progress</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900">{student.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{student.club?.name || "No club"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {student.prompts || 0} prompts
                        </Badge>
                        {student.appsUnlocked && student.appsUnlocked.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {student.appsUnlocked.length} apps
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student._id)}
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No learners found</h3>
              <p className="text-gray-600">
                {search ? "Try adjusting your search criteria" : "No learners have registered yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
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
    </div>
  )
}

export default StudentsTab
