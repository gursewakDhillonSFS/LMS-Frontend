"use client";

import Course from "@/modules/userCourseTab/Course";
import CourseAssignments from "@/modules/userCourseTab/CourseAssignments";
import CourseLiveClasses from "@/modules/userCourseTab/CourseLiveClasses";
import CourseQuizzes from "@/modules/userCourseTab/CourseQuizzes";
import Evaluation from "@/modules/userCourseTab/Evaluation";
import { getCourseInfoApi, userCourseList } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

type ClassroomSection = "lessons" | "assignments" | "quizzes" | "live" | "progress";

const sections: { key: ClassroomSection; label: string }[] = [
  { key: "lessons", label: "Lessons" },
  { key: "assignments", label: "Assignments" },
  { key: "quizzes", label: "Quizzes" },
  { key: "live", label: "Live classes" },
  { key: "progress", label: "Progress" },
];

const ClassroomContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCourseId = searchParams.get("course_id") || searchParams.get("courseId") || "";
  const urlBatchId = searchParams.get("batch_id") || searchParams.get("batchId") || "";
  const requestedSection = searchParams.get("section") as ClassroomSection | null;

  const [courseId, setCourseId] = useState(urlCourseId);
  const [batchId, setBatchId] = useState(urlBatchId);
  const [courseName, setCourseName] = useState("Course");
  const [section, setSection] = useState<ClassroomSection>(
    sections.some((item) => item.key === requestedSection) ? requestedSection || "lessons" : "lessons"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await userCourseList(new URLSearchParams());
        const enrolled = res?.status && Array.isArray(res?.data?.courses) ? res.data.courses : [];
        const matched = urlCourseId
          ? enrolled.find((course: { course_id: string }) => course.course_id === urlCourseId)
          : enrolled[0];

        const resolvedCourseId = matched?.course_id || urlCourseId;
        const resolvedBatchId = urlBatchId || matched?.batch_id || "";
        setCourseId(resolvedCourseId);
        setBatchId(resolvedBatchId);
        setCourseName(matched?.course_name || "Course");

        if (resolvedCourseId && !matched?.course_name) {
          const info = await getCourseInfoApi(resolvedCourseId);
          const name = info?.data?.course?.course_name || info?.data?.course_name;
          if (name) setCourseName(name);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [urlCourseId, urlBatchId]);

  const selectSection = (next: ClassroomSection) => {
    setSection(next);
    const params = new URLSearchParams();
    if (courseId) params.set("course_id", courseId);
    if (batchId) params.set("batch_id", batchId);
    params.set("section", next);
    window.history.replaceState(null, "", `${RoutePaths.Learn}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
          <button
            type="button"
            onClick={() => router.push(RoutePaths.MyCourses)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <ArrowLeftOutlined />
            <span>Exit</span>
          </button>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">Classroom</p>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{courseName}</h1>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 sm:px-6 pb-3">
          {sections.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => selectSection(item.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold cursor-pointer ${
                section === item.key
                  ? "bg-[#315CFF] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <Spin size="large" />
          </div>
        ) : !courseId ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <h2 className="text-lg font-bold text-slate-800">No course selected</h2>
            <p className="text-sm text-slate-500 mt-2">Enroll in a course, then open it from My Courses.</p>
          </div>
        ) : (
          <>
            {section === "lessons" && <Course courseId={courseId} batchId={batchId} />}
            {section === "assignments" && (
              <CourseAssignments courseId={courseId} batchId={batchId} />
            )}
            {section === "quizzes" && <CourseQuizzes courseId={courseId} batchId={batchId} />}
            {section === "live" && <CourseLiveClasses courseId={courseId} batchId={batchId} />}
            {section === "progress" && <Evaluation courseId={courseId} batchId={batchId} />}
          </>
        )}
      </main>
    </div>
  );
};

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <ClassroomContent />
    </Suspense>
  );
}
