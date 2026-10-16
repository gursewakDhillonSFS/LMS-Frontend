"use client";

import React, { useRef } from "react";
import {
  DownloadOutlined,
  PrinterOutlined,
  CopyOutlined,
  CheckCircleFilled,
  ShareAltOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import { Tooltip, message, QRCode } from "antd";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  certificateCode: string;
  issuedDate?: string;
  instructorName?: string;
  academicDirectorName?: string;
  grade?: string;
  marksObtained?: number | null;
  totalMarks?: number | null;
  percentage?: number | null;
  evaluationSummary?: string;
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
    : "";

  const certCode = data.certificateCode || "";
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";
  const verificationUrl = certCode
    ? `${origin}/certificate/verify/${encodeURIComponent(certCode)}`
    : "";

  const hasScore =
    data.marksObtained != null &&
    data.totalMarks != null &&
    Number(data.totalMarks) > 0;
  const instructor =
    data.instructorName && !/^[a-f0-9]{24}$/i.test(data.instructorName)
      ? data.instructorName
      : "Course Instructor";

  const handleCopyCode = () => {
    if (!certCode) return;
    navigator.clipboard.writeText(certCode);
    message.success("Certificate verification code copied!");
  };

  const handleCopyLink = () => {
    if (!verificationUrl) return;
    navigator.clipboard.writeText(verificationUrl);
    message.success("Verification link copied.");
  };

  const handlePrintOrDownload = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .certificate-print-area, .certificate-print-area * { visibility: visible; }
          .certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div
        ref={certificateRef}
        className="certificate-print-area w-full max-w-[920px] bg-[#f6f1e7] text-[#1b2838] shadow-lg"
      >
        <div className="border-[12px] border-[#16324f] p-1.5 sm:p-2">
          <div className="border border-[#b8956a] px-4 py-6 sm:px-10 sm:py-8 flex flex-col items-center text-center gap-4 min-h-[460px]">
            <div className="flex items-center gap-2 text-[#16324f]">
              <SafetyCertificateFilled />
              <span className="text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase">
                {data.organisationName || "SkillBuild"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-[11px] sm:text-xs tracking-[0.35em] uppercase text-[#8a6a3b]">
                Certificate of completion
              </p>
              <div className="h-px w-16 bg-[#b8956a]" />
            </div>

            <p className="text-sm text-[#5c6b7a]">This is to certify that</p>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#16324f] leading-tight">
              {data.studentName || "Student"}
            </h2>
            <p className="text-sm text-[#5c6b7a] max-w-xl">
              has successfully completed the course
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#16324f] max-w-2xl">
              {data.courseTitle || "Course"}
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[#5c6b7a]">
              {formattedDate && <span>Issued {formattedDate}</span>}
              {hasScore && (
                <span>
                  Score {data.marksObtained}/{data.totalMarks}
                  {data.percentage != null ? ` · ${data.percentage}%` : ""}
                </span>
              )}
              {data.grade && data.grade !== "Completed" && <span>{data.grade}</span>}
            </div>
            {data.evaluationSummary && (
              <p className="text-xs text-[#7b8794] max-w-lg">{data.evaluationSummary}</p>
            )}

            <div className="mt-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-6">
              <div className="flex flex-col items-center sm:items-start gap-1">
                <p className="font-serif text-lg text-[#16324f] border-b border-[#16324f]/30 pb-1 min-w-[140px]">
                  {instructor}
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a6a3b]">Instructor</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 rounded-full border-2 border-[#b8956a] flex items-center justify-center text-[#16324f]">
                  <SafetyCertificateFilled className="text-2xl" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#1f7a4d]">
                  <CheckCircleFilled /> Verified credential
                </span>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-1">
                {verificationUrl ? (
                  <QRCode value={verificationUrl} size={72} bordered={false} />
                ) : null}
                <p className="text-[11px] font-mono text-[#16324f] break-all">{certCode}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a6a3b]">Credential ID</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handlePrintOrDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#315CFF] text-white text-xs font-semibold"
          >
            <PrinterOutlined />
            <DownloadOutlined />
            Print / Save PDF
          </button>
          <Tooltip title="Copy credential ID">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <CopyOutlined /> Copy ID
            </button>
          </Tooltip>
          <Tooltip title="Copy verification link">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <ShareAltOutlined /> Share
            </button>
          </Tooltip>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateDisplay;
