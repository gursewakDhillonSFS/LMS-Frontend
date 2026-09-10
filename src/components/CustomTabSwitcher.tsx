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

export const CustomTabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeKey,
  onChange,
  className = "",
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
    <div className={`flex bg-white w-full items-start ${className}`}>
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`cursor-pointer w-[200px] relative px-4 py-2 text-sm font-medium transition-colors ${
            activeKey === key ? "text-[#3F27F0] font-semibold" : "text-black"
          }`}
        >
          {getLabel(label, key)}
          {activeKey === key && (
            <div className="absolute left-0 bottom-0 w-full h-1 bg-[#3F27F0] rounded-t-[16px]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default CustomTabSwitcher;
