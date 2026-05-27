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
      <div className="flex gap-4  rounded-[20px]">
        <div className="relative w-[500px]">
          <Image
            src={displayImage}
            alt="Course Thumbnail"
            fill
            unoptimized
            onError={() => setImgError(true)}
            className="rounded-xl"
          />
        </div>

        <div className="p-5 bg-white rounded-xl flex flex-col gap-4 w-full">
          <div className="flex justify-between">
            <h1 className="font-semibold text-2xl text-[#0C0925]">
              Course Info
            </h1>
            {!isTeacher && (
              <button
                onClick={() => {
                  setEditModalVisible(true);
                  setType("info");
                }}
              >
                <EditIcon />
              </button>
            )}
          </div>
          <Row gutter={[16, 16]}>
            {courseInfoArray.map((item, index) => (
              <Col key={index} span={item.span}>
                <div className="flex flex-col gap-1.5">
                  <p className="text-gray-500 text-sm">{item.label}</p>
                  <p className="text-base font-medium">{item.value}</p>
                </div>
              </Col>
            ))}
            <Col span={16}>
              <div className="flex flex-col gap-1.5">
                <p className="text-gray-500 text-sm">Categories</p>
                <div className="flex gap-1">
                  {/* {coursesInfo.categories.map((item, index) => (
                    <p
                      className="border rounded-[80px] px-3 py-1.5"
                      key={index}
                    >
                      {item}
                    </p>
                  ))} */}
                  <p className="border rounded-[80px] px-3 py-1.5">
                    {coursesInfo?.category_name}
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-6 p-4 rounded-xl bg-white w-2/3">
          <div className="flex justify-between">
            <h1 className="font-semibold text-2xl text-[#0C0925]">
              What you&apos;ll learn
            </h1>
            {!isTeacher && (
              <button
                onClick={() => {
                  setEditModalVisible(true);
                  setType("points");
                }}
              >
                <EditIcon />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {coursesInfo?.course_learning_points.map((item, index) => (
              <div key={index} className="flex items-start gap-[6px]">
                <CheckIcon />
                <span className="text-[#5C5C5C] text-[16px] ">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 p-4 rounded-xl bg-white w-1/3">
          <div className="flex justify-between">
            <h1 className="font-semibold text-2xl text-[#0C0925]">
              Skills you&apos;ll gain
            </h1>
            {!isTeacher && (
              <button
                onClick={() => {
                  setEditModalVisible(true);
                  setType("skills");
                }}
              >
                <EditIcon />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {coursesInfo?.skills_you_gain.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 border border-[#002333] text-[12px] text-[#002333] rounded-[6px]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl text-[#0C0925]">About Class</h1>
          {!isTeacher && (
            <button
              onClick={() => {
                setEditModalVisible(true);
                setType("about");
              }}
            >
              <EditIcon />
            </button>
          )}
        </div>
        <QuillEditor readOnly value={coursesInfo?.about_course || ''} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl text-[#0C0925]">
            Meet Your Teacher
          </h1>
          {!isTeacher && (
            <button
              onClick={() => {
                setEditModalVisible(true);
                setType("teacher");
              }}
            >
              <EditIcon />
            </button>
          )}
        </div>
        <AvtarInfo
          imageUrl={coursesInfo?.course_instructor_image_url}
          name={coursesInfo?.course_instructor}
          organization={"Orangination Name"}
        />
        <QuillEditor readOnly value={coursesInfo?.description || ''} />
      </div>
    </div>
  );
};

export default InstructorCourseDetails;
