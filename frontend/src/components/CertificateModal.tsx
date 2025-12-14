import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  agentName?: string;
  completionDate?: string;
  loading?: boolean;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ open, onOpenChange, studentName, agentName, completionDate, loading }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('certificate.pdf');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-white rounded-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 md:p-6">
          <DialogTitle className="text-xl md:text-2xl font-bold text-center flex items-center justify-center gap-2 md:gap-3">
            <Award className="w-6 h-6 md:w-8 md:h-8" />
            AI Prompting Mastery Certificate
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 p-4 md:p-8 bg-gray-100 overflow-y-auto max-h-[calc(95vh-200px)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse delay-300"></div>
              </div>
              <p className="text-gray-600 text-lg">Preparing your certificate...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 md:p-8 bg-gray-100 overflow-y-auto max-h-[calc(95vh-200px)]">
            <div
              ref={certificateRef}
              className="mx-auto bg-white rounded-xl border-8 border-yellow-400 shadow-lg relative"
              style={{ maxWidth: 900, minHeight: 600, fontFamily: 'Georgia, Times New Roman, Times, serif', padding: 48 }}
            >
              {/* ...existing certificate content... */}
              {/* Watermark logo */}
              <img src="/logo.png" alt="Watermark" className="absolute opacity-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 object-contain pointer-events-none select-none" style={{ zIndex: 0 }} />

              {/* Certificate Heading */}
              <div className="text-center mb-8 relative z-10">
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide mb-2" style={{ letterSpacing: '0.04em' }}>
                  Certificate of Achievement
                </h1>
                <div className="w-32 h-1 mx-auto rounded-full mb-2" />
                <p className="text-lg text-blue-700 font-semibold mb-2">AI Training Completion | Verified Skill Badge</p>
                <p className="text-lg text-gray-600 font-medium">This is to certify that</p>
              </div>

              {/* Student Name */}
              <div className="text-center mb-6 relative z-10">
                <span className="text-3xl font-bold text-blue-800" style={{ letterSpacing: '0.03em' }}>
                  {studentName || '[Learner Name]'}
                </span>
              </div>

              {/* Completion Statement */}
              <div className="text-center mb-4 relative z-10">
                <span className="text-lg text-gray-700">has successfully completed</span>
              </div>

              {/* Program Name */}
              <div className="text-center mb-8 relative z-10">
                <span className="text-2xl font-bold text-purple-700" style={{ letterSpacing: '0.02em' }}>
                  AI Prompting Mastery Program
                </span>
              </div>

              {/* Description */}
              <div className="text-center mb-8 relative z-10">
                <span className="text-base text-gray-600">
                  Demonstrating proficiency in AI agent interaction and application mastery
                </span>
              </div>

              {/* Agent Name */}
              {agentName && (
                <div className="text-center mb-10 relative z-10 flex items-center justify-center gap-2">
                  <span className="text-base font-semibold text-gray-700">
                    Prompts completed for:
                  </span>
                  <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-400 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                    {agentName}
                  </span>
                </div>
              )}

              {/* Date and Signature Row */}
              <div className="flex flex-row justify-between items-end mt-16 mb-2 relative z-10">
                <div className="flex flex-col items-center w-1/3">
                  <span className="text-lg font-semibold text-gray-800">
                    {completionDate ? new Date(completionDate).toLocaleDateString() : '[Date]'}
                  </span>
                  <div className="w-32 h-0.5 bg-gray-400 mb-2 mt-1" />
                  <p className="text-xs md:text-sm text-gray-500 text-center">Completion Date</p>
                </div>
                <div className="flex flex-col items-center w-1/3">
                  <img src="/logo.png" alt="TrainingX.AI Logo" className="h-12 w-auto mb-2" />
                  <span className="text-xs text-gray-500">TrainingX.AI</span>
                </div>
                <div className="flex flex-col items-center w-1/3">
                  <span className="font-semibold text-lg text-gray-800">Derrick O'Neal</span>
                  <div className="w-32 h-0.5 bg-gray-400 mb-2 mt-1" />
                  <p className="text-xs md:text-sm text-gray-500 text-center">Instructor Signature</p>
                </div>
              </div>
              {/* ORCID credibility line at the bottom */}
              <div className="w-full flex justify-center mt-8">
                <span className="text-xs text-gray-500 italic text-center">Instructor is ORCID verified and published in AI education research.</span>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Download Certificate
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6 bg-gray-50 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs md:text-sm text-gray-600 text-center md:text-left">
            <strong>Note:</strong> This is a preview. Certificates will be awarded for completing AI agent sessions and
            app mastery.
          </p>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <X className="w-4 h-4" />
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal; 