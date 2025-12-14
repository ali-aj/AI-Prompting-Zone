import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  X,
  Upload,
  FileText,
  Eye,
  Trash2,
  Download,
  Clock,
  Shield,
  BookOpen,
  AlertCircle,
  Loader2,
  CheckCircle,
  Lock,
} from "lucide-react"
import { toast } from "sonner"

const PDF_VIEWER_STYLE = {
  width: "100%",
  height: "600px",
  border: "none",
  pointerEvents: "auto" as React.CSSProperties["pointerEvents"],
  background: "#f8fafc",
}

const TrainerManualZone = () => {
  const { user, token } = useAuth()
  const [manuals, setManuals] = useState<any[]>([])
  const [latestManual, setLatestManual] = useState<any | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  const [openManual, setOpenManual] = useState<{ fileUrl: string; fileName: string } | null>(null)
  const [manualBlobUrl, setManualBlobUrl] = useState<string | null>(null)
  const [manualLoading, setManualLoading] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const isSuperAdmin = user?.userType === "super_admin"
  const isClubAdmin = user?.userType === "admin"

  useEffect(() => {
    if (isSuperAdmin) fetchManuals()
    if (isClubAdmin) fetchLatestManual()
  }, [user])

  const fetchManuals = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manuals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setManuals(data)
      setError(null)
    } catch (e) {
      setError("Failed to load manuals")
      toast.error("Failed to load manuals")
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestManual = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manuals/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLatestManual(data)
      setError(null)
    } catch (e) {
      setError("Failed to load manual")
      toast.error("Failed to load manual")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 50 * 1024 * 1024) {
        // 50MB limit
        toast.error("File size must be less than 50MB")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB")
        return
      }
      setFile(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manuals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json(); // Always parse as JSON
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setFile(null)
      fetchManuals()
      toast.success(data.message || "Manual uploaded successfully!")
    } catch (e) {
      setError("Upload failed")
      toast.error(e.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this manual version?")) return

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manuals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchManuals()
      toast.success("Manual deleted successfully!")
    } catch (e) {
      setError("Delete failed")
      toast.error("Delete failed")
    }
  }

  // Prevent right-click, copy, and print in viewer
  useEffect(() => {
    if (viewerRef.current) {
      const prevent = (e: any) => e.preventDefault()
      const element = viewerRef.current
      element.addEventListener("contextmenu", prevent)
      element.addEventListener("copy", prevent)
      element.addEventListener("cut", prevent)
      element.addEventListener("selectstart", prevent)

      return () => {
        element?.removeEventListener("contextmenu", prevent)
        element?.removeEventListener("copy", prevent)
        element?.removeEventListener("cut", prevent)
        element?.removeEventListener("selectstart", prevent)
      }
    }
  }, [viewerRef, latestManual])

  const isPDF = (fileName: string) => fileName.toLowerCase().endsWith(".pdf")

  useEffect(() => {
    if (openManual && isPDF(openManual.fileName)) {
      setManualLoading(true)
      setManualError(null)

      // Try to get the manual ID for backend route
      const manual = manuals.find(m => m.fileUrl === openManual.fileUrl) || latestManual
      
      if (manual && manual._id) {
        // Use the protected backend route to fetch the PDF as blob
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manuals/view/${manual._id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
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
            setManualError("Failed to load file")
          })
          .finally(() => setManualLoading(false))
      } else {
        setManualError("Manual not found")
        setManualLoading(false)
      }

      return () => {
        if (manualBlobUrl && manualBlobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(manualBlobUrl)
        }
        setManualBlobUrl(null)
      }
    }
  }, [openManual, manuals, latestManual, token])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!isSuperAdmin && !isClubAdmin) return null

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59 130 246) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="max-w-6xl mx-auto p-6 relative z-10">

        {/* Loading State */}
        {loading && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Loading trainer manuals...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border-red-200 shadow-lg rounded-2xl mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && (
          <>
            {/* Super Admin Upload Section */}
            {isSuperAdmin && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl mb-8 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Upload className="w-7 h-7 text-blue-600" />
                    Upload New Manual Version
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Drag and Drop Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : file
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />

                    <div className="space-y-4">
                      {file ? (
                        <>
                          <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                          <div>
                            <p className="text-lg font-semibold text-green-800">{file.name}</p>
                            <p className="text-sm text-green-600">{formatFileSize(file.size)}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-lg font-semibold text-gray-700">
                              Drop your manual here or click to browse
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Supports PDF, DOC, and DOCX files up to 50MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Upload Actions */}
                  {file && (
                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1 py-3 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mr-2" />
                            Upload Manual
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setFile(null)}
                        variant="outline"
                        className="px-6 py-3 rounded-xl"
                        disabled={uploading}
                      >
                        <X className="w-5 h-5 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Super Admin Version History */}
            {isSuperAdmin && manuals.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl mb-8 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Clock className="w-7 h-7 text-purple-600" />
                    Version History
                    <Badge variant="outline" className="ml-auto">
                      {manuals.length} versions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {manuals.map((manual, index) => (
                      <div key={manual._id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <Badge
                                  variant="secondary"
                                  className={`font-mono text-xs ${
                                    index === 0 ? "bg-green-100 text-green-800 border-green-200" : ""
                                  }`}
                                >
                                  v{manual.version}
                                </Badge>
                                {index === 0 && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Latest</Badge>
                                )}
                              </div>
                              <p className="font-semibold text-gray-900 truncate">{manual.fileName}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(manual.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isPDF(manual.fileName) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpenManual({ fileUrl: manual.fileUrl, fileName: manual.fileName })}
                                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 bg-transparent"
                              >
                                <a href={manual.fileUrl} download>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(manual._id)}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Club Admin Secure Viewer */}
            {isClubAdmin && latestManual && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Shield className="w-7 h-7 text-green-600" />
                    Secure Manual Viewer
                    <Badge className="bg-green-100 text-green-800 border-green-200 ml-auto">
                      <Lock className="w-3 h-3 mr-1" />
                      Protected
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <p className="text-amber-800 text-sm">
                        <strong>Security Notice:</strong> This manual is protected against copying, downloading, and
                        printing. Content is for viewing only.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Button
                      onClick={() => setOpenManual({ fileUrl: latestManual.fileUrl, fileName: latestManual.fileName })}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Manual in Full Screen
                    </Button>
                  </div>

                  <div
                    ref={viewerRef}
                    className="relative border-2 border-gray-200 rounded-2xl overflow-hidden shadow-inner bg-gray-50"
                    style={{ minHeight: 600 }}
                  >
                    <iframe
                      src={latestManual.fileUrl}
                      style={PDF_VIEWER_STYLE}
                      title="Trainer Manual"
                      sandbox="allow-scripts allow-same-origin"
                      className="rounded-2xl"
                    />
                    {/* Security overlay */}
                    <div
                      className="absolute inset-0 z-10 pointer-events-none"
                      style={{ background: "transparent" }}
                      onContextMenu={(e) => e.preventDefault()}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Manual Available State */}
            {isClubAdmin && !latestManual && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Manual Available</h3>
                  <p className="text-gray-600">
                    No trainer manual has been uploaded yet. Please contact your administrator.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Super Admin No Manuals State */}
            {isSuperAdmin && manuals.length === 0 && !loading && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Manuals Uploaded</h3>
                  <p className="text-gray-600 mb-6">
                    Get started by uploading your first trainer manual using the upload area above.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Enhanced Modal for viewing manual */}
        {openManual && (
          <Dialog open={!!openManual} onOpenChange={() => setOpenManual(null)}>
            <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-white rounded-2xl overflow-hidden flex flex-col">
              <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex-shrink-0">
                <DialogTitle className="text-xl font-bold flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  {openManual.fileName}
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-hidden bg-gray-50">
                <div className="h-full flex items-center justify-center p-6">
                  {isPDF(openManual.fileName) ? (
                    manualLoading ? (
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-lg text-gray-600">Loading PDF...</p>
                      </div>
                    ) : manualError ? (
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-lg text-red-600">{manualError}</p>
                      </div>
                    ) : manualBlobUrl ? (
                      <iframe
                        src={manualBlobUrl}
                        title={openManual.fileName}
                        className="w-full h-full border-0 rounded-lg shadow-lg"
                        allowFullScreen
                      />
                    ) : null
                  ) : (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 mb-4">Only PDF preview is supported.</p>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <a href={openManual.fileUrl} download>
                          <Download className="w-4 h-4 mr-2" />
                          Download file
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}

export default TrainerManualZone