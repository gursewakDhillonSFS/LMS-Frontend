"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  ThunderboltOutlined,
  BookOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  TeamOutlined,
  RightOutlined,
} from "@ant-design/icons";

interface QuickActionsCardProps {
  rolePrefix?: string;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  rolePrefix = "",
}) => {
  const router = useRouter();

  const actions = [
    {
      title: "Create New Course",
      desc: "Start building your course",
      icon: <BookOutlined className="text-base" />,
      colorClass: "text-[#315CFF] bg-blue-50 border-blue-100",
      path: rolePrefix
        ? `${rolePrefix}/courses/create-course`
        : "/courses/create-course",
    },
    {
      title: "Schedule Live Class",
      desc: "Host a live session",
      icon: <VideoCameraOutlined className="text-base" />,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
      path: rolePrefix ? `${rolePrefix}/live-classes` : "/live-classes",
    },
    {
      title: "Manage Assignments",
      desc: "Review and grade",
      icon: <FileTextOutlined className="text-base" />,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
      path: rolePrefix ? `${rolePrefix}/assignments` : "/assignments",
    },
    {
      title: "View Students",
      desc: "Track your learners",
      icon: <TeamOutlined className="text-base" />,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
      path: rolePrefix ? `${rolePrefix}/students` : "/students",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#E4E7EC] shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#315CFF] border border-blue-100 flex items-center justify-center shrink-0">
          <ThunderboltOutlined className="text-lg" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-bold text-[#101828] tracking-tight">
            Quick Actions
          </h2>
          <p className="text-xs text-[#667085]">
            Frequently used tasks and controls
          </p>
        </div>
      </div>

      {/* Action Items List */}
      <div className="flex flex-col gap-2.5 pt-1">
        {actions.map((act, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => router.push(act.path)}
            className="group w-full flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E4E7EC] hover:border-[#D0D5DD] transition-all duration-150 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${act.colorClass}`}
              >
                {act.icon}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                  {act.title}
                </span>
                <span className="text-[11px] text-[#667085] truncate">
                  {act.desc}
                </span>
              </div>
            </div>

            <RightOutlined className="text-xs text-[#98A2B3] group-hover:text-[#315CFF] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
