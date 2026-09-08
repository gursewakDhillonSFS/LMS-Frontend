"use client";
import CommonButton from "@/components/CommonButton";
import InfoCard, { InfoCardProps } from "@/components/InfoCard";
import InstructorStatistics from "@/modules/instructorPanel/InstructorStatistics";
import { getDashboardStatsApi } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import {
  AssignmentIcon,
  CourseIcon,
  LiveIcon,
  StudentIcon,
} from "@/utils/icons";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const InstructorPanel = () => {
  const route = useRouter();
  const [stats, setStats] = useState({
    courseCount: 0,
    studentCount: 0,
    upcomingLiveClasses: 0,
    pendingAssignmentsToGrade: 0,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    (async () => {
      try {
        const res = await getDashboardStatsApi();
        if (res?.status && res.data) {
          setStats({
            courseCount: res.data.courseCount ?? 0,
            studentCount: res.data.studentCount ?? 0,
            upcomingLiveClasses: res.data.upcomingLiveClasses ?? 0,
            pendingAssignmentsToGrade:
              res.data.pendingAssignmentsToGrade ?? 0,
          });
        }
      } catch {
        // keep zeros on failure
      }
    })();
  }, []);

  const infoCardsData: InfoCardProps[] = [
    {
      image: (
        <div className="text-secondary">
          <CourseIcon />
        </div>
      ),
      text: "Your Courses",
      count: String(stats.courseCount),
      bg: "#D9D4FF",
    },
    {
      image: (
        <div className="text-[#5EB85C]">
          <StudentIcon />
        </div>
      ),
      text: "Students",
      count: String(stats.studentCount),
      bg: "#EAFFDE",
    },
    {
      image: (
        <div className="text-[#FB4A49]">
          <LiveIcon />
        </div>
      ),
      text: "Upcoming Live Classes",
      count: String(stats.upcomingLiveClasses),
      bg: "#FFDEE6",
    },
    {
      image: (
        <div className="text-[#FFC023]">
          <AssignmentIcon />
        </div>
      ),
      text: "Pending Assignments to Grade",
      count: String(stats.pendingAssignmentsToGrade),
      bg: "#FFF3DB",
    },
  ];

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold">Dashboard</h1>
        <div className="flex gap-[12px] items-center justify-center">
          <CommonButton
            text={"Post Announcement"}
            className="border !bg-transparent"
            onClick={() => route.push(RoutePaths.Announcements)}
          />
          <CommonButton
            text={"Schedule Live Class"}
            onClick={() => route.push(RoutePaths.LiveClasses)}
          />
          <CommonButton
            text={"+ Create Course"}
            onClick={() => route.push(`${RoutePaths.Courses}/create-course`)}
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

export default InstructorPanel;
