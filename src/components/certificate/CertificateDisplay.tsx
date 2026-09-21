"use client";

import React, { useRef } from "react";
import {
  SafetyCertificateFilled,
  DownloadOutlined,
  PrinterOutlined,
  CopyOutlined,
  CheckCircleFilled,
  ShareAltOutlined,
} from "@ant-design/icons";
import { Tooltip, message } from "antd";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  certificateCode: string;
  issuedDate?: string;
  instructorName?: string;
  grade?: string;
  organisationName?: string;
}

interface CertificateDisplayProps {
  data: CertificateData;
  onClose?: () => void;
  showActions?: boolean;
}

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({
  data,
  onClose,
  showActions = true,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const formattedDate = data.issuedDate
    ? new Date(data.issuedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.certificateCode || "LMS-CERT-VERIFIED");
    message.success("Certificate verification code copied!");
  };

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/certificate/verify/${encodeURIComponent(data.certificateCode || "LMS-CERT-VERIFIED")}`;
    navigator.clipboard.writeText(url);
    message.success("Certificate verification link copied to clipboard!");
  };

  const handlePrintOrDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const verificationUrl = `/certificate/verify/${encodeURIComponent(data.certificateCode || "LMS-CERT-VERIFIED")}`;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Printable Certificate Frame */}
      <div
        ref={certificateRef}
        className="certificate-print-area relative w-full max-w-[840px] aspect-[1.414/1] bg-[#FCFDFE] rounded-2xl shadow-xl border-8 border-slate-900 p-6 md:p-10 flex flex-col justify-between overflow-hidden text-center select-none"
        style={{
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Inner Gold Inset Border */}
        <div className="absolute inset-3 border-2 border-[#D4AF37] rounded-xl pointer-events-none" />
        <div className="absolute inset-4 border border-[#D4AF37]/50 rounded-lg pointer-events-none" />

        {/* Ornamental Corner Accents */}
        <div className="absolute top-5 left-5 w-8 h-8 border-t-4 border-l-4 border-[#D4AF37] pointer-events-none" />
        <div className="absolute top-5 right-5 w-8 h-8 border-t-4 border-r-4 border-[#D4AF37] pointer-events-none" />
        <div className="absolute bottom-5 left-5 w-8 h-8 border-b-4 border-l-4 border-[#D4AF37] pointer-events-none" />
        <div className="absolute bottom-5 right-5 w-8 h-8 border-b-4 border-r-4 border-[#D4AF37] pointer-events-none" />

        {/* Subtle Watermark Seal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <SafetyCertificateFilled style={{ fontSize: 380 }} />
        </div>

        {/* Top Header & Insignia */}
        <div className="relative z-10 flex flex-col items-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-[#D4AF37] text-[11px] font-bold tracking-widest uppercase mb-2 shadow-xs">
            <SafetyCertificateFilled className="text-sm" />
            <span>{data.organisationName || "Online Learning Academy"}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-wider text-slate-900 uppercase mt-1">
            Certificate of Achievement
          </h1>
          <p className="text-xs md:text-sm font-medium tracking-widest text-[#D4AF37] uppercase mt-0.5">
            Verified Academic & Professional Credential
          </p>
        </div>

        {/* Center Presentation Body */}
        <div className="relative z-10 my-auto py-2 flex flex-col items-center">
          <p className="text-xs md:text-sm text-slate-500 font-serif italic mb-2">
            This certifies that
          </p>

          <div className="border-b-2 border-[#D4AF37] px-8 py-1 mb-3">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 tracking-wide capitalize">
              {data.studentName || "Student"}
            </h2>
          </div>

          <p className="text-xs md:text-sm text-slate-600 max-w-xl leading-relaxed">
            has successfully fulfilled all curriculum requirements, evaluations, and coursework mastery for
          </p>

          <h3 className="text-lg md:text-xl font-bold text-blue-950 mt-1.5 px-4 line-clamp-2">
            {data.courseTitle || "Professional Certification"}
          </h3>

          {data.grade && (
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Graduation Grade: {data.grade}
            </span>
          )}
        </div>

        {/* Bottom Signatures & Seal Section */}
        <div className="relative z-10 grid grid-cols-3 items-end pt-4 border-t border-slate-200/80 px-4">
          {/* Left: Instructor Signature */}
          <div className="flex flex-col items-center text-center">
            <div className="font-serif italic text-lg text-slate-800 font-bold border-b border-slate-400 pb-0.5 w-36 text-center">
              {data.instructorName || "Lead Instructor"}
            </div>
            <span className="text-[11px] font-bold text-slate-700 mt-1 uppercase tracking-wider">
              {data.instructorName || "Instructor"}
            </span>
            <span className="text-[10px] text-slate-400">Course Director</span>
          </div>

          {/* Center: Gold Embossed Seal */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#B38728] via-[#FBF5B7] to-[#DAA520] p-1 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full border border-amber-900/30 flex flex-col items-center justify-center text-amber-950 p-1 text-center bg-gradient-to-b from-[#F3E5AB] to-[#DAA520]">
                <CheckCircleFilled className="text-xs md:text-sm text-amber-900 mb-0.5" />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter leading-none">
                  Verified
                </span>
                <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-widest text-amber-900/80 leading-none mt-0.5">
                  Official
                </span>
              </div>
            </div>
          </div>

          {/* Right: Issuance Date & Verification */}
          <div className="flex flex-col items-center text-center">
            <div className="border-b border-slate-400 pb-0.5 w-36 text-center text-xs font-semibold text-slate-800">
              {formattedDate}
            </div>
            <span className="text-[11px] font-bold text-slate-700 mt-1 uppercase tracking-wider">
              Date of Issue
            </span>
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-blue-600 hover:underline truncate max-w-[130px] inline-block"
              title="Click to verify this certificate online"
            >
              ID: {data.certificateCode || "LMS-VERIFIED"}
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Tooltip title="Copy public verification link">
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ShareAltOutlined />
              <span>Copy Verification Link</span>
            </button>
          </Tooltip>

          <Tooltip title="Copy certificate code">
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CopyOutlined />
              <span>Copy Code</span>
            </button>
          </Tooltip>

          <button
            type="button"
            onClick={handlePrintOrDownload}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <PrinterOutlined />
            <span>Print / Save PDF</span>
          </button>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-print-area,
          .certificate-print-area * {
            visibility: visible;
          }
          .certificate-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 2cm;
            box-shadow: none !important;
            border: 8px solid #0f172a !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateDisplay;
