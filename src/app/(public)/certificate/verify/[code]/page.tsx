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
  instructor_name?: string;
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
          setError("Certificate not found or invalid.");
          setCert(null);
        }
      })
      .catch(() => {
        setError("Unable to verify certificate. Please check the code and try again.");
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
      message.success("Verification link copied to clipboard!");
    }
  };

  const certData: CertificateData = {
    studentName: cert?.student_name || "Certified Student",
    courseTitle: cert?.course_name || "Course Completion",
    certificateCode: cert?.certificate_code || code,
    issuedDate: cert?.issued_at,
    instructorName: cert?.instructor_name || "Lead Instructor",
    grade: cert?.grade,
    organisationName: "SkillBuild Academy",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <HomeOutlined />
            <span>Return to Home</span>
          </Link>
          <div className="text-xs font-semibold text-slate-400">
            Official Credential Verification Service
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
                {error} We could not verify the certificate with ID:{" "}
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
                placeholder="Enter valid certificate ID (e.g. LMS-ABC123)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="!py-2.5 !px-4 !rounded-xl !border-slate-300 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
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
            {/* Verification Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                  <SafetyCertificateFilled />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 text-xs font-bold mb-1">
                    <CheckCircleFilled className="text-emerald-600 text-xs" />
                    <span>Verified Authentic Credential</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                    Official Certificate Verified
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    This certificate is genuine and was officially issued by SkillBuild LMS.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-4 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <ShareAltOutlined />
                  <span>Share Verification</span>
                </button>
              </div>
            </div>

            {/* Meta Details Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Student Name
                </span>
                <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
                  {cert.student_name}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Course Title
                </span>
                <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
                  {cert.course_name}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Date of Issue
                </span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {cert.issued_at
                    ? new Date(cert.issued_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Verified"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Credential ID
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-1 block truncate">
                  {cert.certificate_code}
                </span>
              </div>
            </div>

            {/* Official Certificate Visual Display */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs flex justify-center">
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
                  placeholder="Enter certificate ID..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="!py-2 !px-3.5 !rounded-xl !border-slate-300 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
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
