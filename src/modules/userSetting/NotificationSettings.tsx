"use client";

import React, { useState } from "react";
import { Switch } from "antd";
import {
  BellOutlined,
  NotificationOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  StarOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { toast } from "@/utils/toast";

interface NotificationCategory {
  title: string;
  description: string;
  items: {
    key: string;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[];
}

const NOTIFICATION_SECTIONS: NotificationCategory[] = [
  {
    title: "Course & Cohort Updates",
    description: "Stay informed about class announcements, tests, and new homework.",
    items: [
      {
        key: "Announcement",
        label: "Class Announcements",
        desc: "Receive immediate updates when an instructor posts in your course.",
        icon: <NotificationOutlined className="text-[#315CFF]" />,
      },
      {
        key: "NewAssignments",
        label: "New Assignments",
        desc: "Get notified as soon as an instructor assigns new project work.",
        icon: <FileTextOutlined className="text-amber-600" />,
      },
      {
        key: "NewQuizzes",
        label: "New Quizzes",
        desc: "Be alerted the moment a new quiz or assessment becomes available.",
        icon: <QuestionCircleOutlined className="text-purple-600" />,
      },
    ],
  },
  {
    title: "Live Sessions & Due Dates",
    description: "Never miss a live cohort broadcast or assignment deadline.",
    items: [
      {
        key: "LiveClasses",
        label: "Live Classes Scheduled",
        desc: "Receive meeting links and schedule alerts for upcoming live lectures.",
        icon: <VideoCameraOutlined className="text-emerald-600" />,
      },
      {
        key: "AssignmentsReminder",
        label: "Assignment Due Reminders",
        desc: "Get a notification 24 hours before your project submissions close.",
        icon: <FileTextOutlined className="text-amber-600" />,
      },
      {
        key: "QuizzesReminder",
        label: "Quiz Expiry Reminders",
        desc: "Receive timely warnings before tests expire.",
        icon: <QuestionCircleOutlined className="text-purple-600" />,
      },
    ],
  },
  {
    title: "Evaluation & Platform Insights",
    description: "Feedback reports, grading notifications, and platform recommendations.",
    items: [
      {
        key: "Evaluations",
        label: "Grades & Evaluation Feedback",
        desc: "Be notified as soon as teachers evaluate your submissions with notes.",
        icon: <StarOutlined className="text-amber-500" />,
      },
      {
        key: "Recommendation",
        label: "Personalized Recommendations",
        desc: "Curated learning paths and new courses based on your topics of interest.",
        icon: <MailOutlined className="text-[#315CFF]" />,
      },
      {
        key: "All",
        label: "Global Activity Summary",
        desc: "Receive daily digest emails with a summary of all LMS activity.",
        icon: <BellOutlined className="text-slate-600" />,
      },
    ],
  },
];

const NotificationSettings = () => {
  const [enabledKeys, setEnabledKeys] = useState<string[]>([
    "Announcement",
    "LiveClasses",
    "NewAssignments",
    "Evaluations",
    "All",
  ]);

  const handleToggle = (key: string, label: string) => {
    setEnabledKeys((prev) => {
      const isEnabled = prev.includes(key);
      const next = isEnabled ? prev.filter((k) => k !== key) : [...prev, key];
      if (isEnabled) {
        toast.info(`Disabled alerts for ${label}`);
      } else {
        toast.success(`Enabled alerts for ${label}`);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div className="pb-3 border-b border-[#F2F4F7]">
        <h3 className="text-lg font-bold text-[#101828]">Notification Preferences</h3>
        <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
          Choose what notifications you receive about your courses, live classes, and evaluations.
        </p>
      </div>

      <div className="space-y-8">
        {NOTIFICATION_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#101828]">{section.title}</h4>
              <p className="text-xs text-[#667085]">{section.description}</p>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E4E7EC] divide-y divide-[#E4E7EC] overflow-hidden">
              {section.items.map((item) => {
                const isChecked = enabledKeys.includes(item.key);
                return (
                  <div
                    key={item.key}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E4E7EC] flex items-center justify-center text-base shrink-0 shadow-2xs">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-[#101828] block truncate">
                          {item.label}
                        </span>
                        <span className="text-xs text-[#667085] line-clamp-1">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <Switch
                      checked={isChecked}
                      onChange={() => handleToggle(item.key, item.label)}
                      className={isChecked ? "!bg-[#315CFF]" : ""}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
