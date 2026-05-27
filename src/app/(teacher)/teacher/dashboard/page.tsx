"use client";
import CommonButton from "@/components/CommonButton";
import InfoCard, { InfoCardProps } from "@/components/InfoCard";
import InstructorStatistics from "@/modules/instructorPanel/InstructorStatistics";
import { RoutePaths } from "@/utils/enums";
import {
  AssignmentIcon,
  CourseIcon,
  LiveIcon,
  StudentIcon,
} from "@/utils/icons";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const TeacherDashboard = () => {
  const route = useRouter();
  const infoCardsData: InfoCardProps[] = [
    {
      image: (
        <div className="text-secondary">
          <CourseIcon />
        </div>
      ),
      text: "Assigned Courses",
      count: "4",
      bg: "#D9D4FF",
    },
    {
      image: (
        <div className="text-[#5EB85C]">
          <StudentIcon />
        </div>
      ),
      text: "Your Students",
      count: "84",
      bg: "#EAFFDE",
    },
    {
      image: (
        <div className="text-[#FB4A49]">
          <LiveIcon />
        </div>
      ),
      text: "Upcoming Live Classes",
      count: "01",
      bg: "#FFDEE6",
    },
    {
      image: (
        <div className="text-[#FFC023]">
          <AssignmentIcon />
        </div>
      ),
      text: "Pending Gradings",
      count: "8",
      bg: "#FFF3DB",
    },
  ];
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold">Teacher Dashboard</h1>
        <div className="flex gap-[12px] items-center justify-center">
          <CommonButton
            text={"Schedule Live Class"}
            onClick={() => route.push("/teacher/live-classes")}
          />
          <CommonButton
            text={"View My Schedule"}
            onClick={() => route.push("/teacher/schedule")}
            className="!bg-secondary text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
        {infoCardsData.map((card, index) => (
          <InfoCard key={index} {...card} />
        ))}
      </div>
      <InstructorStatistics />
    </div>
  );
};

export default TeacherDashboard;
