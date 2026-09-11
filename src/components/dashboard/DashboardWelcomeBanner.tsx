"use client";
import React from "react";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface DashboardWelcomeBannerProps {
  userName?: string;
  theme: "dark" | "light";
  onToggleTheme?: () => void;
  dateRangeLabel?: string;
}

const DashboardWelcomeBanner: React.FC<DashboardWelcomeBannerProps> = ({
  userName = "Instructor",
  theme,
  onToggleTheme,
  dateRangeLabel = "Last 30 days",
}) => {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  const todayFormatted = dayjs().format("MMM D, YYYY");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      {/* Left: Greeting & Subtitle */}
      <div className="flex flex-col gap-1">
        <div className="text-xs sm:text-sm font-medium text-[#475467] tracking-wide flex items-center gap-1.5">
          <span>{greeting},</span>
          <span className="font-semibold text-[#101828]">
            {userName}
          </span>
          <span className="inline-block animate-bounce">👋</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
          Welcome back!
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
          Here&apos;s what&apos;s happening with your courses and students today.
        </p>
      </div>

      {/* Right: Date Range Filter Pill */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E4E7EC] text-xs font-semibold text-[#475467] shadow-xs transition-all">
          <CalendarOutlined className="text-sm text-[#315CFF]" />
          <span className="text-[#101828] font-medium">
            {todayFormatted}
          </span>
          <span className="text-[#667085]">
            ({dateRangeLabel})
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardWelcomeBanner;
