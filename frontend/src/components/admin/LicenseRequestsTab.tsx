import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { Check, X, Trash2, Building, Mail, User, Calendar, RefreshCw, Loader2, FileText } from "lucide-react"
import { toast } from "sonner"

interface LicenseRequest {
  _id: string
  organizationName: string
  reuqesterName: string
  email: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

const LicenseRequestsTab = () => {
  const [requests, setRequests] = useState<LicenseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const { token } = useAuth()

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/license-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch license requests")
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to load license requests")
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (requestToHandle: LicenseRequest, action: "approve" | "reject") => {
    setProcessing(requestToHandle._id)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/license-requests/${requestToHandle._id}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) throw new Error(`Failed to ${action} request`)

      if (action === "approve") {
        const approvalData = await response.json()
        const clubId = approvalData._id || requestToHandle._id

        if (!clubId) {
          throw new Error("Club ID not returned after license approval. Cannot register club user.")
        }

        const registerUserResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/register`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: requestToHandle.email,
            clubId: clubId,
            organizationName: requestToHandle.organizationName,
          }),
        })

        if (!registerUserResponse.ok) {
          const errorData = await registerUserResponse.json()
          throw new Error(errorData.error || "Failed to register club user after approval.")
        }
        toast.success("License approved and club user registered successfully!")
      } else {
        toast.success("License request rejected")
      }

      fetchRequests()
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${action} request`)
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return

    setProcessing(requestId)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/license-requests/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to delete request")
      toast.success("Request deleted successfully")
      fetchRequests()
    } catch (error) {
      console.error("Error deleting request:", error)
      toast.error("Failed to delete request")
    } finally {
      setProcessing(null)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const processedRequests = requests.filter((r) => r.status !== "pending")

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading license requests...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">License Requests</h2>
          <p className="text-gray-600 mt-1">Review and manage organization license requests</p>
        </div>
        <Button
          onClick={fetchRequests}
          variant="outline"
          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <FileText className="w-5 h-5" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request._id}
                className="p-6 border border-yellow-200 rounded-lg bg-yellow-50/50 hover:bg-yellow-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {request.organizationName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.organizationName}</h3>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Requester:</span>
                        <span>{request.reuqesterName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium">Email:</span>
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Requested:</span>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                      <p className="text-gray-600">{request.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleRequest(request, "approve")}
                      disabled={processing === request._id}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {processing === request._id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRequest(request, "reject")}
                      disabled={processing === request._id}
                      variant="outline"
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-600" />
              Processed Requests ({processedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {processedRequests.map((request) => (
              <div key={request._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{request.organizationName}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Requester:</span> {request.reuqesterName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {request.email}
                      </p>
                      <p>
                        <span className="font-medium">Processed:</span>{" "}
                        {new Date(request.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {request.status === "rejected" && (
                    <Button
                      onClick={() => handleDelete(request._id)}
                      disabled={processing === request._id}
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      {processing === request._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No license requests</h3>
            <p className="text-gray-600">License requests will appear here when organizations apply for access</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LicenseRequestsTab
