"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  BookOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  FileDoneOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";

export interface DashboardKpiStats {
  courseCount: number;
  studentCount: number;
  upcomingLiveClasses: number;
  pendingAssignmentsToGrade: number;
}

interface DashboardKpiCardsProps {
  stats: DashboardKpiStats;
  rolePrefix?: string; // "" for instructor, "/teacher" for teacher
}

const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  stats,
  rolePrefix = "",
}) => {
  const router = useRouter();

  const cards = [
    {
      title: "Total Courses",
      value: stats.courseCount,
      delta: "+12%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <BookOutlined className="text-lg" />,
      colorClasses: "text-[#315CFF] bg-blue-50 border-blue-100",
      targetPath: `${rolePrefix}/courses` || "/courses",
    },
    {
      title: "Enrolled Students",
      value: stats.studentCount,
      delta: "+18%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <TeamOutlined className="text-lg" />,
      colorClasses: "text-emerald-600 bg-emerald-50 border-emerald-100",
      targetPath: rolePrefix ? `${rolePrefix}/students` : "/students",
    },
    {
      title: "Upcoming Live Classes",
      value: stats.upcomingLiveClasses,
      delta: "+50%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <VideoCameraOutlined className="text-lg" />,
      colorClasses: "text-purple-600 bg-purple-50 border-purple-100",
      targetPath: rolePrefix ? `${rolePrefix}/live-classes` : "/live-classes",
    },
    {
      title: "Pending to Grade",
      value: stats.pendingAssignmentsToGrade,
      delta: "0%",
      deltaType: "neutral" as const,
      period: "vs. last 30 days",
      icon: <FileDoneOutlined className="text-lg" />,
      colorClasses: "text-amber-600 bg-amber-50 border-amber-100",
      targetPath: rolePrefix ? `${rolePrefix}/assignments` : "/assignments",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => card.targetPath && router.push(card.targetPath)}
          className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#E4E7EC] shadow-xs hover:shadow-md hover:border-[#D0D5DD] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          {/* Subtle top surface accent line on hover */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#315CFF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Row: Icon Squircle & Title */}
          <div className="flex items-center gap-3.5 mb-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${card.colorClasses}`}
            >
              {card.icon}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#475467] tracking-tight">
              {card.title}
            </span>
          </div>

          {/* Bottom Row: Big Metric & Delta Badge */}
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
              {card.value.toLocaleString()}
            </div>

            {/* Delta Tag */}
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  card.deltaType === "positive"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {card.deltaType === "positive" && (
                  <ArrowUpOutlined className="text-[9px]" />
                )}
                {card.delta}
              </span>
              <span className="text-[11px] text-[#667085] hidden xl:inline-block">
                {card.period}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardKpiCards;
