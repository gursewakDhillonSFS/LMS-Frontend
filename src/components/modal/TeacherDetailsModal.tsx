"use client";

import React, { useEffect, useState } from "react";
import { Modal, Skeleton, Tag, Tooltip } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  CalendarOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  CloseOutlined,
  AppstoreOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { InstructorRecord } from "@/utils/interface";
import { getInstructor } from "@/services/collections";
import { getImageUrl, isValidUrl, getCategoryName } from "@/utils/comman";
import useCategories from "@/hooks/useCategories";
import { EditTeacherDetailModal } from "./EditTeacherDetailModal";

interface TeacherDetailsModalProps {
  open: boolean;
  onClose: () => void;
  teacher: InstructorRecord | null;
  onTeacherUpdated?: () => void;
}

export const TeacherDetailsModal: React.FC<TeacherDetailsModalProps> = ({
  open,
  onClose,
  teacher,
  onTeacherUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [teacherData, setTeacherData] = useState<InstructorRecord | null>(teacher);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { data: categories } = useCategories();

  const fetchDetails = async () => {
    if (!teacher?.instructor_id) return;
    setLoading(true);
    try {
      const param = new URLSearchParams();
      param.append("instrcutor_id", teacher.instructor_id);
      const res = await getInstructor(param);
      if (res?.status && res?.data) {
        setTeacherData(res.data);
      }
    } catch (err) {
      console.error("Error loading teacher details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && teacher) {
      setTeacherData(teacher);
      fetchDetails();
    }
  }, [open, teacher]);

  const activeTeacher = teacherData || teacher;
  const imageUrl = getImageUrl(activeTeacher?.image_url);
  const hasValidImage = isValidUrl(imageUrl);
  const status = (activeTeacher?.status || "Active").toLowerCase();
  const isActive = status === "active" || status === "publish" || status === "accepted";

  return (
    <>
      {editModalOpen && (
        <EditTeacherDetailModal
          open={editModalOpen}
          onCancel={() => setEditModalOpen(false)}
          editInstructorData={activeTeacher || undefined}
          getDetails={async () => {
            await fetchDetails();
            if (onTeacherUpdated) onTeacherUpdated();
          }}
        />
      )}

      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={680}
        closeIcon={
          <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <CloseOutlined className="text-slate-600 text-xs" />
          </div>
        }
        className="teacher-details-modal"
      >
        <div className="p-1 flex flex-col gap-6">
          {/* Header Banner */}
          <div className="relative rounded-2xl bg-gradient-to-r from-[#101828] via-[#1E293B] to-[#0F172A] p-6 text-white overflow-hidden shadow-md">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-[#315CFF]/20 blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
              {/* Avatar Frame */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-800 shrink-0 shadow-lg flex items-center justify-center">
                {hasValidImage ? (
                  <Image
                    src={imageUrl}
                    alt={activeTeacher?.name || "Teacher"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <UserOutlined className="text-4xl text-slate-400" />
                )}
                <div
                  className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    isActive ? "bg-emerald-400" : "bg-slate-400"
                  }`}
                />
              </div>

              {/* Identity & Badges */}
              <div className="flex-1 flex flex-col items-center sm:items-start gap-1.5 min-w-0 text-center sm:text-left">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeTeacher?.name || "Teacher Profile"}
                  </h2>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-500/20 text-slate-300 border-slate-500/40"
                    }`}
                  >
                    {isActive ? "Active Faculty" : "Inactive"}
                  </span>
                </div>

                {activeTeacher?.qualification && (
                  <p className="text-xs sm:text-sm text-blue-200 font-medium flex items-center gap-1.5">
                    <SafetyCertificateOutlined className="text-[#315CFF]" />
                    <span>{activeTeacher.qualification}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-300">
                  {activeTeacher?.email && (
                    <a
                      href={`mailto:${activeTeacher.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <MailOutlined className="text-slate-400" />
                      <span>{activeTeacher.email}</span>
                    </a>
                  )}
                  {activeTeacher?.phone_number && (
                    <span className="inline-flex items-center gap-1.5">
                      <PhoneOutlined className="text-slate-400" />
                      <span>{activeTeacher.phone_number}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Edit button */}
              <Tooltip title="Edit Profile Details">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="sm:self-start p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors cursor-pointer"
                >
                  <EditOutlined className="text-base" />
                </button>
              </Tooltip>
            </div>
          </div>

          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : (
            <div className="flex flex-col gap-5 px-2">
              {/* Section 1: Personal Details */}
              <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col gap-3">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Gender</span>
                    <span className="font-semibold text-slate-800">
                      {activeTeacher?.gender || "Not Specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                    <span className="font-semibold text-slate-800">
                      {activeTeacher?.dob || "Not Provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Marital Status</span>
                    <span className="font-semibold text-slate-800">
                      {activeTeacher?.marital_status || "Not Specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Qualification</span>
                    <span className="font-semibold text-slate-800">
                      {activeTeacher?.qualification || "Not Specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Expertise / Categories */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col gap-3 shadow-2xs">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
                  <AppstoreOutlined className="text-[#315CFF]" />
                  <span>Subject Expertise & Specializations</span>
                </h3>
                {activeTeacher?.expert_in && activeTeacher.expert_in.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeTeacher.expert_in.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#315CFF] border border-blue-100"
                      >
                        {getCategoryName(categories, item) || item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No specializations tagged for this faculty member yet.
                  </p>
                )}
              </div>

              {/* Section 3: Current Assigned Courses */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col gap-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
                    <BookOutlined className="text-emerald-600" />
                    <span>Assigned Courses ({activeTeacher?.current_courses?.length || 0})</span>
                  </h3>
                </div>
                {activeTeacher?.current_courses && activeTeacher.current_courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeTeacher.current_courses.map((course, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs font-semibold text-slate-800"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs">
                          {idx + 1}
                        </div>
                        <span className="truncate">{course}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No courses currently assigned.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer Toolbar */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 px-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#315CFF] hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <EditOutlined />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TeacherDetailsModal;
