"use client";
import CommonButton from "@/components/CommonButton";
import CommonLink from "@/components/CommonLink";
import { ClockWheelIcon } from "@/utils/icons";
import { Card1, Live } from "@/utils/images";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { InstructorCoursesCardProp } from "@/utils/interface";
import BadgeComponent from "@/components/BadgeComponent";

const coursesData: InstructorCoursesCardProp[] = [
  {
    title: "Finance & Quantitative Modeling",
    students: 300,
    liveClasses: "Yes",
    created_at: "2025-05-14",
    course_status: "Publish",
  },
  {
    title: "Data Analytics",
    students: 280,
    liveClasses: "Yes",
    created_at: "2025-05-14",
    course_status: "Unpublish",
  },
  {
    title: "Digital Marketing Specialist",
    students: 310,
    liveClasses: "Yes",
    created_at: "2025-05-14",
    course_status: "Publish",
  },
  {
    title: "Finance & Quantitative Modeling",
    students: 275,
    liveClasses: "No",
    created_at: "2025-05-13",
    course_status: "Publish",
  },
  {
    title: "Data Analytics",
    students: 320,
    liveClasses: "Yes",
    created_at: "2025-05-13",
    course_status: "Publish",
  },
  {
    title: "Digital Marketing Specialist",
    students: 295,
    liveClasses: "Yes",
    created_at: "2025-05-12",
    course_status: "Publish",
  },
  {
    title: "Machine Learning for Business",
    students: 330,
    liveClasses: "Yes",
    created_at: "2025-05-11",
    course_status: "Unpublish",
  },
  {
    title: "Project Management Basics",
    students: 260,
    liveClasses: "No",
    created_at: "2025-05-10",
    course_status: "Publish",
  },
  {
    title: "UX/UI Design Fundamentals",
    students: 240,
    liveClasses: "Yes",
    created_at: "2025-05-09",
    course_status: "Publish",
  },
  {
    title: "Introduction to Cloud Computing",
    students: 285,
    liveClasses: "No",
    created_at: "2025-05-08",
    course_status: "Unpublish",
  },
];

const liveLessons = [
  {
    title: "UPSC Science Class Live Lesson",
    date: "5 May, 2025",
    time: "6:00 PM - 6:45 PM",
  },
  {
    title: "UPSC Science Class Live Lesson",
    date: "8 May, 2025",
    time: "6:00 PM - 6:45 PM",
  },
  {
    title: "UPSC Science Class Live Lesson",
    date: "8 May, 2025",
    time: "6:00 PM - 6:45 PM",
  },
];
const DashboardCourseListing = () => {
  const router = useRouter();
  return (
    <div className="w-full h-full flex gap-[24px]">
      <div className="w-2/3">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold">My courses</h1>
          <CommonLink text={"See All"} />
        </div>
        <div className="flex flex-col gap-3">
          {coursesData.map((data, index) => (
            <div key={index} className="cursor-pointer">
              <div
                onClick={() => router.push("/courses/course-details")}
                className={`bg-white grid grid-cols-11 p-4 rounded-md`}
              >
                <div className="col-span-4 flex gap-2.5 items-center">
                  <Image
                    src={Card1}
                    alt={"image"}
                    className="w-10 h-10 rounded-md"
                  />
                  <p className="font-medium truncate flex h-8 items-center">
                    {data.course_name ?? data?.title}
                  </p>
                </div>
                {data?.enrolled_user_count + "" && (
                  <div className="col-span-2">
                    <p className="text-[#7B7B7B] text-xs">Students</p>
                    <div className="text-sm font-medium flex h-8 items-center">
                      {data.enrolled_user_count ?? "20"}
                    </div>
                  </div>
                )}
                {data?.live_class + "" && (
                  <div className="col-span-2">
                    <p className="text-[#7B7B7B] text-xs">Live Classes</p>
                    <div className="text-sm font-medium flex h-8 items-center">
                      {data.live_class ? "Yes" : "No"}
                    </div>
                  </div>
                )}
                {data?.created_at && (
                  <div className="col-span-2">
                    <p className="text-[#7B7B7B] text-xs">Created Date</p>
                    <div className="text-sm font-medium flex h-8 items-center">
                      {data?.created_at?.split("T")[0]}
                    </div>
                  </div>
                )}
                {data?.course_status && (
                  <div>
                    <p className="text-[#7B7B7B] text-xs">Status</p>
                    <div className="flex h-8 items-center">
                      <BadgeComponent
                        status={
                          data.course_status === "draft"
                            ? "unPublish"
                            : data.course_status
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-1/3 p-4 rounded-[12px] bg-white">
        <h1 className="py-[6px] text-[20px] font-[700] border-b border-[#E7E7E7] flex items-center gap-[10px]">
          <Image alt="live" src={Live} width={32} height={32} />
          Upcomming Live Classes
        </h1>
        <div className="flex flex-col">
          {liveLessons.map((lesson, index) => (
            <div
              key={index}
              className={`flex ${
                index < liveLessons?.length - 1
                  ? "border-b border-[#E7E7E7]"
                  : ""
              } py-[12px]`}
            >
              <div className="flex justify-between items-start w-full">
                <div className="w-[80%] flex flex-col gap-[4px]">
                  <h3 className="text-[14px] font-[600] text-[#0E0E0E]">
                    {lesson.title}
                  </h3>

                  <div className="flex items-center gap-[12px]">
                    <div className="flex items-center justify-center gap-1 text-[12px] text-[#7B7B7B]">
                      <ClockWheelIcon />
                      <span>{lesson.date}</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-[12px] text-[#7B7B7B]">
                      <ClockWheelIcon />
                      <span>{lesson.time}</span>
                    </div>
                  </div>
                </div>
                <CommonButton
                  text="Start Now"
                  className="!bg-red-500 !text-white w-[30%] "
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCourseListing;
