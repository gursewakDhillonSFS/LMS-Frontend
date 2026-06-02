"use client";
import React, { useState } from "react";
import { Switch } from "antd";
import { toast } from "react-toastify";

const steps = [
  { key: "All", value: "Receive All Notifications", desc: "Get all educational content and platform updates." },
  { key: "Announcement", value: "Class Announcements", desc: "Hear about latest course announcements from instructors." },
  { key: "LiveClasses", value: "Live Classes Scheduled", desc: "Receive immediate links when a live session is set up." },
  { key: "NewAssignments", value: "New Assignments Posted", desc: "Stay informed as soon as a new task is added." },
  { key: "AssignmentsReminder", value: "Assignments Reminders", desc: "Receive a friendly reminder before task deadlines." },
  { key: "NewQuizzes", value: "New Quizzes Published", desc: "Be alerted the second a test becomes active." },
  { key: "QuizzesReminder", value: "Quizzes Reminders", desc: "Get warned before quizzes close or expire." },
  { key: "Evaluations", value: "Evaluations & Feedback", desc: "Get notified when grades and comments are released." },
  { key: "Recommendation", value: "Personalized Recommendations", desc: "Smart topics suggestions based on your interests." },
];

const NotificationSettings = () => {
  const [emailSteps, setEmailSteps] = useState<string[]>(["All", "Announcement", "LiveClasses", "NewAssignments"]);

  const handleToggle = (key: string) => {
    setEmailSteps((prev) => {
      let nextSteps;
      if (prev.includes(key)) {
        nextSteps = prev.filter((item) => item !== key);
        toast.info(`Disabled notifications for ${steps.find(s => s.key === key)?.value}`);
      } else {
        nextSteps = [...prev, key];
        toast.success(`Enabled notifications for ${steps.find(s => s.key === key)?.value}`);
      }
      return nextSteps;
    });
  };

  return (
    <div className="w-full p-6 h-fit flex flex-col gap-4 bg-white rounded-xl">
      <div>
        <h2 className="text-[20px] font-bold plus-jakarta-sans pb-3 border-b border-[#C8C8C8]">
          Notification Settings
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Control how and when you receive email alerts, learning updates, and reminders from the LMS.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 mt-2">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`flex justify-between items-center py-4 ${
              index !== steps.length - 1 ? "border-b border-[#F0F0F0]" : ""
            }`}
          >
            <div className="flex flex-col gap-1 pr-4">
              <span className="font-semibold text-gray-800 text-[15px]">
                {step.value}
              </span>
              <span className="text-xs text-gray-400">
                {step.desc}
              </span>
            </div>
            <div className="cursor-pointer">
              <Switch
                checked={emailSteps.includes(step.key)}
                onChange={() => handleToggle(step.key)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
