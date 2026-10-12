"use client";

import React, { useState } from "react";
import { DownloadIcon } from "@/utils/icons";
import { Modal } from "antd";
import { CertificateDisplay } from "./certificate/CertificateDisplay";
import { SafetyCertificateFilled, EyeOutlined } from "@ant-design/icons";
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
        <div className="w-full h-44 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 p-3 flex flex-col justify-between relative overflow-hidden text-center text-white border border-slate-700/50">
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <SafetyCertificateFilled /> Verified
          </div>

          <div className="my-auto py-2">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block">
              Official Certificate
            </span>
            <h4 className="text-sm font-bold text-white line-clamp-2 mt-0.5">
              {title}
            </h4>
            <span className="text-[11px] text-slate-300 font-serif italic mt-1 block">
              Awarded to {certData.studentName}
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-700/60 pt-1.5 font-mono">
            <span>ID: {code.slice(0, 16)}</span>
            <span className="group-hover:text-blue-400 font-sans flex items-center gap-1 transition-colors">
              <EyeOutlined /> View
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
        width={880}
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
