"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Breadcrumb, Spin, Skeleton } from "antd";
import {
  CheckCircleFilled,
  LeftOutlined,
  RightOutlined,
  PlayCircleFilled,
  FilePdfOutlined,
  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import QuillEditor from "@/components/QuillEditor";
import CommonButton from "@/components/CommonButton";
import {
  getLessonsWithSublessonsApi,
  getCourseProgressApi,
  markMaterialCompleteApi,
  getCourseInfoApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import { RoutePaths } from "@/utils/enums";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface StudyMaterial {
  file_url: string;
  file_name: string;
  file_type: string;
}

interface Sublesson {
  sublesson_id: string;
  sublesson_name: string;
  sublesson_description?: string;
  studyMaterials?: StudyMaterial[];
}

interface Lesson {
  lesson_id: string;
  lesson_name: string;
  lesson_description?: string;
  week?: number;
  sublessons?: Sublesson[];
  studyMaterials?: StudyMaterial[];
}

interface FlatTaskItem {
  id: string;
  title: string;
  lessonId: string;
  lessonName: string;
  sublessonId?: string;
  sublessonName?: string;
  week: number;
  fileUrl: string;
  fileType: string; // "video" | "pdf" | "document"
  description?: string;
}

const LessonViewContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = searchParams.get("courseId") || searchParams.get("course_id") || "";
  const batchId = searchParams.get("batchId") || searchParams.get("batch_id") || "";
  const initialLessonId = searchParams.get("lessonId") || searchParams.get("lesson_id") || "";
  const initialMaterialUrl = searchParams.get("materialUrl") || searchParams.get("material_url") || "";

  const [courseName, setCourseName] = useState<string>("Course");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedMaterials, setCompletedMaterials] = useState<Set<string>>(new Set());
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [markingComplete, setMarkingComplete] = useState(false);

  // PDF Viewer state
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch course info, lessons, and student progress
  const loadData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [lessonsRes, progressRes, infoRes] = await Promise.all([
        getLessonsWithSublessonsApi(courseId),
        batchId ? getCourseProgressApi(courseId, batchId) : Promise.resolve(null),
        getCourseInfoApi(courseId),
      ]);

      if (infoRes?.status && infoRes?.data?.course?.course_name) {
        setCourseName(infoRes.data.course.course_name);
      }

      if (lessonsRes?.status) {
        setLessons(lessonsRes.data?.lessons || []);
      }

      if (progressRes?.status && progressRes?.data) {
        setCompletedMaterials(new Set(progressRes.data.completed_materials || []));
      }
    } catch {
      toast.error("Failed to load lesson content");
    } finally {
      setLoading(false);
    }
  }, [courseId, batchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build a flat sequential array of all tasks/materials in curriculum order
  const allTasks: FlatTaskItem[] = useMemo(() => {
    const tasks: FlatTaskItem[] = [];
    (lessons || []).forEach((lesson) => {
      const week = lesson.week || 1;

      // 1. Direct lesson materials
      (lesson.studyMaterials || []).forEach((mat, idx) => {
        tasks.push({
          id: `${lesson.lesson_id}-mat-${idx}`,
          title: mat.file_name || `${lesson.lesson_name} - Material ${idx + 1}`,
          lessonId: lesson.lesson_id,
          lessonName: lesson.lesson_name,
          week,
          fileUrl: mat.file_url,
          fileType: mat.file_type || (mat.file_url?.endsWith(".pdf") ? "pdf" : "video"),
          description: lesson.lesson_description,
        });
      });

      // 2. Sublesson materials
      (lesson.sublessons || []).forEach((sub) => {
        (sub.studyMaterials || []).forEach((mat, idx) => {
          tasks.push({
            id: `${sub.sublesson_id}-mat-${idx}`,
            title: mat.file_name || `${sub.sublesson_name} - Material ${idx + 1}`,
            lessonId: lesson.lesson_id,
            lessonName: lesson.lesson_name,
            sublessonId: sub.sublesson_id,
            sublessonName: sub.sublesson_name,
            week,
            fileUrl: mat.file_url,
            fileType: mat.file_type || (mat.file_url?.endsWith(".pdf") ? "pdf" : "video"),
            description: sub.sublesson_description || lesson.lesson_description,
          });
        });
      });
    });
    return tasks;
  }, [lessons]);

  // Set initial task index based on URL params
  useEffect(() => {
    if (allTasks.length === 0) return;

    if (initialMaterialUrl) {
      const foundIdx = allTasks.findIndex((t) => t.fileUrl === initialMaterialUrl);
      if (foundIdx !== -1) {
        setCurrentTaskIndex(foundIdx);
        return;
      }
    }

    if (initialLessonId) {
      const foundIdx = allTasks.findIndex((t) => t.lessonId === initialLessonId);
      if (foundIdx !== -1) {
        setCurrentTaskIndex(foundIdx);
        return;
      }
    }

    setCurrentTaskIndex(0);
  }, [allTasks, initialMaterialUrl, initialLessonId]);

  const currentTask = allTasks[currentTaskIndex] || null;
  const isCurrentCompleted = currentTask ? completedMaterials.has(currentTask.fileUrl) : false;
  const hasPrevious = currentTaskIndex > 0;
  const hasNext = currentTaskIndex < allTasks.length - 1;
  const previousTask = hasPrevious ? allTasks[currentTaskIndex - 1] : null;
  const nextTask = hasNext ? allTasks[currentTaskIndex + 1] : null;

  // Mark task complete
  const handleMarkComplete = async () => {
    if (!currentTask || isCurrentCompleted || markingComplete) return;
    setMarkingComplete(true);
    try {
      await markMaterialCompleteApi({
        material_url: currentTask.fileUrl,
        course_id: courseId,
        batch_id: batchId,
      });
      const updated = new Set([...completedMaterials, currentTask.fileUrl]);
      setCompletedMaterials(updated);

      // Check if all tasks in the course are now completed
      const allCompleted = allTasks.length > 0 && allTasks.every((t) => updated.has(t.fileUrl));

      if (allCompleted) {
        toast.success("🎉 All lessons completed! Redirecting back to course details...");
        setTimeout(() => {
          router.push(
            `/my-courses/course-details?course_id=${encodeURIComponent(courseId)}&batch_id=${encodeURIComponent(batchId)}`
          );
        }, 1500);
      } else {
        toast.success(`"${currentTask.title}" marked as completed! 🎉`);
      }
    } catch {
      toast.error("Failed to mark task complete. Please try again.");
    } finally {
      setMarkingComplete(false);
    }
  };

  // Switch to another task
  const navigateToTask = (idx: number) => {
    if (idx < 0 || idx >= allTasks.length) return;
    setCurrentTaskIndex(idx);
    setPageNumber(1);
    // Update browser URL without reloading
    const nextItem = allTasks[idx];
    if (nextItem) {
      const newUrl = `/my-courses/course-details/lesson-view?courseId=${encodeURIComponent(courseId)}&batchId=${encodeURIComponent(batchId)}&lessonId=${encodeURIComponent(nextItem.lessonId)}&materialUrl=${encodeURIComponent(nextItem.fileUrl)}`;
      window.history.replaceState(null, "", newUrl);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Spin size="large" />
          <p className="text-sm font-semibold text-slate-600">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* ── Top Header & Breadcrumbs ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumb Navigation with Back Button */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/my-courses/course-details?course_id=${encodeURIComponent(courseId)}&batch_id=${encodeURIComponent(batchId)}`
                )
              }
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Back to Course Details"
            >
              <LeftOutlined />
              <span className="hidden sm:inline">Back to Course</span>
            </button>

            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Link
                  href={RoutePaths.MyCourses}
                  className="hover:text-[#315CFF] flex items-center gap-1 transition-colors"
                >
                  <HomeOutlined />
                  <span>My Courses</span>
                </Link>
                <span>/</span>
                <Link
                  href={`/my-courses/course-details?course_id=${encodeURIComponent(courseId)}&batch_id=${encodeURIComponent(batchId)}`}
                  className="hover:text-[#315CFF] truncate max-w-[140px] sm:max-w-[220px] transition-colors"
                >
                  {courseName}
                </Link>
                <span>/</span>
                <span className="text-slate-900 font-bold truncate max-w-[140px]">
                  {currentTask?.lessonName || "Lesson View"}
                </span>
              </div>

              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {currentTask?.title || "Lesson Task"}
              </h1>
            </div>
          </div>

          {/* Header Badges & Progress Count */}
          <div className="flex items-center gap-3 shrink-0">
            {currentTask && (
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#315CFF] text-xs font-bold">
                Week {currentTask.week} · Task {currentTaskIndex + 1} of {allTasks.length}
              </span>
            )}

            {isCurrentCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircleFilled className="text-emerald-500" />
                <span>Completed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                <ClockCircleOutlined className="text-slate-400" />
                <span>In Progress</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {!currentTask ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <BookOutlined className="text-4xl text-slate-300" />
            <h2 className="text-lg font-bold text-slate-800">No Task Found</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no tasks or study materials available for this lesson.
            </p>
            <Link
              href={`/my-courses/course-details?course_id=${encodeURIComponent(courseId)}&batch_id=${encodeURIComponent(batchId)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#315CFF] text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
            >
              Return to Curriculum
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Media Viewer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                {currentTask.fileType === "video" ? (
                  <div className="w-full bg-slate-950 flex flex-col items-center justify-center relative">
                    <video
                      ref={videoRef}
                      src={currentTask.fileUrl}
                      controls
                      onEnded={handleMarkComplete}
                      className="w-full max-h-[70vh] aspect-video object-contain"
                      style={{ outline: "none" }}
                      controlsList="nodownload"
                    />
                    <div className="w-full py-2 px-4 bg-slate-900/90 text-slate-400 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <PlayCircleFilled className="text-[#315CFF]" />
                        <span>Video Lecture</span>
                      </span>
                      <span className="text-[11px]">
                        {isCurrentCompleted ? "✓ Finished" : "Finishing video will mark it complete"}
                      </span>
                    </div>
                  </div>
                ) : currentTask.fileType === "pdf" ? (
                  <div className="p-4 sm:p-6 flex flex-col items-center gap-4 bg-slate-100">
                    <div
                      className="w-full overflow-y-auto rounded-2xl flex justify-center bg-white shadow-xs p-4 border border-slate-200"
                      style={{ maxHeight: "72vh" }}
                    >
                      <Document
                        file={currentTask.fileUrl}
                        onLoadSuccess={({ numPages }) => {
                          setNumPages(numPages);
                          setPageNumber(1);
                        }}
                        loading={
                          <div className="p-12 text-center">
                            <Spin size="large" />
                            <p className="text-xs text-slate-500 mt-2">Loading document...</p>
                          </div>
                        }
                        error={
                          <div className="p-8 text-center text-red-500 text-xs">
                            Failed to load PDF document. Please check the URL or try reloading.
                          </div>
                        }
                      >
                        <Page pageNumber={pageNumber} width={750} />
                      </Document>
                    </div>

                    {/* PDF Page Navigation Bar */}
                    {numPages && (
                      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
                        <CommonButton
                          text="Prev Page"
                          onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                          disable={pageNumber <= 1}
                          className="!px-3 !py-1 !h-8 !text-xs !bg-slate-100 !text-slate-700"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          Page {pageNumber} of {numPages}
                        </span>
                        <CommonButton
                          text="Next Page"
                          onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
                          disable={pageNumber >= numPages}
                          className="!px-3 !py-1 !h-8 !text-xs !bg-slate-100 !text-slate-700"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 flex flex-col items-center justify-center gap-3">
                    <FileTextOutlined className="text-4xl text-[#315CFF]" />
                    <h3 className="text-base font-bold text-slate-800">{currentTask.title}</h3>
                    <a
                      href={currentTask.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#315CFF] text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
                    >
                      Open Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Details & Curriculum Task Sequence */}
            <div className="space-y-4">
              {/* Task Details Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#315CFF] bg-[#315CFF]/10 px-2 py-0.5 rounded-md">
                    Lesson Details
                  </span>
                  <h2 className="text-base font-bold text-slate-900 pt-1">
                    {currentTask.lessonName}
                  </h2>
                  {currentTask.sublessonName && (
                    <p className="text-xs text-slate-600 font-medium">
                      Subtopic: {currentTask.sublessonName}
                    </p>
                  )}
                </div>

                {currentTask.description && (
                  <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    <QuillEditor readOnly value={currentTask.description} />
                  </div>
                )}
              </div>

              {/* Course Task List / Playlist */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Course Tasks ({allTasks.length})
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {completedMaterials.size} Completed
                  </span>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {allTasks.map((t, idx) => {
                    const isSelected = idx === currentTaskIndex;
                    const isDone = completedMaterials.has(t.fileUrl);

                    return (
                      <div
                        key={t.id}
                        onClick={() => navigateToTask(idx)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50/80 border-[#315CFF] shadow-2xs"
                            : "bg-slate-50/60 border-slate-100 hover:bg-slate-100/70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isDone
                                ? "bg-emerald-100 text-emerald-700"
                                : isSelected
                                ? "bg-[#315CFF] text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isDone ? <CheckCircleFilled /> : idx + 1}
                          </span>
                          <span
                            className={`text-xs font-medium truncate ${
                              isSelected ? "font-bold text-[#315CFF]" : "text-slate-800"
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>

                        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                          W{t.week}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Navigation Toolbar (Required 3 Buttons) ───────────────────── */}
      <footer className="sticky bottom-0 z-30 bg-white border-t border-slate-200/90 shadow-lg px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left Button: Previous Task */}
          <button
            type="button"
            onClick={() => hasPrevious && navigateToTask(currentTaskIndex - 1)}
            disabled={!hasPrevious}
            className={`py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              hasPrevious
                ? "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 shadow-2xs"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
            }`}
          >
            <LeftOutlined />
            <span className="hidden sm:inline">
              {previousTask ? `Prev: ${previousTask.title}` : "Previous Task"}
            </span>
            <span className="sm:hidden">Previous</span>
          </button>

          {/* Center Button: Mark as Completed */}
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={!currentTask || isCurrentCompleted || markingComplete}
            className={`py-2.5 px-6 sm:px-8 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${
              isCurrentCompleted
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default"
                : "bg-[#0F172A] hover:bg-slate-800 text-white cursor-pointer shadow-md hover:shadow-lg"
            }`}
          >
            {isCurrentCompleted ? (
              <>
                <CheckCircleFilled className="text-emerald-600 text-base" />
                <span>Completed</span>
              </>
            ) : markingComplete ? (
              <>
                <Spin size="small" />
                <span>Marking Complete...</span>
              </>
            ) : (
              <>
                <CheckCircleFilled className="text-emerald-400" />
                <span>Mark as Completed</span>
              </>
            )}
          </button>

          {/* Right Button: Next Task or Finish Course */}
          {hasNext ? (
            <button
              type="button"
              onClick={() => navigateToTask(currentTaskIndex + 1)}
              className="py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer bg-[#315CFF] hover:bg-blue-700 text-white shadow-2xs"
            >
              <span className="hidden sm:inline">
                {nextTask ? `Next: ${nextTask.title}` : "Next Task"}
              </span>
              <span className="sm:hidden">Next</span>
              <RightOutlined />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/my-courses/course-details?course_id=${encodeURIComponent(courseId)}&batch_id=${encodeURIComponent(batchId)}`
                )
              }
              className="py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
            >
              <span>Back to Course Details</span>
              <RightOutlined />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default function LessonViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <Spin size="large" />
        </div>
      }
    >
      <LessonViewContent />
    </Suspense>
  );
}
