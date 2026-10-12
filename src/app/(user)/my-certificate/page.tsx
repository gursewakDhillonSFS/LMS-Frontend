"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SafetyCertificateFilled,
  DownloadOutlined,
  ShareAltOutlined,
  CopyOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Modal, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

import { getMyCertificatesApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import { RoutePaths } from "@/utils/enums";
import CertificateDisplay from "@/components/certificate/CertificateDisplay";

interface CertItem {
  certificate_id: string;
  course_name: string;
  certificate_code: string;
  issued_at: string;
  instructor_name?: string;
  grade?: string;
  marks_obtained?: number | null;
  total_marks?: number | null;
  percentage?: number | null;
  evaluation_summary?: string;
}

const MyCertificate = () => {
  const router = useRouter();
  const currentUserName =
    useSelector((s: RootState) => s.userdata?.full_name) ||
    useSelector((s: RootState) => s.userdata?.first_name) ||
    "Student";
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewCert, setPreviewCert] = useState<CertItem | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyCertificatesApi();
        if (res?.status && Array.isArray(res.data)) {
          setCerts(res.data);
        } else {
          setCerts([]);
        }
      } catch {
        setCerts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      toast.success("Certificate verification code copied!");
    }
  };

  const handleDownload = (certItem: CertItem) => {
    setPreviewCert(certItem);
    toast.success(`Opening certificate for ${certItem.course_name}. Use Print / Save PDF to download.`);
  };

  const handleShare = (courseName: string, code: string) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/verify-certificate/${code}` : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Verification link copied to clipboard!");
    }
  };

  const filteredCerts = useMemo(() => {
    if (!searchQuery.trim()) return certs;
    const q = searchQuery.toLowerCase();
    return certs.filter(
      (c) =>
        c.course_name.toLowerCase().includes(q) ||
        (c.certificate_code && c.certificate_code.toLowerCase().includes(q))
    );
  }, [certs, searchQuery]);

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto">
      {/* 1. Header & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#101828] via-[#1E293B] to-[#0F172A] text-white shadow-md relative overflow-hidden">
        {/* Subtle background decorative shapes */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-[#315CFF]/15 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/10">
            <TrophyOutlined className="text-amber-400" />
            <span>Tamper-proof verified academic credentials earned upon 100% course completion</span>
          </div>
        </div>

        {/* Quick Stats Widget */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[120px]">
            <span className="block text-2xl font-bold text-white leading-none mb-1">
              {certs.length}
            </span>
            <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">
              {certs.length === 1 ? "Certificate" : "Certificates"}
            </span>
          </div>

          <div className="px-5 py-3.5 rounded-2xl bg-emerald-500/15 backdrop-blur-md border border-emerald-500/30 text-center min-w-[120px]">
            <span className="flex items-center justify-center gap-1 text-xl font-bold text-emerald-400 leading-none mb-1">
              <CheckCircleOutlined className="text-base" />
              <span>Verified</span>
            </span>
            <span className="text-[11px] font-medium text-emerald-200 uppercase tracking-wider">
              Accredited
            </span>
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      {certs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-sm font-semibold text-[#101828]">
            Showing {filteredCerts.length} of {certs.length} {certs.length === 1 ? "certificate" : "certificates"}
          </div>

          <div className="relative w-full sm:w-72">
            <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course or ID..."
              className="w-full pl-9 pr-4 py-2 bg-white text-xs sm:text-sm rounded-xl border border-[#D0D5DD] focus:border-[#315CFF] focus:outline-hidden transition-all shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* 3. Certificate Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-[#E4E7EC] space-y-3 animate-pulse shadow-2xs"
            >
              <div className="w-full h-48 rounded-xl bg-slate-200" />
              <div className="h-5 w-3/4 rounded-md bg-slate-200" />
              <div className="h-4 w-1/2 rounded-md bg-slate-200" />
            </div>
          ))}
        </div>
      ) : filteredCerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => {
            const formattedDate = cert.issued_at
              ? new Date(cert.issued_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Verified Completion";

            return (
              <div
                key={cert.certificate_id}
                className="group rounded-2xl bg-white border border-[#E4E7EC] hover:border-[#315CFF]/40 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                {/* Certificate Preview Frame */}
                <div
                  onClick={() => setPreviewCert(cert)}
                  className="relative w-full h-52 bg-white cursor-pointer overflow-hidden flex items-center justify-center border-b border-slate-100"
                >
                  <div className="w-[88%] h-[78%] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col items-center justify-center text-center gap-1">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#315CFF] font-bold">
                      Certificate of Completion
                    </span>
                    <span className="text-sm font-serif text-slate-900 line-clamp-2">
                      {currentUserName}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-2">
                      {cert.course_name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {cert.certificate_code}
                    </span>
                  </div>
                  {/* Verified Badge Ribbon */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20 shadow-xs z-10">
                    <SafetyCertificateFilled className="text-emerald-400" />
                    <span>Verified</span>
                  </div>

                  {/* Hover Quick Preview Action */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-xl bg-white text-[#101828] text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-slate-100"
                    >
                      <EyeOutlined />
                      <span>Full Preview</span>
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-[#101828] group-hover:text-[#315CFF] transition-colors line-clamp-2">
                      {cert.course_name}
                    </h3>
                    <p className="text-xs text-[#667085] flex items-center gap-1">
                      <span>Issued:</span>
                      <span className="font-medium text-[#344054]">{formattedDate}</span>
                    </p>
                  </div>

                  {/* Credential Code Box */}
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#98A2B3] tracking-wider block">
                        Credential ID
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#101828] truncate block">
                        {cert.certificate_code || "LMS-CERT-VERIFIED"}
                      </span>
                    </div>

                    <Tooltip title="Copy Verification Code">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(cert.certificate_code || "LMS-CERT-VERIFIED")}
                        className="p-1.5 rounded-lg hover:bg-[#E4E7EC] text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
                      >
                        <CopyOutlined className="text-sm" />
                      </button>
                    </Tooltip>
                  </div>

                  {/* Action Toolbar */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F2F4F7]">
                    <button
                      type="button"
                      onClick={() => handleDownload(cert)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <DownloadOutlined />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(cert.course_name, cert.certificate_code)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShareAltOutlined />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E4E7EC] text-center shadow-xs flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#F0F4FF] text-[#315CFF] flex items-center justify-center text-3xl shadow-xs">
            <TrophyOutlined />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-[#101828]">No Certificates Yet</h3>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed max-w-md">
              Complete 100% of video lessons, score passing marks on batch quizzes, and finish required assignments in your enrolled courses to automatically unlock accredited certificates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC] text-left w-full space-y-2 text-xs text-[#475467]">
            <p className="font-bold text-[#101828]">How to earn your certificate:</p>
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-emerald-500 text-sm" />
              <span>Watch all video modules in the curriculum</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-emerald-500 text-sm" />
              <span>Pass quizzes and tests with 70%+ score</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-emerald-500 text-sm" />
              <span>Submit required milestone assignments</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(RoutePaths.MyExplore)}
            className="mt-2 px-6 py-3 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-sm font-semibold flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>Explore Courses to Get Certified</span>
            <ArrowRightOutlined />
          </button>
        </div>
      )}

      {/* 4. Fullscreen Certificate Preview Modal */}
      {previewCert && (
        <Modal
          open={!!previewCert}
          onCancel={() => setPreviewCert(null)}
          footer={null}
          centered
          width={880}
          className="rounded-2xl overflow-hidden"
          destroyOnClose
        >
          <div className="p-2">
            <CertificateDisplay
              data={{
                studentName: currentUserName,
                courseTitle: previewCert.course_name,
                certificateCode: previewCert.certificate_code,
                issuedDate: previewCert.issued_at,
                instructorName: previewCert.instructor_name,
                grade: previewCert.grade,
                marksObtained: previewCert.marks_obtained,
                totalMarks: previewCert.total_marks,
                percentage: previewCert.percentage,
                evaluationSummary: previewCert.evaluation_summary,
              }}
              onClose={() => setPreviewCert(null)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyCertificate;
