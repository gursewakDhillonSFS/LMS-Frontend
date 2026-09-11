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
          classes: "text-emerald-600 bg-emerald-50 border-emerald-100",
        };
      case "live_class":
        return {
          icon: <VideoCameraOutlined className="text-sm" />,
          classes: "text-purple-600 bg-purple-50 border-purple-100",
        };
      case "assignment_submitted":
        return {
          icon: <FileTextOutlined className="text-sm" />,
          classes: "text-amber-600 bg-amber-50 border-amber-100",
        };
      case "review_received":
        return {
          icon: <StarOutlined className="text-sm" />,
          classes: "text-blue-600 bg-blue-50 border-blue-100",
        };
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#E4E7EC] shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <ClockCircleOutlined className="text-lg" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-[#101828] tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xs text-[#667085]">
              Real-time updates across your courses
            </p>
          </div>
        </div>

        <Link
          href={viewAllUrl}
          className="text-xs font-bold text-[#315CFF] hover:underline flex items-center gap-1"
        >
          View All
        </Link>
      </div>

      {/* Activity List */}
      <div className="flex flex-col divide-y divide-[#F2F4F7] pt-1">
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
                  <span className="text-xs font-bold text-[#101828]">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[#475467] line-clamp-1 leading-snug">
                    {item.detail}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-medium text-[#98A2B3] shrink-0 pt-0.5">
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
