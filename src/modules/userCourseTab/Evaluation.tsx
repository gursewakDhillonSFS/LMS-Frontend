"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import CertificateCard from "@/components/CertificateCard";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { EvaluationTab } from "@/utils/constant";
import { EvaluationTabEnum } from "@/utils/enums";
import { getStudentEvaluationsApi } from "@/services/collections";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  LoadingOutlined,
  LockOutlined,
  CloseCircleFilled,
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

  // Selected item modal for feedback
  const [detailModalItem, setDetailModalItem] = useState<EvaluationItem | null>(null);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentEvaluationsApi(courseId, batchId);
      if (res?.status && res?.data) {
        setAssignments(res.data.assignments || []);
        setQuizzes(res.data.quizzes || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
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
                <p className="text-xl font-extrabold text-gray-900">{stats.averageScore}%</p>
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
                stats.isPassed
                  ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 border-emerald-200"
                  : stats.totalCompleted === 0
                  ? "bg-gradient-to-br from-gray-50 via-white to-gray-100/60 border-gray-200"
                  : "bg-gradient-to-br from-amber-50 via-white to-amber-100/40 border-amber-200"
              }`}
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-md ${
                  stats.isPassed
                    ? "bg-emerald-500 text-white shadow-emerald-200"
                    : stats.totalCompleted === 0
                    ? "bg-gray-400 text-white shadow-gray-200"
                    : "bg-amber-500 text-white shadow-amber-200"
                }`}
              >
                {stats.isPassed ? (
                  <CheckCircleFilled />
                ) : stats.totalCompleted === 0 ? (
                  <ClockCircleOutlined />
                ) : (
                  <CloseCircleFilled />
                )}
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Academic Standing
                </span>
                <h2 className="text-3xl font-black text-gray-900 mt-0.5">
                  {stats.isPassed
                    ? "PASSED"
                    : stats.totalCompleted === 0
                    ? "NOT STARTED"
                    : "IN PROGRESS"}
                </h2>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/80 border border-gray-200 text-gray-700 shadow-xs">
                  Overall Grade: {stats.averageScore}%
                </span>
              </div>
            </div>

            {/* Performance Remarks & Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-gray-900">Academic Remark & Progress</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {stats.isPassed
                    ? `Great job! You have achieved an average score of ${stats.averageScore}% across your coursework and quizzes, demonstrating a solid mastery of the material.`
                    : stats.totalCompleted === 0
                    ? "You haven't completed any assignments or quizzes for this course yet. Complete your first assignment to begin tracking your academic performance."
                    : `You have submitted ${stats.totalCompleted} of ${stats.totalItems} requirements with an average score of ${stats.averageScore}%. Continue working through remaining tasks to qualify for your certificate.`}
                </p>
              </div>

              {/* Requirement Checklist */}
              <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Passing Grade (50%+)</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      stats.averageScore >= 50 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {stats.averageScore >= 50 ? <CheckCircleFilled /> : <ClockCircleOutlined />}
                    {stats.averageScore}%
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

          {/* Certificate Section */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg text-gray-900">Course Certificate</h3>

            {stats.certificateEligible ? (
              <div className="flex flex-col gap-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <TrophyOutlined className="text-lg" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">
                      Congratulations! You've Earned Your Certificate
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Your coursework and quizzes meet all graduation criteria. You can view and download your verified credential below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CertificateCard
                    title="Certificate of Course Completion"
                    code={`CERT-${courseId ? courseId.slice(-6).toUpperCase() : "LMS992"}`}
                  />
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
                    Complete at least 70% of all assignments and quizzes with a minimum 50% passing grade to unlock your verified certificate.
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
