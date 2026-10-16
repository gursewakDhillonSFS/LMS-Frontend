"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import CertificateCard from "@/components/CertificateCard";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { EvaluationTab } from "@/utils/constant";
import { EvaluationTabEnum } from "@/utils/enums";
import {
  getStudentEvaluationsApi,
  userCourseList,
  getMyCertificatesApi,
} from "@/services/collections";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  LoadingOutlined,
  LockOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Modal } from "antd";

interface EvaluationProps {
  courseId?: string;
  batchId?: string;
}

interface EvaluationItem {
  id: string;
  title: string;
  type: "Assignment" | "Quiz";
  description?: string;
  dueDate: string;
  status: string;
  submittedDate: string | null;
  score: number | null;
  totalMarks: number;
  feedback?: string | null;
}

interface EvaluationStats {
  totalItems: number;
  totalCompleted: number;
  gradedCount: number;
  averageScore: number;
  isPassed: boolean;
  resultRemark: string;
  certificateEligible: boolean;
  certificateCode?: string;
  courseProgress?: number;
}

const Evaluation: React.FC<EvaluationProps> = ({ courseId, batchId }) => {
  const [activeTab, setActiveTab] = useState<string>(EvaluationTabEnum?.PERFORMANCE);
  const [filterType, setFilterType] = useState<"ALL" | "Assignment" | "Quiz">("ALL");
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<EvaluationItem[]>([]);
  const [quizzes, setQuizzes] = useState<EvaluationItem[]>([]);
  const [stats, setStats] = useState<EvaluationStats>({
    totalItems: 0,
    totalCompleted: 0,
    gradedCount: 0,
    averageScore: 0,
    isPassed: false,
    resultRemark: "Not Started",
    certificateEligible: false,
  });

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [earnedCerts, setEarnedCerts] = useState<any[]>([]);

  // Selected item modal for feedback
  const [detailModalItem, setDetailModalItem] = useState<EvaluationItem | null>(null);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const [res, coursesRes, certsRes] = await Promise.allSettled([
        getStudentEvaluationsApi(courseId, batchId),
        userCourseList(new URLSearchParams()),
        getMyCertificatesApi(),
      ]);

      let coursesList: any[] = [];
      if (coursesRes.status === "fulfilled" && coursesRes.value?.status && coursesRes.value?.data?.courses) {
        coursesList = coursesRes.value.data.courses;
        setEnrolledCourses(coursesList);
      }

      let certList: any[] = [];
      if (certsRes.status === "fulfilled") {
        const cVal: any = certsRes.value;
        if (Array.isArray(cVal)) certList = cVal;
        else if (Array.isArray(cVal?.data)) certList = cVal.data;
        else if (Array.isArray(cVal?.data?.certificates)) certList = cVal.data.certificates;
        setEarnedCerts(certList);
      }

      if (res.status === "fulfilled" && res.value?.status && res.value?.data) {
        const assignList = res.value.data.assignments || [];
        const quizList = res.value.data.quizzes || [];
        setAssignments(assignList);
        setQuizzes(quizList);

        let initialStats = res.value.data.stats || {
          totalItems: assignList.length + quizList.length,
          totalCompleted: 0,
          gradedCount: 0,
          averageScore: 0,
          isPassed: false,
          resultRemark: "Not Started",
          certificateEligible: false,
        };

        // If course has no assignments/quizzes, check if student completed course lessons (100% progress)
        const currentCourse = coursesList.find((c: any) => String(c.course_id) === String(courseId));
        const isCurrentFinished = currentCourse ? (currentCourse.progress || 0) >= 100 : false;

        const lessonProgress = currentCourse?.progress || 0;
        const courseProgress =
          typeof initialStats.courseProgress === "number"
            ? initialStats.courseProgress
            : lessonProgress;

        if (isCurrentFinished || courseProgress >= 100) {
          initialStats = {
            ...initialStats,
            courseProgress: 100,
            isPassed: true,
            certificateEligible: true,
            resultRemark: "Pass",
            averageScore: initialStats.averageScore > 0 ? initialStats.averageScore : 100,
          };
        } else {
          initialStats = {
            ...initialStats,
            courseProgress,
            isPassed: false,
            certificateEligible: false,
            resultRemark:
              courseProgress > 0 || initialStats.totalCompleted > 0
                ? "In Progress"
                : "Not Started",
          };
        }

        setStats(initialStats);
      }
    } catch (err) {
      console.error("Failed to load evaluations:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, batchId]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const allItems = useMemo(() => {
    return [...assignments, ...quizzes];
  }, [assignments, quizzes]);

  const filteredItems = useMemo(() => {
    if (filterType === "ALL") return allItems;
    return allItems.filter((item) => item.type === filterType);
  }, [allItems, filterType]);

  const currentEnrollment = enrolledCourses.find(
    (course) => String(course.course_id) === String(courseId)
  );
  const courseProgress = Math.max(
    stats.courseProgress ?? 0,
    currentEnrollment?.progress || 0
  );
  const standing =
    courseProgress >= 100 || stats.isPassed
      ? "passed"
      : courseProgress > 0 || stats.totalCompleted > 0
      ? "progress"
      : "not-started";
  const completedCourseIds = useMemo(
    () =>
      new Set(
        enrolledCourses
          .filter((course) => (course.progress || 0) >= 100)
          .map((course) => String(course.course_id))
      ),
    [enrolledCourses]
  );
  const visibleCerts = earnedCerts.filter((cert) =>
    completedCourseIds.has(String(cert.course_id))
  );

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      {/* Tab Switcher */}
      <CustomTabSwitcher
        activeKey={activeTab}
        onChange={setActiveTab}
        tabs={EvaluationTab}
        className="rounded-xl px-1 pt-2 shadow-xs bg-white border border-gray-100"
      />

      {/* Detail & Feedback Modal */}
      {detailModalItem && (
        <Modal
          open={!!detailModalItem}
          onCancel={() => setDetailModalItem(null)}
          footer={null}
          centered
          width={520}
        >
          <div className="p-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold text-white ${
                  detailModalItem.type === "Quiz" ? "bg-emerald-600" : "bg-purple-600"
                }`}
              >
                {detailModalItem.type}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Status: {detailModalItem.status}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">{detailModalItem.title}</h3>
              {detailModalItem.description && (
                <p className="text-xs text-gray-600 mt-1">{detailModalItem.description}</p>
              )}
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl flex items-center justify-between border border-gray-100">
              <div>
                <span className="text-xs text-gray-400 block">Marks Obtained</span>
                <span className="text-lg font-extrabold text-secondary">
                  {detailModalItem.score !== null ? detailModalItem.score : "--"} /{" "}
                  {detailModalItem.totalMarks}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Submitted On</span>
                <span className="text-xs font-semibold text-gray-700">
                  {detailModalItem.submittedDate || "Not submitted"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Instructor Feedback & Remarks
              </h4>
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
                {detailModalItem.feedback ||
                  "No detailed remarks provided for this submission yet. Keep up the good work!"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDetailModalItem(null)}
              className="mt-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* TAB 1: PERFORMANCE */}
      {activeTab === EvaluationTabEnum?.PERFORMANCE && (
        <div className="flex flex-col gap-5">
          {/* Top KPI Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-secondary flex items-center justify-center font-bold text-xl">
                <TrophyOutlined />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">Average Grade</span>
                <p className="text-xl font-extrabold text-gray-900">{stats.averageScore ?? 0}%</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
                <FileTextOutlined />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">Completed / Total</span>
                <p className="text-xl font-extrabold text-gray-900">
                  {stats.totalCompleted} <span className="text-xs text-gray-400 font-normal">/ {stats.totalItems}</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                  stats.isPassed
                    ? "bg-emerald-50 text-emerald-600"
                    : stats.totalCompleted === 0
                    ? "bg-gray-50 text-gray-500"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {stats.isPassed ? <CheckCircleFilled /> : <InfoCircleOutlined />}
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">Evaluation Status</span>
                <p className="text-xl font-extrabold text-gray-900">
                  {stats.isPassed ? "Passing" : stats.totalCompleted === 0 ? "Not Started" : "In Progress"}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                filterType === "ALL"
                  ? "bg-secondary text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All Items ({allItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("Assignment")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                filterType === "Assignment"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <FileTextOutlined className="text-[10px]" />
              Assignments ({assignments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("Quiz")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                filterType === "Quiz"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <QuestionCircleOutlined className="text-[10px]" />
              Quizzes ({quizzes.length})
            </button>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <LoadingOutlined spin className="text-secondary text-2xl" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-2">
              <FileTextOutlined className="text-2xl text-gray-400" />
              <p className="font-semibold text-sm text-gray-700">No Evaluations Found</p>
              <p className="text-xs text-gray-400">
                Coursework and quizzes submitted will appear here along with scores and instructor remarks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isQuiz = item.type === "Quiz";
                const isSubmitted = item.status !== "Not Started";

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold text-white ${
                            isQuiz ? "bg-emerald-600" : "bg-purple-600"
                          }`}
                        >
                          {item.type}
                        </span>

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            item.score !== null
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isSubmitted
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {item.score !== null
                            ? "Graded"
                            : isSubmitted
                            ? "Submitted"
                            : "Pending"}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-1">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClockCircleOutlined />
                          {item.submittedDate
                            ? `Submitted: ${item.submittedDate}`
                            : `Due: ${item.dueDate}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-gray-500 font-medium">Score:</span>
                        <span className="text-base font-extrabold text-gray-900">
                          {item.score !== null ? (
                            <span className="text-secondary font-black">
                              {item.score}
                              <span className="text-xs text-gray-400 font-normal">
                                /{item.totalMarks}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Pending Grade</span>
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDetailModalItem(item)}
                        className="px-3.5 py-1.5 rounded-xl border border-secondary/30 text-secondary hover:bg-secondary hover:text-white font-semibold text-xs transition cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OVERALL RESULT */}
      {activeTab === EvaluationTabEnum?.OVERALL_RESULT && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Overall Pass/Fail Hero Card */}
            <div
              className={`rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 border shadow-sm ${
                standing === "passed"
                  ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 border-emerald-200"
                  : standing === "not-started"
                  ? "bg-gradient-to-br from-gray-50 via-white to-gray-100/60 border-gray-200"
                  : "bg-gradient-to-br from-blue-50 via-white to-blue-100/40 border-blue-200"
              }`}
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-md ${
                  standing === "passed"
                    ? "bg-emerald-500 text-white shadow-emerald-200"
                    : standing === "not-started"
                    ? "bg-gray-400 text-white shadow-gray-200"
                    : "bg-[#315CFF] text-white shadow-blue-200"
                }`}
              >
                {standing === "passed" ? (
                  <CheckCircleFilled />
                ) : (
                  <ClockCircleOutlined />
                )}
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Academic Standing
                </span>
                <h2 className="text-3xl font-black text-gray-900 mt-0.5">
                  {standing === "passed"
                    ? "PASSED"
                    : standing === "progress"
                    ? "IN PROGRESS"
                    : "NOT STARTED"}
                </h2>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/80 border border-gray-200 text-gray-700 shadow-xs">
                  Course progress: {courseProgress}%
                </span>
              </div>
            </div>

            {/* Performance Remarks & Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-gray-900">Academic Remark & Progress</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {standing === "passed"
                    ? "This course is complete. Your certificate is available below once it has been issued."
                    : standing === "progress"
                    ? `You have finished ${courseProgress}% of this course. Keep going through the remaining lessons. A certificate is issued only when the course reaches 100%.`
                    : "You have not started this course yet. Open a lesson to begin. A certificate is issued only after the course is fully complete."}
                </p>
              </div>

            {/* Requirement Checklist */}
              <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Course completion</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      courseProgress >= 100 ? "text-emerald-600" : "text-[#315CFF]"
                    }`}
                  >
                    {courseProgress >= 100 ? <CheckCircleFilled /> : <ClockCircleOutlined />}
                    {courseProgress}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Completed Work</span>
                  <span className="font-semibold text-gray-800">
                    {stats.totalCompleted} / {stats.totalItems} items
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* All Enrolled Courses Progress & Status */}
          {enrolledCourses.length > 0 && (
            <div className="flex flex-col gap-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">
                  All Enrolled Courses Status ({enrolledCourses.length})
                </h3>
                <span className="text-xs font-semibold text-gray-500">
                  {enrolledCourses.filter((c: any) => (c.progress || 0) >= 100).length} Completed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {enrolledCourses.map((c: any) => {
                  const isDone = (c.progress || 0) >= 100;
                  return (
                    <div
                      key={c.course_id}
                      className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                            {c.title || c.course_name || "Course"}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                              isDone
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {isDone ? "Completed" : "In Progress"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {c.teacher_name ? `By ${c.teacher_name}` : "Enrolled"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span>Progress</span>
                          <span>{c.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isDone ? "bg-emerald-500" : "bg-[#315CFF]"
                            }`}
                            style={{ width: `${Math.min(100, c.progress || 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certificate Section */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg text-gray-900">Earned Certificates</h3>

            {visibleCerts.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <TrophyOutlined className="text-lg" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">
                      Congratulations! You've Earned Accredited Credentials
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Your completed courses and coursework meet graduation criteria. Verified certificates are unlocked below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleCerts.map((cert: any, idx: number) => (
                    <CertificateCard
                      key={cert.certificate_id || idx}
                      title={cert.course_name || "Course Completion Certificate"}
                      code={cert.certificate_code}
                      marksObtained={cert.marks_obtained}
                      totalMarks={cert.total_marks}
                      percentage={cert.percentage}
                      grade={cert.grade || "Completed"}
                      instructorName={cert.instructor_name}
                      studentName={cert.student_name}
                      issuedDate={cert.issued_at}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white border border-gray-200/80 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 text-xl">
                  <LockOutlined />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-sm text-gray-800">Certificate Locked</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Complete 100% of video lessons, coursework, and quizzes in your enrolled courses to automatically unlock your verified certificate.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluation;
