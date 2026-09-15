import { CheckIcon, EditIcon } from "@/utils/icons";
import { Fallback } from "@/utils/images";
import { Col, Row } from "antd";
import Image from "next/image";
import React, { useState } from "react";
import AvtarInfo from "../../components/AvtarInfo";
import { CourseInfoDataProp } from "@/utils/interface";
import { formatLabel, getImageUrl, isValidUrl } from "@/utils/comman";
import EditInstructorCourseDetails from "@/components/modal/EditInstructorCourseDetails";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import QuillEditor from "@/components/QuillEditor";

interface InstructorCourseInfoProp {
  coursesInfo: CourseInfoDataProp | undefined;
  loading: boolean;
  fetchCourseInfo: () => Promise<void>;
}
const InstructorCourseDetails: React.FC<InstructorCourseInfoProp> = ({
  coursesInfo,
  loading,
  fetchCourseInfo,
}) => {
  console.log(loading);
  const [type, setType] = useState<string>("");
  const [imgError, setImgError] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const role_name = useSelector((state: RootState) => state.userdata?.role_name);
  const isTeacher = role_name === "teacher";
  const courseImageUrl = getImageUrl(coursesInfo?.course_image_url);

  const showFallback =
    !coursesInfo?.course_image_url || imgError || !isValidUrl(courseImageUrl);
  const displayImage = showFallback ? Fallback : courseImageUrl;
  const courseInfoArray = [
    { label: "Course Name", value: coursesInfo?.course_name, span: 24 },
    { label: "Head Teacher", value: coursesInfo?.head_teacher_name, span: 8 },
    {
      label: "Course Level",
      value: formatLabel(coursesInfo?.course_level),
      span: 8,
    },
    {
      label: "Duration",
      value: formatLabel(coursesInfo?.course_duration),
      span: 8,
    },
    {
      label: "Total Student",
      value: coursesInfo?.enrolled_user_count,
      span: 8,
    },
    {
      label: "Schedule",
      value: formatLabel(coursesInfo?.course_schedule),
      span: 16,
    },
    {
      label: "Batch",
      value: Array.isArray(coursesInfo?.batch)
        ? coursesInfo.batch.map((b: { batchName?: string }) => b?.batchName).filter(Boolean).join(", ")
        : "",
      span: 8,
    },
    {
      label: "Demo Class",
      value: coursesInfo?.demo_classes ? "Yes" : "No",
      span: 8,
    },
    {
      label: "Live Classes",
      value: coursesInfo?.live_classes ? "Yes" : "No",
      span: 8,
    },
    { label: "Price", value: "$" + coursesInfo?.course_price, span: 8 },
  ];

  return (
    <div className="flex gap-6 flex-col">
      <EditInstructorCourseDetails
        visible={editModalVisible}
        type={type}
        courseInfo={coursesInfo}
        fetchCourseInfo={fetchCourseInfo}
        onCancel={() => setEditModalVisible(false)}
      />

      {/* Hero Banner & Course Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-[260px] lg:h-auto min-h-[260px] relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs bg-slate-100">
          <Image
            src={displayImage}
            alt="Course Thumbnail"
            fill
            unoptimized
            onError={() => setImgError(true)}
            className="object-cover"
          />
        </div>

        <div className="lg:col-span-7 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h1 className="font-bold text-xl text-slate-900">
              Course Information
            </h1>
            {!isTeacher && (
              <button
                onClick={() => {
                  setEditModalVisible(true);
                  setType("info");
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-50 transition cursor-pointer"
                title="Edit Course Info"
              >
                <EditIcon />
              </button>
            )}
          </div>

          <Row gutter={[16, 16]}>
            {courseInfoArray.map((item, index) => (
              <Col key={index} span={item.span}>
                <div className="flex flex-col gap-1 p-2 rounded-xl bg-slate-50/60 border border-slate-100">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {item.value || "-"}
                  </p>
                </div>
              </Col>
            ))}
            <Col span={24}>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-slate-500 text-xs font-semibold">Category:</span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold rounded-full">
                  {coursesInfo?.category_name || "General"}
                </span>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* What You'll Learn & Skills Gain Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="font-bold text-lg text-slate-900">
              What you&apos;ll learn
            </h2>
            {!isTeacher && (
              <button
                onClick={() => {
                  setEditModalVisible(true);
                  setType("points");
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-50 transition cursor-pointer"
                title="Edit Learning Points"
              >
                <EditIcon />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coursesInfo?.course_learning_points?.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/60 border border-slate-100 shadow-2xs"
              >
                <div className="text-secondary shrink-0 mt-0.5">
                  <CheckIcon />
                </div>
                <span className="text-slate-700 text-sm leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-5 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="font-bold text-lg text-slate-900">
              Skills you&apos;ll gain
            </h2>
            {!isTeacher && (
              <button
                onClick={() => {
                  setEditModalVisible(true);
                  setType("skills");
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-50 transition cursor-pointer"
                title="Edit Skills"
              >
                <EditIcon />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {coursesInfo?.skills_you_gain?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold rounded-lg shadow-2xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* About Class */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="font-bold text-lg text-slate-900">About Class</h2>
          {!isTeacher && (
            <button
              onClick={() => {
                setEditModalVisible(true);
                setType("about");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-50 transition cursor-pointer"
              title="Edit About"
            >
              <EditIcon />
            </button>
          )}
        </div>
        <div className="text-slate-700 text-sm leading-relaxed">
          <QuillEditor readOnly value={coursesInfo?.about_course || ""} />
        </div>
      </div>

      {/* Meet Your Teacher */}
      <div className="flex flex-col gap-5 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="font-bold text-lg text-slate-900">Meet Your Teacher</h2>
          {!isTeacher && (
            <button
              onClick={() => {
                setEditModalVisible(true);
                setType("teacher");
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-50 transition cursor-pointer"
              title="Edit Teacher Info"
            >
              <EditIcon />
            </button>
          )}
        </div>
        <AvtarInfo
          imageUrl={coursesInfo?.course_instructor_image_url}
          name={coursesInfo?.course_instructor}
          organization={"SkillBuild"}
        />
        <div className="text-slate-700 text-sm leading-relaxed pt-2 border-t border-slate-100">
          <QuillEditor readOnly value={coursesInfo?.description || ""} />
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseDetails;
