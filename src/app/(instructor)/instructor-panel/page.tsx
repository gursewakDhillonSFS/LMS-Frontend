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
        <div className="text-[var(--primary)]">
          <CourseIcon />
        </div>
      ),
      text: "Total Courses",
      count: String(stats.courseCount),
      bg: "#EEF2FF",
    },
    {
      image: (
        <div className="text-[var(--success)]">
          <StudentIcon />
        </div>
      ),
      text: "Enrolled Students",
      count: String(stats.studentCount),
      bg: "#ECFDF5",
    },
    {
      image: (
        <div className="text-[var(--error)]">
          <LiveIcon />
        </div>
      ),
      text: "Upcoming Live Classes",
      count: String(stats.upcomingLiveClasses),
      bg: "#FEF2F2",
    },
    {
      image: (
        <div className="text-[var(--warning)]">
          <AssignmentIcon />
        </div>
      ),
      text: "Pending to Grade",
      count: String(stats.pendingAssignmentsToGrade),
      bg: "#FFFBEB",
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Instructor Dashboard
        </h1>
        <div className="flex flex-wrap gap-2.5 items-center">
          <CommonButton
            text="Post Announcement"
            className="!bg-white !border !border-[var(--border)] !text-[var(--text-primary)] hover:!border-[var(--primary)] hover:!text-[var(--primary)] !h-9 !text-xs !px-3 shadow-2xs"
            onClick={() => route.push(RoutePaths.Announcements)}
          />
          <CommonButton
            text="Schedule Live Class"
            className="!bg-white !border !border-[var(--border)] !text-[var(--text-primary)] hover:!border-[var(--primary)] hover:!text-[var(--primary)] !h-9 !text-xs !px-3 shadow-2xs"
            onClick={() => route.push(RoutePaths.LiveClasses)}
          />
          <CommonButton
            text="+ Create Course"
            onClick={() => route.push(`${RoutePaths.Courses}/create-course`)}
            className="!h-9 !text-xs !px-4 shadow-xs"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {infoCardsData.map((card, index) => (
          <InfoCard key={index} {...card} />
        ))}
      </div>
      <InstructorStatistics />
    </div>
  );
};

export default InstructorPanel;
