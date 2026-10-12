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
      <div
        ref={certificateRef}
        className="certificate-print-area relative w-full max-w-[880px] bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-10 flex flex-col gap-6 text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 text-[#315CFF]">
            <SafetyCertificateFilled />
            <span className="text-sm font-bold tracking-wide">SkillBuild</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Certificate of Completion
          </h1>
          <p className="text-xs text-slate-500">
            {data.organisationName || "SkillBuild LMS"}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-slate-500">This certifies that</p>
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900">
            {data.studentName || "Student"}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            has completed the course
          </p>
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
            {data.courseTitle || "Course"}
          </h3>
          {formattedDate && (
            <p className="text-sm text-slate-500">Issued on {formattedDate}</p>
          )}
        </div>

        {(hasScore || data.grade) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {hasScore && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Marks</p>
                <p className="text-lg font-bold text-slate-900">
                  {data.marksObtained}
                  <span className="text-sm font-medium text-slate-400"> / {data.totalMarks}</span>
                </p>
              </div>
            )}
            {data.percentage != null && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Score</p>
                <p className="text-lg font-bold text-[#315CFF]">{data.percentage}%</p>
              </div>
            )}
            {data.grade && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Result</p>
                <p className="text-lg font-bold text-emerald-700">{data.grade}</p>
              </div>
            )}
          </div>
        )}

        {data.evaluationSummary && (
          <p className="text-xs text-slate-500">{data.evaluationSummary}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2 border-t border-slate-100">
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">
              {data.instructorName || "Course instructor"}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Instructor</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            {verificationUrl ? (
              <QRCode value={verificationUrl} size={88} bordered={false} />
            ) : null}
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
              <CheckCircleFilled /> Verified credential
            </span>
          </div>

          <div className="text-right">
            <p className="text-xs font-mono text-slate-700 break-all">{certCode}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Credential ID</p>
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
