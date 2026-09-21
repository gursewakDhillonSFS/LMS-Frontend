"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { CourseInfoDataProp } from "@/utils/interface";
import { formatLabel, getImageUrl, isValidUrl } from "@/utils/comman";
import { Fallback } from "@/utils/images";
import EditInstructorCourseDetails from "@/components/modal/EditInstructorCourseDetails";
import QuillEditor from "@/components/QuillEditor";
import AvtarInfo from "../../components/AvtarInfo";
import {
  EditOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  TagOutlined,
  BookOutlined,
} from "@ant-design/icons";

interface InstructorCourseInfoProp {
  coursesInfo: CourseInfoDataProp | undefined;
  loading: boolean;
  fetchCourseInfo: () => Promise<void>;
}

const InstructorCourseDetails: React.FC<InstructorCourseInfoProp> = ({
  coursesInfo,
  loading: _loading,
  fetchCourseInfo,
}) => {
  const [type, setType] = useState<string>("");
  const [imgError, setImgError] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const role_name = useSelector((state: RootState) => state.userdata?.role_name);
  const isTeacher = role_name === "teacher";

  const courseImageUrl = getImageUrl(coursesInfo?.course_image_url);
  const showFallback = !coursesInfo?.course_image_url || imgError || !isValidUrl(courseImageUrl);
  const displayImage = showFallback ? Fallback : courseImageUrl;

  const handleOpenEdit = (modalType: string) => {
    setType(modalType);
    setEditModalVisible(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <EditInstructorCourseDetails
        visible={editModalVisible}
        type={type}
        courseInfo={coursesInfo}
        fetchCourseInfo={fetchCourseInfo}
        onCancel={() => setEditModalVisible(false)}
      />

      {/* Hero Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Cover Media */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[320px] bg-slate-950">
            <Image
              src={displayImage}
              alt={coursesInfo?.course_name || "Course Thumbnail"}
              fill
              unoptimized
              onError={() => setImgError(true)}
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold shadow-xs">
                {coursesInfo?.category_name || "General"}
              </span>
              {coursesInfo?.course_level && (
                <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold shadow-xs uppercase">
                  {formatLabel(coursesInfo.course_level)}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold block mb-0.5">
                Course ID: {coursesInfo?.course_id || "Active"}
              </span>
              <p className="text-lg font-bold line-clamp-2 leading-snug">
                {coursesInfo?.course_name}
              </p>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Course Overview & Specifications
                </span>
                <h1 className="text-2xl font-bold text-slate-900">
                  {coursesInfo?.course_name || "Course Details"}
                </h1>
              </div>

              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit("info")}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <EditOutlined />
                  <span>Edit Info</span>
                </button>
              )}
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Lead Instructor
                </span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                  {coursesInfo?.head_teacher_name || "Assigned Instructor"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Duration
                </span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {formatLabel(coursesInfo?.course_duration) || "Self Paced"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Course Price
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                  {coursesInfo?.course_price ? `$${coursesInfo.course_price}` : "Free"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Enrolled Students
                </span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {coursesInfo?.enrolled_user_count || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Demo Class
                </span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {coursesInfo?.demo_classes ? "Available" : "None"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Live Classes
                </span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {coursesInfo?.live_classes ? "Scheduled" : "Recorded"}
                </span>
              </div>
            </div>

            {/* Schedule Info */}
            {coursesInfo?.course_schedule && (
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <CalendarOutlined className="text-blue-600 text-base shrink-0" />
                <div className="text-xs text-blue-900">
                  <span className="font-bold">Course Schedule: </span>
                  {formatLabel(coursesInfo.course_schedule)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Curriculum Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* What You'll Learn */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircleFilled className="text-emerald-500 text-lg" />
                <h2 className="text-lg font-bold text-slate-900">What You&apos;ll Learn</h2>
              </div>
              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit("points")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                  title="Edit Learning Points"
                >
                  <EditOutlined />
                </button>
              )}
            </div>

            {coursesInfo?.course_learning_points && coursesInfo.course_learning_points.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coursesInfo.course_learning_points.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-xs sm:text-sm text-slate-700 leading-snug font-medium">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No learning objectives specified yet.</p>
            )}
          </div>

          {/* About This Course */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOutlined className="text-blue-600 text-lg" />
                <h2 className="text-lg font-bold text-slate-900">About This Course</h2>
              </div>
              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit("about")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                  title="Edit About Course"
                >
                  <EditOutlined />
                </button>
              )}
            </div>

            <div className="text-slate-700 text-sm leading-relaxed">
              <QuillEditor readOnly value={coursesInfo?.about_course || "No course description provided."} />
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Skills & Instructor */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skills Gain Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TagOutlined className="text-purple-600" />
                <h2 className="text-base font-bold text-slate-900">Skills You&apos;ll Gain</h2>
              </div>
              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit("skills")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                  title="Edit Skills"
                >
                  <EditOutlined />
                </button>
              )}
            </div>

            {coursesInfo?.skills_you_gain && coursesInfo.skills_you_gain.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {coursesInfo.skills_you_gain.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60 text-xs font-bold shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
            )}
          </div>

          {/* Instructor Bio Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SafetyCertificateOutlined className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Course Instructor</h2>
              </div>
              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit("teacher")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                  title="Edit Teacher Info"
                >
                  <EditOutlined />
                </button>
              )}
            </div>

            <AvtarInfo
              imageUrl={coursesInfo?.course_instructor_image_url}
              name={coursesInfo?.course_instructor || "Lead Faculty"}
              organization="SkillBuild LMS"
            />

            {coursesInfo?.description && (
              <div className="text-slate-600 text-xs leading-relaxed pt-3 border-t border-slate-100">
                <QuillEditor readOnly value={coursesInfo.description} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseDetails;
