"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  SafetyCertificateFilled,
  CheckCircleFilled,
  CloseCircleFilled,
  SearchOutlined,
  CopyOutlined,
  ShareAltOutlined,
  HomeOutlined,
  TrophyOutlined,
  CalendarOutlined,
  UserOutlined,
  ReadOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { Skeleton, Input, message } from "antd";
import Link from "next/link";
import { verifyCertificateApi } from "@/services/collections";
import CertificateDisplay, { CertificateData } from "@/components/certificate/CertificateDisplay";

interface VerifiedCert {
  _id?: string;
  certificate_code: string;
  student_name: string;
  course_name: string;
  issued_at?: string;
  grade?: string;
  marks_obtained?: number;
  total_marks?: number;
  percentage?: number;
  instructor_name?: string;
  organisation_name?: string;
  evaluation_summary?: string;
  is_valid?: boolean;
  validity_status?: string;
  verified_by?: string;
  verified_at?: string;
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) || "";

  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<VerifiedCert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState("");

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setError("No certificate verification code provided.");
      return;
    }

    setLoading(true);
    setError(null);

    verifyCertificateApi(code)
      .then((res) => {
        if (res?.status && res?.data) {
          setCert(res.data);
        } else {
          setError("Certificate not found or invalid. Please verify the code.");
          setCert(null);
        }
      })
      .catch(() => {
        setError("Unable to verify certificate. Please check the credential code and try again.");
        setCert(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [code]);

  const handleSearchNewCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchCode.trim();
    if (!clean) {
      message.warning("Please enter a certificate code");
      return;
    }
    router.push(`/certificate/verify/${encodeURIComponent(clean)}`);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      message.success("Official verification link copied to clipboard!");
    }
  };

  const certData: CertificateData = {
    studentName: cert?.student_name || "Certified Student",
    courseTitle: cert?.course_name || "Course Completion",
    certificateCode: cert?.certificate_code || code,
    issuedDate: cert?.issued_at,
    instructorName: cert?.instructor_name || undefined,
    grade: cert?.grade || "Completed",
    marksObtained: cert?.marks_obtained ?? null,
    totalMarks: cert?.total_marks ?? null,
    percentage: cert?.percentage ?? null,
    evaluationSummary: cert?.evaluation_summary || undefined,
    organisationName: cert?.organisation_name || "SkillBuild LMS",
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-[#315CFF] flex items-center gap-1.5 transition-colors"
          >
            <HomeOutlined />
            <span>Return to SkillBuild Home</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <SafetyCertificateFilled className="text-emerald-500" />
            <span>Official Credential Verification Portal</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton.Avatar active size={56} shape="circle" />
              <div className="flex-1">
                <Skeleton active paragraph={{ rows: 1 }} />
              </div>
            </div>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-red-200 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-3xl mx-auto">
              <CloseCircleFilled />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Certificate Verification Failed
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {error} We could not verify the credential with ID:{" "}
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {code}
                </span>
              </p>
            </div>

            {/* Code Search Box */}
            <form
              onSubmit={handleSearchNewCode}
              className="max-w-md mx-auto flex items-center gap-2 pt-4"
            >
              <Input
                placeholder="Enter valid certificate ID (e.g. SKILLBUILD-XXXX)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="!py-2.5 !px-4 !rounded-xl !border-slate-300 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#315CFF] hover:bg-blue-700 text-white font-semibold text-sm transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <SearchOutlined />
                <span>Verify</span>
              </button>
            </form>
          </div>
        )}

        {/* Verified Success State */}
        {!loading && cert && (
          <div className="space-y-6">
            {/* 100% Verified Banner */}
            <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                  <SafetyCertificateFilled />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-900 text-xs font-extrabold uppercase tracking-wider mb-1.5 border border-emerald-500/30">
                    <CheckCircleFilled className="text-emerald-600 text-sm" />
                    <span>100% Valid & Authenticated Credential</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Official Certificate Verified
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-xl">
                    This certificate is genuine, tamper-evident, and was officially issued by{" "}
                    <strong className="text-slate-900 font-bold">SkillBuild Global Learning Authority</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <ShareAltOutlined />
                  <span>Share Verification</span>
                </button>
              </div>
            </div>

            {/* Evaluation & Credential Summary Cards */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrophyOutlined className="text-amber-500" />
                  <span>Student Evaluation & Academic Record</span>
                </h3>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Status: 100% Valid
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Marks Obtained */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Marks Obtained
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                    {certData.marksObtained}{" "}
                    <span className="text-xs font-normal text-slate-500">/ {certData.totalMarks}</span>
                  </span>
                </div>

                {/* Score Percentage */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Aggregate Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#315CFF] mt-0.5 block">
                    {certData.percentage}%
                  </span>
                </div>

                {/* Final Grade */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Graduation Grade
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 mt-0.5 block">
                    {certData.grade}
                  </span>
                </div>

                {/* Credential ID */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Credential ID
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 mt-1 block truncate">
                    {cert.certificate_code}
                  </span>
                </div>
              </div>

              {/* Student & Course Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <UserOutlined className="text-slate-400 text-base" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Student</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">{cert.student_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <ReadOutlined className="text-slate-400 text-base" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Course</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">{cert.course_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <CalendarOutlined className="text-slate-400 text-base" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Date Issued</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {cert.issued_at
                        ? new Date(cert.issued_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Verified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Certificate Visual Display */}
            <div className="bg-white rounded-3xl p-4 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm flex justify-center">
              <CertificateDisplay data={certData} showActions={true} />
            </div>

            {/* Search another code footer */}
            <div className="p-6 rounded-3xl bg-slate-100/80 border border-slate-200/70 text-center space-y-3">
              <h3 className="text-sm font-bold text-slate-800">
                Want to verify another certificate?
              </h3>
              <form
                onSubmit={handleSearchNewCode}
                className="max-w-md mx-auto flex items-center gap-2"
              >
                <Input
                  placeholder="Enter certificate ID (e.g. SKILLBUILD-XXXX)..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="!py-2 !px-3.5 !rounded-xl !border-slate-300 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <SearchOutlined />
                  <span>Verify</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
