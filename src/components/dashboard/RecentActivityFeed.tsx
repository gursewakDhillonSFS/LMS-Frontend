"use client";
import React from "react";
import Link from "next/link";
import {
  ClockCircleOutlined,
  UserAddOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  StarOutlined,
} from "@ant-design/icons";

export interface ActivityItem {
  id: string;
  type: "student_enrolled" | "live_class" | "assignment_submitted" | "review_received";
  title: string;
  detail: string;
  timeAgo: string;
}

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  rolePrefix?: string;
}

const defaultActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "student_enrolled",
    title: "New student enrolled",
    detail: "Sarah Johnson joined Advanced TypeScript Patterns",
    timeAgo: "2h ago",
  },
  {
    id: "act-2",
    type: "live_class",
    title: "Live class scheduled",
    detail: "React 19 & Next.js Masterclass",
    timeAgo: "4h ago",
  },
  {
    id: "act-3",
    type: "assignment_submitted",
    title: "New assignment submitted",
    detail: "Node.js & Express Backend Engineering",
    timeAgo: "6h ago",
  },
  {
    id: "act-4",
    type: "review_received",
    title: "New review received",
    detail: "Great course! Very helpful content and clear examples.",
    timeAgo: "8h ago",
  },
];

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  rolePrefix = "",
}) => {
  const displayActivities =
    activities && activities.length > 0 ? activities : defaultActivities;

  const viewAllUrl = rolePrefix
    ? `${rolePrefix}/announcements`
    : "/announcements";

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "student_enrolled":
        return {
          icon: <UserAddOutlined className="text-sm" />,
          classes: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "live_class":
        return {
          icon: <VideoCameraOutlined className="text-sm" />,
          classes: "text-violet-400 bg-violet-500/10 border-violet-500/20",
        };
      case "assignment_submitted":
        return {
          icon: <FileTextOutlined className="text-sm" />,
          classes: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      case "review_received":
        return {
          icon: <StarOutlined className="text-sm" />,
          classes: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        };
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-[var(--dash-surface-card)] border border-[var(--dash-border)] shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 flex items-center justify-center shrink-0">
            <ClockCircleOutlined className="text-lg" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-[var(--dash-text-primary)] tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xs text-[var(--dash-text-muted)]">
              Real-time updates across your courses
            </p>
          </div>
        </div>

        <Link
          href={viewAllUrl}
          className="text-xs font-bold text-[var(--dash-primary)] hover:underline flex items-center gap-1"
        >
          View All
        </Link>
      </div>

      {/* Activity List */}
      <div className="flex flex-col divide-y divide-[var(--dash-border)] pt-1">
        {displayActivities.map((item) => {
          const style = getIcon(item.type);
          return (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-1 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${style.classes}`}
                >
                  {style.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[var(--dash-text-primary)]">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[var(--dash-text-secondary)] line-clamp-1 leading-snug">
                    {item.detail}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-medium text-[var(--dash-text-muted)] shrink-0 pt-0.5">
                {item.timeAgo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
