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
      colorClass: "text-[#3B66FF] bg-[#3B66FF]/10 border-[#3B66FF]/20",
      path: rolePrefix
        ? `${rolePrefix}/courses/create-course`
        : "/courses/create-course",
    },
    {
      title: "Schedule Live Class",
      desc: "Host a live session",
      icon: <VideoCameraOutlined className="text-base" />,
      colorClass: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
      path: rolePrefix ? `${rolePrefix}/live-classes` : "/live-classes",
    },
    {
      title: "Manage Assignments",
      desc: "Review and grade",
      icon: <FileTextOutlined className="text-base" />,
      colorClass: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20",
      path: rolePrefix ? `${rolePrefix}/assignments` : "/assignments",
    },
    {
      title: "View Students",
      desc: "Track your learners",
      icon: <TeamOutlined className="text-base" />,
      colorClass: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
      path: rolePrefix ? `${rolePrefix}/students` : "/students",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-[var(--dash-surface-card)] border border-[var(--dash-border)] shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#3B66FF]/10 text-[#3B66FF] border border-[#3B66FF]/20 flex items-center justify-center shrink-0">
          <ThunderboltOutlined className="text-lg" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-bold text-[var(--dash-text-primary)] tracking-tight">
            Quick Actions
          </h2>
          <p className="text-xs text-[var(--dash-text-muted)]">
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
            className="group w-full flex items-center justify-between p-3 rounded-xl bg-[var(--dash-surface-subtle)] hover:bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] hover:border-[var(--dash-border-strong)] transition-all duration-150 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${act.colorClass}`}
              >
                {act.icon}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs sm:text-sm font-bold text-[var(--dash-text-primary)] group-hover:text-[var(--dash-primary)] transition-colors truncate">
                  {act.title}
                </span>
                <span className="text-[11px] text-[var(--dash-text-muted)] truncate">
                  {act.desc}
                </span>
              </div>
            </div>

            <RightOutlined className="text-xs text-[var(--dash-text-muted)] group-hover:text-[var(--dash-primary)] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
