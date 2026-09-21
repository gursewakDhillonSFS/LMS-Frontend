"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumb, Skeleton, Modal, Form, Input } from "antd";
import {
  QuestionCircleOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import {
  getQuizDetailsApi,
  getQuizSubmissionsApi,
  gradeQuizSubmissionApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import QuillEditor from "@/components/QuillEditor";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import BadgeComponent from "@/components/BadgeComponent";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { QuizQuestionProp } from "@/modules/addQuizSteps/AddQuestionModal";

interface StudentAnswerRow {
  questionIndex: number;
  questionType: "mcq" | "essay";
  selectedOption: string;
  submittedText: string;
  isCorrect: boolean;
  obtainedMarks: number;
}

interface SubmissionRow {
  submission_id: string | null;
  student_id: string;
  name: string;
  email: string;
  avatar: string | null;
  dateOfSubmit: string;
  result: string;
  feedback: string | null;
  status: string;
  answers: StudentAnswerRow[];
}

interface QuizDetailsData {
  quiz_id: string;
  quizName: string;
  dueDate: string;
  quizType: string;
  overview: string;
  enableTimer: boolean;
  timer: string | null;
  courseName: string | null;
  batchName: string | null;
  questions: QuizQuestionProp[];
  submittedCount: number;
  totalMarks: number;
}

interface QuizDetailsViewProps {
  role: "instructor" | "teacher";
  baseQuizzesUrl: string;
}

export const QuizDetailsView: React.FC<QuizDetailsViewProps> = ({
  role,
  baseQuizzesUrl,
}) => {
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quiz_id") || searchParams.get("quizId") || "";
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";

  const [activeTab, setActiveTab] = useState<"questions" | "submissions">("questions");
  const [detail, setDetail] = useState<QuizDetailsData | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Active question accordion index
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(0);

  // Grading modal
  const [gradingSub, setGradingSub] = useState<SubmissionRow | null>(null);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeForm] = Form.useForm();
  const [gradeLoading, setGradeLoading] = useState(false);

  // Breadcrumb items
  const batchDetailsUrl = `${baseQuizzesUrl}/batch-details?course_id=${courseId}&batch_id=${batchId}`;
  const breadcrumbItems = [
    { title: "Quizzes", href: baseQuizzesUrl },
    { title: "Batch Details", href: batchDetailsUrl },
    { title: detail?.quizName || "Quiz Details" },
  ];

  // Fetch Quiz Meta Details
  useEffect(() => {
    if (!quizId) return;
    setDetailLoading(true);
    getQuizDetailsApi(quizId)
      .then((res) => {
        if (res?.status) {
          setDetail(res.data);
        }
      })
      .catch(() => toast.error("Failed to load quiz details"))
      .finally(() => setDetailLoading(false));
  }, [quizId]);

  // Fetch Submissions
  const fetchSubmissions = useCallback(async () => {
    if (!quizId) return;
    setSubmissionsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", String(page));
      query.append("limit", String(limit));
      if (search.trim()) query.append("search", search.trim());

      const res = await getQuizSubmissionsApi(quizId, query);
      if (res?.status) {
        setSubmissions(res.data?.list || []);
        setTotal(res.data?.total || 0);
      }
    } catch {
      toast.error("Failed to load quiz submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  }, [quizId, page, limit, search]);

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  // Handle Open Grade Modal
  const handleOpenGrade = (sub: SubmissionRow) => {
    setGradingSub(sub);
    gradeForm.setFieldsValue({
      result: sub.result === "Pending" ? "" : sub.result,
      feedback: sub.feedback || "",
    });
    setGradeModalOpen(true);
  };

  // Submit Grade
  const handleSaveGrade = async () => {
    if (!gradingSub?.submission_id) {
      toast.warning("No submission selected to grade");
      return;
    }
    try {
      const values = await gradeForm.validateFields();
      setGradeLoading(true);
      const res = await gradeQuizSubmissionApi({
        submissionId: gradingSub.submission_id,
        feedback: values.feedback,
        answers: gradingSub.answers?.map((ans) => ({
          questionIndex: ans.questionIndex,
          obtainedMarks: ans.obtainedMarks,
        })),
      });
      if (res?.status) {
        toast.success("Quiz graded successfully!");
        setGradeModalOpen(false);
        fetchSubmissions();
      } else {
        toast.error(res?.message || "Failed to grade quiz");
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setGradeLoading(false);
    }
  };

  const gradedCount = submissions.filter((s) => s.result && s.result !== "Pending").length;
  const questionsCount = detail?.questions?.length || 0;
  const totalCalculatedMarks =
    detail?.totalMarks ||
    detail?.questions?.reduce((acc, q) => acc + (Number(q.marks) || 1), 0) ||
    0;

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Header */}
      <Breadcrumb
        separator={<span className="text-slate-400 font-bold">{">"}</span>}
        items={breadcrumbItems.map((item) => ({
          title: item.href ? (
            <a href={item.href} className="text-slate-500 hover:text-[#315CFF] font-medium text-xs">
              {item.title}
            </a>
          ) : (
            <span className="text-slate-900 font-bold text-xs">{item.title}</span>
          ),
        }))}
      />

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
        {detailLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#315CFF]/10 text-[#315CFF] border border-[#315CFF]/20">
                  Quiz Assessment
                </span>
                {detail?.courseName && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {detail.courseName}
                  </span>
                )}
                {detail?.batchName && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    Batch: {detail.batchName}
                  </span>
                )}
                {detail?.quizType && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                    {detail.quizType}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {detail?.quizName || "Quiz Details"}
              </h1>
            </div>

            {/* Quick Stats Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                <CalendarOutlined className="text-[#315CFF]" />
                <span className="text-slate-400">Due:</span>
                <span>{detail?.dueDate || "No Due Date"}</span>
              </div>
              {detail?.enableTimer && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                  <ClockCircleOutlined className="text-amber-600" />
                  <span>Timer: {detail.timer || "30"} mins</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                <UsergroupAddOutlined className="text-blue-600" />
                <span>{detail?.submittedCount || 0} Submissions</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#315CFF] flex items-center justify-center text-xl shrink-0">
            <QuestionCircleOutlined />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Questions
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {questionsCount}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <TrophyOutlined />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Marks
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {totalCalculatedMarks} pts
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
            <UsergroupAddOutlined />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Submitted
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {detail?.submittedCount || 0}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <CheckCircleFilled />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Graded
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {gradedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "questions"
              ? "bg-[#315CFF] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Quiz Questions ({questionsCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "submissions"
              ? "bg-[#315CFF] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Student Submissions ({detail?.submittedCount || 0})
        </button>
      </div>

      {/* ── TAB 1: QUESTIONS ── */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {detail?.overview && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <QuestionCircleOutlined className="text-[#315CFF]" />
                <span>Quiz Instructions & Overview</span>
              </h2>
              <div className="text-slate-700 text-sm leading-relaxed pt-1">
                <QuillEditor readOnly value={detail.overview} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Questions Breakdown ({questionsCount})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review question configurations, answers, and assigned score weights.
              </p>
            </div>

            <div className="space-y-3">
              {detail?.questions?.map((q, idx) => {
                const isOpen = activeQuestionIndex === idx;
                const isEssay = q.questionType === "essay";
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "bg-white border-[#315CFF] shadow-xs ring-1 ring-[#315CFF]/20"
                        : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveQuestionIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-[#315CFF] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#315CFF]">
                              Question {idx + 1}
                            </span>
                            <span className="px-2 py-0.2 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                              {q.questionType || "MCQ"}
                            </span>
                            <span className="px-2 py-0.2 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700">
                              {q.marks || 1} Marks
                            </span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate mt-0.5">
                            {q.question || `Question ${idx + 1}`}
                          </h3>
                        </div>
                      </div>
                      <RightOutlined
                        className={`text-slate-400 text-xs transition-transform duration-200 ${
                          isOpen ? "rotate-90 text-[#315CFF]" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 space-y-4">
                        <div className="space-y-1.5 pt-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Question Prompt
                          </span>
                          <p className="text-slate-800 text-sm font-medium p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                            {q.question}
                          </p>
                        </div>

                        {!isEssay && q.options && q.options.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Options & Correct Answer
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect =
                                  String(q.correctAnswer) === String(oIdx) ||
                                  String(q.correctAnswer) === opt;
                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 ${
                                      isCorrect
                                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold"
                                        : "bg-slate-50 border-slate-200 text-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className="truncate">{opt}</span>
                                    </div>
                                    {isCorrect && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold shrink-0">
                                        Correct Answer
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SUBMISSIONS ── */}
      {activeTab === "submissions" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Submissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                View auto-graded quiz answers, update marks, and provide student feedback.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <SearchInput
                placeholder="Search student name or email..."
                search={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {submissionsLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <QuestionCircleOutlined className="text-4xl text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No quiz submissions found</p>
              <p className="text-xs text-slate-400">Submissions will appear here once students attempt this quiz.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Attempted Date</th>
                    <th className="py-3.5 px-4">Score / Marks</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {submissions.map((sub, idx) => {
                    const isEvaluated = sub.result && sub.result !== "Pending";
                    return (
                      <tr key={sub.submission_id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <UserAvatarDisplay
                            user={{
                              name: sub.name,
                              email: sub.email,
                              image: sub.avatar || undefined,
                            }}
                          />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {sub.dateOfSubmit ? new Date(sub.dateOfSubmit).toLocaleDateString() : "Pending"}
                        </td>
                        <td className="py-3.5 px-4">
                          {isEvaluated ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {sub.result}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <BadgeComponent status={sub.status || "Submitted"} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenGrade(sub)}
                            className="px-4 py-1.5 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <EditOutlined />
                            <span>{isEvaluated ? "Edit Grade" : "Grade / Review"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {total > limit && (
            <div className="flex justify-end pt-4">
              <Pagination
                page={page}
                setPage={setPage}
                limit={limit}
                total={total}
              />
            </div>
          )}
        </div>
      )}

      {/* Grade Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SafetyCertificateOutlined className="text-[#315CFF] text-lg" />
            <span className="font-bold text-lg text-slate-900">Grade Student Quiz</span>
          </div>
        }
        open={gradeModalOpen}
        onCancel={() => setGradeModalOpen(false)}
        footer={null}
        width={600}
        centered
        className="rounded-3xl"
      >
        <div className="py-2 space-y-4">
          {gradingSub && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Student
                </span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {gradingSub.name}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">{gradingSub.email}</span>
            </div>
          )}

          <Form form={gradeForm} layout="vertical" onFinish={handleSaveGrade} className="space-y-3">
            <Form.Item
              name="result"
              label={<span className="text-xs font-bold text-slate-700">Quiz Score / Grade (e.g. 85%, 18/20)</span>}
              rules={[{ required: true, message: "Please enter score or grade" }]}
            >
              <Input placeholder="e.g. 90% or 18/20" className="!py-2 !rounded-xl text-sm" />
            </Form.Item>

            <Form.Item
              name="feedback"
              label={<span className="text-xs font-bold text-slate-700">Instructor Feedback</span>}
            >
              <Input.TextArea
                rows={4}
                placeholder="Share feedback on quiz performance..."
                className="!rounded-xl text-sm"
              />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={gradeLoading}
                className="px-5 py-2 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {gradeLoading ? "Saving..." : "Save Grade"}
              </button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default QuizDetailsView;
