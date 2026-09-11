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
        <div className="text-xs sm:text-sm font-medium text-[var(--dash-text-secondary)] tracking-wide flex items-center gap-1.5">
          <span>{greeting},</span>
          <span className="font-semibold text-[var(--dash-text-primary)]">
            {userName}
          </span>
          <span className="inline-block animate-bounce">👋</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--dash-text-primary)] tracking-tight">
          Welcome back!
        </h1>
        <p className="text-xs sm:text-sm text-[var(--dash-text-muted)] leading-relaxed">
          Here&apos;s what&apos;s happening with your courses and students today.
        </p>
      </div>

      {/* Right: Date Range Filter Pill & Theme Switcher */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--dash-surface-card)] border border-[var(--dash-border)] text-xs font-semibold text-[var(--dash-text-secondary)] shadow-xs transition-all">
          <CalendarOutlined className="text-sm text-[var(--dash-primary)]" />
          <span className="text-[var(--dash-text-primary)] font-medium">
            {todayFormatted}
          </span>
          <span className="text-[var(--dash-text-muted)]">
            ({dateRangeLabel})
          </span>
        </div>

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === "dark" ? "Light Slate" : "Dark Charcoal"} Mode`}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--dash-surface-card)] border border-[var(--dash-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-surface-hover)] transition-all cursor-pointer shadow-xs"
          >
            {theme === "dark" ? (
              <span className="text-sm" role="img" aria-label="light mode">
                ☀️
              </span>
            ) : (
              <span className="text-sm" role="img" aria-label="dark mode">
                🌙
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardWelcomeBanner;
