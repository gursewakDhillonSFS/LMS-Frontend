"use client";

import React from "react";
import Image from "next/image";
import { CloseOutlined, BellOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "@/context/I18nContext";

const notifications = {
  new: [
    {
      course: "Finance & Quantitative Modeling for Analysts Course",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
      course: "Finance & Quantitative Modeling for Analysts Course",
      message: "Assignments due in",
      type: "12 hrs",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
  ],
  today: [
    {
      course: "Finance & Quantitative Modeling for Analysts Course",
      message: "Add the Quiz result",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    {
      course: "Finance & Quantitative Modeling for Analysts Course",
      message: "Add the Quiz result",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
  ],
  all: [
    {
      course: "Finance & Quantitative Modeling for Analysts",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Assignments due in",
      type: "12 hrs",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Assignments due in",
      type: "12 hrs",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
  ],
};

type NotificationData = {
  course: string;
  avatar: string;
  message: string;
  type?: string;
  time: string;
};

const NotificationCard: React.FC<{ data: NotificationData }> = ({ data }) => (
  <div className="group relative flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200/80 hover:bg-slate-50/80 transition-all duration-200">
    <div className="relative shrink-0 mt-0.5">
      <Image
        unoptimized
        width={38}
        height={38}
        src={data.avatar}
        alt={data.course}
        className="w-[38px] h-[38px] rounded-full object-cover ring-2 ring-white shadow-xs"
      />
      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#315CFF] border-2 border-white rounded-full"></span>
    </div>
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      <p className="text-[13px] text-slate-700 leading-snug">
        <span className="font-semibold text-slate-900">{data.course}</span>{" "}
        <span className="text-slate-600">{data.message}</span>{" "}
        {data.type && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-[#315CFF] border border-blue-100">
            {data.type}
          </span>
        )}
      </p>
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <ClockCircleOutlined className="text-[10px]" />
        <span>{data.time}</span>
      </div>
    </div>
  </div>
);

export interface NotificationProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const sections = Object.entries(notifications);

  const getSectionTitle = (section: string) => {
    if (section === "all") return t("common.nav.allNotifications", { defaultValue: "All Notifications" });
    if (section === "new") return t("common.nav.new", { defaultValue: "New" });
    if (section === "today") return t("common.nav.today", { defaultValue: "Today" });
    return section;
  };

  const totalCount = Object.values(notifications).reduce((acc, items) => acc + items.length, 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
            <BellOutlined className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {t("common.panels.notificationsTitle", { defaultValue: "Notifications" })}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#315CFF]/10 text-[#315CFF]">
                {totalCount}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close notification panel"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>

      {/* Body List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-100 scrollbar-thin">
        {sections.map(([section, items]) => (
          <div key={section} className="py-3 first:pt-1 last:pb-1">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {getSectionTitle(section)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{items.length}</span>
            </div>

            <div className="flex flex-col gap-1">
              {items.map((item, idx) => (
                <NotificationCard key={idx} data={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
