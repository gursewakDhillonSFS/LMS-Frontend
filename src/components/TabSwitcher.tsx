"use client";

import { TabSwitcherProps } from "@/utils/interface";
import React from "react";
import { useTranslation } from "@/context/I18nContext";

const TAB_KEY_MAP: Record<string, string> = {
  "Course Info": "dashboard.tabs.courseInfo",
  "course-info": "dashboard.tabs.courseInfo",
  "Lesson": "dashboard.tabs.lesson",
  "lesson": "dashboard.tabs.lesson",
  "Students": "dashboard.tabs.students",
  "students": "dashboard.tabs.students",
  "Batch": "dashboard.tabs.batch",
  "batch": "dashboard.tabs.batch",
  "Translations": "dashboard.tabs.translations",
  "translations": "dashboard.tabs.translations",
  "Active": "dashboard.tabs.active",
  "active": "dashboard.tabs.active",
  "Completed": "dashboard.tabs.completed",
  "completed": "dashboard.tabs.completed",
  "Courses": "dashboard.tabs.courses",
  "courses": "dashboard.tabs.courses",
  "Requested Demo": "dashboard.tabs.requestedDemo",
  "requested-demo": "dashboard.tabs.requestedDemo",
  "Announcement": "dashboard.tabs.announcements",
  "announcement": "dashboard.tabs.announcements",
  "Draft": "dashboard.tabs.draft",
  "draft": "dashboard.tabs.draft",
  "Ongoing": "dashboard.tabs.ongoing",
  "ongoing": "dashboard.tabs.ongoing",
  "Past": "dashboard.tabs.past",
  "past": "dashboard.tabs.past",
  "My Upcoming Classes": "dashboard.tabs.upcomingClasses",
  "upcoming": "dashboard.tabs.upcomingClasses",
  "Past Classes": "dashboard.tabs.pastClasses",
  "Student Info": "dashboard.tabs.studentInfo",
  "student-info": "dashboard.tabs.studentInfo",
  "Assignments": "dashboard.tabs.assignments",
  "assignments": "dashboard.tabs.assignments",
  "Quizzes": "dashboard.tabs.quizzes",
  "quizzes": "dashboard.tabs.quizzes",
  "Evaluations": "dashboard.tabs.evaluations",
  "evaluations": "dashboard.tabs.evaluations",
  "Score": "dashboard.tabs.score",
  "score": "dashboard.tabs.score",
  "Performance": "dashboard.tabs.performance",
  "performance": "dashboard.tabs.performance",
  "Overall Result": "dashboard.tabs.overallResult",
  "overall-result": "dashboard.tabs.overallResult",
  "Certificate": "dashboard.tabs.certificate",
  "certificate": "dashboard.tabs.certificate",
  "Members": "dashboard.tabs.members",
  "members": "dashboard.tabs.members",
  "Settings": "dashboard.tabs.settings",
  "settings": "dashboard.tabs.settings",
  "Questions": "dashboard.tabs.questions",
  "questions": "dashboard.tabs.questions",
  "My Certificates": "dashboard.tabs.myCertificates",
  "certificates": "dashboard.tabs.myCertificates",
  "Badges": "dashboard.tabs.badges",
  "badges": "dashboard.tabs.badges",
  "Current Assignment": "dashboard.tabs.currentAssignment",
  "current": "dashboard.tabs.currentAssignment",
  "Past Assignment": "dashboard.tabs.pastAssignment",
  "Assignments Details": "dashboard.tabs.assignmentDetails",
  "Class Annoucement": "dashboard.tabs.classAnnouncement",
  "annoucement": "dashboard.tabs.classAnnouncement",
  "Chat": "dashboard.tabs.chat",
  "chat": "dashboard.tabs.chat",
  "Quizzes Details": "dashboard.tabs.quizzesDetails",
};

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeKey,
  onChange,
  className = "",
  minWidth = "150px",
}) => {
  const { t } = useTranslation();

  const getLabel = (label: string, key?: string) => {
    const mapKey = TAB_KEY_MAP[label] || (key && TAB_KEY_MAP[key]);
    if (mapKey) {
      const trans = t(mapKey);
      if (trans && trans !== mapKey) return trans;
    }
    return label;
  };

  return (
    <div className={`rounded-[10px] bg-white p-[3px] border border-[#E4E7EC] shadow-2xs w-fit flex items-center ${className}`}>
      {tabs.map(({ key, label }) => {
        const isActive = key === activeKey;
        const activeClasses = "bg-primary !text-white font-semibold shadow-xs";
        const inactiveClasses = "text-[#475467] hover:text-[#101828] font-medium hover:bg-slate-50";
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            style={minWidth ? { minWidth } : undefined}
            className={`transition-all ease-in duration-200 whitespace-nowrap px-4 sm:px-8 py-2 rounded-[8px] cursor-pointer text-sm ${
              isActive ? activeClasses : inactiveClasses
            }`}
          >
            {getLabel(label, key)}
          </button>
        );
      })}
    </div>
  );
};

export default TabSwitcher;
