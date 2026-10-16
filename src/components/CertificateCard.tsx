"use client";

import React, { useState } from "react";
import { DownloadIcon } from "@/utils/icons";
import { Modal } from "antd";
import { CertificateDisplay } from "./certificate/CertificateDisplay";
import { SafetyCertificateFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface CertificateCardProps {
  title?: string;
  code?: string;
  studentName?: string;
  issuedDate?: string;
  marksObtained?: number | null;
  totalMarks?: number | null;
  percentage?: number | null;
  grade?: string;
  instructorName?: string;
}

const CertificateCard = ({
  title = "Certificate of Course Completion",
  code = "",
  studentName,
  issuedDate,
  marksObtained,
  totalMarks,
  percentage,
  grade = "Completed",
  instructorName,
}: CertificateCardProps) => {
  const [openModal, setOpenModal] = useState(false);
  const currentUserName =
    useSelector((s: RootState) => s.userdata?.full_name) ||
    useSelector((s: RootState) => s.userdata?.first_name) ||
    "Student";

  const certData = {
    studentName: studentName || currentUserName,
    courseTitle: title,
    certificateCode: code,
    issuedDate: issuedDate || new Date().toISOString(),
    marksObtained,
    totalMarks,
    percentage,
    grade,
    instructorName,
  };

  return (
    <>
      <div
        onClick={() => setOpenModal(true)}
        className="group bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
      >
        {/* Decorative Certificate Miniature */}
        <div className="w-full h-44 rounded-xl bg-[#f6f1e7] p-2 border border-[#16324f]">
          <div className="h-full border border-[#b8956a] px-3 py-2 flex flex-col items-center justify-center text-center text-[#16324f]">
            <span className="text-[9px] uppercase tracking-[0.22em] text-[#8a6a3b] font-semibold">
              Certificate of completion
            </span>
            <h4 className="text-sm font-semibold line-clamp-2 mt-1">{title}</h4>
            <span className="text-[11px] font-serif italic mt-1 text-[#5c6b7a]">
              {certData.studentName}
            </span>
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#1f7a4d]">
              <SafetyCertificateFilled /> Verified
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-slate-900 truncate">{title}</h4>
            <p className="text-[11px] text-slate-500 font-mono truncate">{code}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenModal(true);
            }}
            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <DownloadIcon />
          </button>
        </div>
      </div>

      {/* Full Certificate Modal */}
      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        width={980}
        centered
        destroyOnClose
        className="certificate-modal"
      >
        <div className="py-2">
          <CertificateDisplay data={certData} onClose={() => setOpenModal(false)} />
        </div>
      </Modal>
    </>
  );
};

export default CertificateCard;
