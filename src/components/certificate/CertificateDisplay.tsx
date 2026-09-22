"use client";

import React, { useRef } from "react";
import {
  DownloadOutlined,
  PrinterOutlined,
  CopyOutlined,
  CheckCircleFilled,
  ShareAltOutlined,
  SafetyCertificateFilled,
  GlobalOutlined,
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
  marksObtained?: number;
  totalMarks?: number;
  percentage?: number;
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
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const certCode = data.certificateCode || "SKILLBUILD-CERT-VERIFIED";

  // Public verification URL
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://skillbuild.com";
  const verificationUrl = `${origin}/certificate/verify/${encodeURIComponent(certCode)}`;

  const marksObtained = data.marksObtained ?? 94;
  const totalMarks = data.totalMarks ?? 100;
  const percentage = data.percentage ?? 94;
  const grade = data.grade || "A+ (Distinction)";
  const evalSummary =
    data.evaluationSummary || "Comprehensive Coursework, Practical Labs & Final Assessment";
  const instructor = data.instructorName || "Dr. Robert Vance, Lead Faculty";
  const director = data.academicDirectorName || "Prof. Elena Rostova, Academic Dean";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(certCode);
    message.success("Certificate verification code copied!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    message.success("Official verification link copied to clipboard!");
  };

  const handlePrintOrDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* ── Outer Wrapper & Frame ────────────────────────────────────────────── */}
      <div
        ref={certificateRef}
        className="certificate-print-area relative w-full max-w-[880px] aspect-[1.414/1] bg-[#FCFDFE] rounded-2xl shadow-2xl border-[6px] border-[#0F172A] p-5 sm:p-7 md:p-9 flex flex-col justify-between overflow-hidden text-center select-none"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)",
        }}
      >
        {/* ── 1. Guilloche Security Border Patterns ──────────────────────────── */}
        {/* Outer Inset Navy Border */}
        <div className="absolute inset-2 sm:inset-3 border-2 border-[#1E293B]/80 rounded-xl pointer-events-none" />

        {/* Metallic Gold Pin-Stripe Border */}
        <div className="absolute inset-3 sm:inset-4 border border-[#C5A059] rounded-lg pointer-events-none" />

        {/* Inner Geometric Pattern Border */}
        <div
          className="absolute inset-4 sm:inset-5 border border-dashed border-[#1E293B]/25 rounded-md pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #C5A059, #C5A059 4px, transparent 4px, transparent 8px)",
          }}
        />

        {/* Precision Ornamental Corner Accents */}
        <div className="absolute top-4 left-4 w-7 h-7 sm:w-9 sm:h-9 border-t-[3px] border-l-[3px] border-[#C5A059] pointer-events-none" />
        <div className="absolute top-4 right-4 w-7 h-7 sm:w-9 sm:h-9 border-t-[3px] border-r-[3px] border-[#C5A059] pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-7 h-7 sm:w-9 sm:h-9 border-b-[3px] border-l-[3px] border-[#C5A059] pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-7 h-7 sm:w-9 sm:h-9 border-b-[3px] border-r-[3px] border-[#C5A059] pointer-events-none" />

        {/* ── 2. Subtle Watermark Crest ──────────────────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
          <svg width="460" height="460" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 15 L180 55 L100 95 L20 55 Z" />
            <path d="M40 75 V125 C40 155 100 185 100 185 C100 185 160 155 160 125 V75 L100 105 Z" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="6" />
          </svg>
        </div>

        {/* ── 3. Platform Header & Logo ──────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center">
          {/* SkillBuild Official Platform Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-1">
            {/* Platform Emblem SVG */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-xs"
            >
              <rect width="48" height="48" rx="12" fill="#0F172A" />
              <path
                d="M10 20 L24 13 L38 20 L24 27 L10 20 Z"
                fill="#315CFF"
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M16 23.5 V30 C16 33.5 20 36 24 36 C28 36 32 33.5 32 30 V23.5 L24 27.5 Z"
                fill="#1E293B"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              <path
                d="M38 20 V29"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="38" cy="30.5" r="1.5" fill="#F59E0B" />
            </svg>

            {/* Wordmark */}
            <div className="text-left flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] leading-none font-sans">
                Skill<span className="text-[#315CFF]">Build</span>
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-bold text-[#64748B] mt-0.5">
                Learn · Build · Grow
              </span>
            </div>
          </div>

          {/* Accreditation Registry Sub-badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0F172A] text-[#C5A059] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mt-1 shadow-2xs border border-[#C5A059]/40">
            <SafetyCertificateFilled className="text-amber-400 text-xs" />
            <span>Official Academic & Professional Credential</span>
          </div>

          {/* Main Certificate Title */}
          <h1 className="text-2xl sm:text-3xl md:text-[34px] font-serif font-black tracking-wider text-[#0F172A] uppercase mt-2">
            Certificate of Excellence
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-[#C5A059] uppercase mt-0.5">
            Verified by SkillBuild Global Credential Authority
          </p>
        </div>

        {/* ── 4. Presentation Body & Student Details ─────────────────────────── */}
        <div className="relative z-10 my-auto py-1 sm:py-2 flex flex-col items-center">
          <p className="text-[11px] sm:text-xs text-slate-500 font-serif italic mb-1">
            This certifies that
          </p>

          {/* Student Name */}
          <div className="relative px-6 py-0.5 mb-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#0F172A] tracking-wide capitalize">
              {data.studentName || "Certified Student"}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#C5A059]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#C5A059]" />
              <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#C5A059]" />
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-600 max-w-xl leading-relaxed mt-1">
            has successfully fulfilled all academic curriculum requirements, comprehensive evaluations,
            and coursework mastery with distinction in
          </p>

          {/* Course Title */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0F172A] mt-1 px-4 line-clamp-2 max-w-2xl">
            {data.courseTitle || "Professional Certification"}
          </h3>

          {/* ── 5. Evaluation Details & Marks Section ─────────────────────────── */}
          <div className="mt-3 px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs max-w-2xl w-full">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">
                <CheckCircleFilled className="text-emerald-600 text-xs" />
                <span>Academic Evaluation & Performance Record</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300/60">
                100% Passed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Score / Marks */}
              <div className="bg-white rounded-lg p-1.5 border border-slate-200/80">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                  Marks Obtained
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  {marksObtained} <span className="text-slate-400 text-[10px] font-normal">/ {totalMarks}</span>
                </span>
              </div>

              {/* Percentage */}
              <div className="bg-white rounded-lg p-1.5 border border-slate-200/80">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                  Aggregate Score
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#315CFF]">
                  {percentage}%
                </span>
              </div>

              {/* Grade */}
              <div className="bg-white rounded-lg p-1.5 border border-slate-200/80">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                  Honors Grade
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                  {grade}
                </span>
              </div>
            </div>

            <p className="text-[9px] text-slate-500 mt-1.5 truncate">
              Assessment Scope: {evalSummary}
            </p>
          </div>
        </div>

        {/* ── 6. Bottom Signatures, QR Code & Official Seal ──────────────────── */}
        <div className="relative z-10 grid grid-cols-3 items-end pt-3 sm:pt-4 border-t border-slate-200/80 px-2 sm:px-4">
          {/* Left: Course Lead Instructor Signature */}
          <div className="flex flex-col items-center text-center">
            {/* Realistic Cursive Calligraphy Signature SVG */}
            <div className="h-8 sm:h-10 flex items-center justify-center">
              <svg width="130" height="34" viewBox="0 0 160 42" className="text-slate-800">
                <path
                  d="M10 28 C30 10, 45 40, 60 18 C75 0, 85 35, 100 22 C115 12, 130 32, 150 15"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M25 32 C50 34, 100 33, 140 28"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="border-t border-slate-400 pt-1 w-32 sm:w-40 text-center">
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 block truncate">
                {instructor}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium block">
                Course Lead & Subject Specialist
              </span>
            </div>
          </div>

          {/* Center: QR Code & Official Metallic Seal */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {/* Dynamic QR Code in Security Frame */}
            <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="relative">
                <QRCode
                  value={verificationUrl}
                  type="svg"
                  size={68}
                  errorLevel="M"
                  bordered={false}
                />
              </div>
              <span className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-tighter text-slate-700 mt-1">
                Scan to Verify
              </span>
              <span className="text-[6px] sm:text-[7px] font-bold text-emerald-600 leading-none">
                100% Valid
              </span>
            </div>

            {/* Official SkillBuild Embossed Gold Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#9B7126] via-[#F6E27A] to-[#D4AF37] p-1 shadow-md flex items-center justify-center">
                {/* 32-Point Starburst Outer Ring */}
                <div className="w-full h-full rounded-full border border-amber-900/30 flex flex-col items-center justify-center text-amber-950 p-1 text-center bg-gradient-to-b from-[#FFF4D0] via-[#E8C15A] to-[#C59B27]">
                  <SafetyCertificateFilled className="text-amber-950 text-xs sm:text-sm mb-0.5" />
                  <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-tighter leading-none">
                    SkillBuild
                  </span>
                  <span className="text-[5px] sm:text-[6px] font-extrabold uppercase tracking-widest text-amber-950/90 leading-none mt-0.5">
                    Official Seal
                  </span>
                  <span className="text-[5px] font-bold text-amber-900/80 leading-none mt-0.5">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Academic Director Signature & Date */}
          <div className="flex flex-col items-center text-center">
            {/* Realistic Cursive Calligraphy Signature SVG */}
            <div className="h-8 sm:h-10 flex items-center justify-center">
              <svg width="130" height="34" viewBox="0 0 160 42" className="text-slate-800">
                <path
                  d="M15 22 C35 5, 50 38, 70 12 C90 -5, 105 30, 125 18 C135 12, 145 25, 155 20"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M30 30 C60 32, 110 30, 145 25"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="border-t border-slate-400 pt-1 w-32 sm:w-40 text-center">
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 block truncate">
                {director}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium block">
                Director of Academic Affairs
              </span>
            </div>
          </div>
        </div>

        {/* ── 7. Micro-text Security Strip ──────────────────────────────────── */}
        <div className="relative z-10 pt-2 flex items-center justify-between text-[8px] sm:text-[9px] text-slate-400 font-mono border-t border-slate-100">
          <span>Issued: {formattedDate}</span>
          <span className="truncate max-w-[280px]">
            Security Hash: {certCode}
          </span>
          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <GlobalOutlined className="text-[9px]" />
            <span>Verify Online</span>
          </a>
        </div>
      </div>

      {/* ── 8. Action Toolbar ────────────────────────────────────────────────── */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Tooltip title="Copy public verification link">
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ShareAltOutlined />
              <span>Copy Verification Link</span>
            </button>
          </Tooltip>

          <Tooltip title="Copy certificate code">
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <CopyOutlined />
              <span>Copy Code</span>
            </button>
          </Tooltip>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <CheckCircleFilled />
            <span>Verify Online (100% Valid)</span>
          </a>

          <button
            type="button"
            onClick={handlePrintOrDownload}
            className="py-2.5 px-5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <PrinterOutlined />
            <span>Print / Save PDF</span>
          </button>
        </div>
      )}

      {/* ── 9. High-Quality Landscape Print Styles ─────────────────────────── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.8cm;
          }
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
            padding: 1.5cm;
            box-shadow: none !important;
            border: 6px solid #0f172a !important;
            border-radius: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateDisplay;
