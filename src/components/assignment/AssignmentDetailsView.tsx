"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumb, Skeleton, Modal, Form, Input } from "antd";
import {
  FileTextOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  RightOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAssignmentDetailsApi,
  getAssignmentSubmissionsApi,
  gradeSubmissionApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import QuillEditor from "@/components/QuillEditor";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import BadgeComponent from "@/components/BadgeComponent";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";

interface SubmissionRow {
  submission_id: string | null;
  student_id: string;
  name: string;
  email: string;
  avatar: string | null;
  submittedText: string | null;
  dateOfSubmit: string;
  result: string;
  feedback: string | null;
  status: string;
}

interface AssignmentDetail {
  assignment_id: string;
  assignmentName: string;
  dueDate: string;
  overview: string;
  projects: { projectName: string; description: string; objectives: string[] }[];
  submittedCount: number;
  courseName: string | null;
  batchName: string | null;
}

interface AssignmentDetailsViewProps {
  role: "instructor" | "teacher";
  baseAssignmentsUrl: string;
}

export const AssignmentDetailsView: React.FC<AssignmentDetailsViewProps> = ({
  role,
  baseAssignmentsUrl,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = searchParams.get("assignment_id") || searchParams.get("assignmentId") || "";
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";

  const [activeTab, setActiveTab] = useState<"details" | "submissions">("details");
  const [detail, setDetail] = useState<AssignmentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Active project accordion index
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(0);

  // Evaluation modal
  const [evaluatingSub, setEvaluatingSub] = useState<SubmissionRow | null>(null);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalForm] = Form.useForm();
  const [evalLoading, setEvalLoading] = useState(false);

  // Breadcrumb items
  const batchDetailsUrl = `${baseAssignmentsUrl}/batch-details?course_id=${courseId}&batch_id=${batchId}`;
  const breadcrumbItems = [
    { title: "Assignments", href: baseAssignmentsUrl },
    { title: "Batch Details", href: batchDetailsUrl },
    { title: detail?.assignmentName || "Assignment Details" },
  ];

  // Fetch Assignment Meta Details
  useEffect(() => {
    if (!assignmentId) return;
    setDetailLoading(true);
    getAssignmentDetailsApi(assignmentId)
      .then((res) => {
        if (res?.status) {
          setDetail(res.data);
        }
      })
      .catch(() => toast.error("Failed to load assignment details"))
      .finally(() => setDetailLoading(false));
  }, [assignmentId]);

  // Fetch Submissions
  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    setSubmissionsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", String(page));
      query.append("limit", String(limit));
      if (search.trim()) query.append("search", search.trim());

      const res = await getAssignmentSubmissionsApi(assignmentId, query);
      if (res?.status) {
        setSubmissions(res.data?.list || []);
        setTotal(res.data?.total || 0);
      }
    } catch {
      toast.error("Failed to load student submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  }, [assignmentId, page, limit, search]);

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  // Handle Open Evaluate
  const handleOpenEvaluate = (sub: SubmissionRow) => {
    setEvaluatingSub(sub);
    evalForm.setFieldsValue({
      result: sub.result === "Pending" ? "" : sub.result,
      feedback: sub.feedback || "",
    });
    setEvalModalOpen(true);
  };

  // Submit Evaluation
  const handleSaveEvaluation = async () => {
    if (!evaluatingSub?.submission_id) {
      toast.warning("No submission selected to evaluate");
      return;
    }
    try {
      const values = await evalForm.validateFields();
      setEvalLoading(true);
      const res = await gradeSubmissionApi({
        submissionId: evaluatingSub.submission_id,
        result: values.result,
        feedback: values.feedback,
      });
      if (res?.status) {
        toast.success("Assignment evaluated successfully!");
        setEvalModalOpen(false);
        fetchSubmissions();
      } else {
        toast.error(res?.message || "Failed to evaluate assignment");
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setEvalLoading(false);
    }
  };

  const gradedCount = submissions.filter((s) => s.result && s.result !== "Pending").length;
  const pendingCount = (detail?.submittedCount || 0) - gradedCount;

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
                  Assignment Overview
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
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {detail?.assignmentName || "Assignment Details"}
              </h1>
            </div>

            {/* Quick Stats Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                <CalendarOutlined className="text-[#315CFF]" />
                <span className="text-slate-400">Due:</span>
                <span>{detail?.dueDate || "No Due Date"}</span>
              </div>
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
            <FileTextOutlined />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Projects
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {detail?.projects?.length || 0}
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

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <ClockCircleOutlined />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Pending
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {Math.max(0, pendingCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "details"
              ? "bg-[#315CFF] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Assignment & Project Tasks ({detail?.projects?.length || 0})
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

      {/* ── TAB 1: ASSIGNMENT DETAILS ── */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Overview Box */}
          {detail?.overview && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileTextOutlined className="text-[#315CFF]" />
                <span>Assignment Overview & Guidelines</span>
              </h2>
              <div className="text-slate-700 text-sm leading-relaxed pt-1">
                <QuillEditor readOnly value={detail.overview} />
              </div>
            </div>
          )}

          {/* Project Deliverables List */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Project Deliverables & Tasks ({detail?.projects?.length || 0})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Students are required to complete and submit work for each project task below.
              </p>
            </div>

            <div className="space-y-3">
              {detail?.projects?.map((item, idx) => {
                const isOpen = activeProjectIndex === idx;
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
                      onClick={() => setActiveProjectIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-[#315CFF] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#315CFF] block">
                            Project Task {idx + 1}
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                            {item.projectName}
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
                      <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 space-y-5">
                        <div className="space-y-1.5 pt-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Task Description
                          </span>
                          <div className="text-slate-700 text-sm leading-relaxed p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                            <QuillEditor readOnly value={item.description || "No description provided."} />
                          </div>
                        </div>

                        {item.objectives && item.objectives.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Objectives & Assessment Criteria
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {item.objectives.map((obj, i) => (
                                <div
                                  key={i}
                                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 flex items-start gap-2.5"
                                >
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    ✓
                                  </span>
                                  <span className="leading-snug">{obj}</span>
                                </div>
                              ))}
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
                Review submitted assignments, assign marks, and provide constructive feedback.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <SearchInput
                placeholder="Search by student name or email..."
                search={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {submissionsLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <FileTextOutlined className="text-4xl text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No student submissions found</p>
              <p className="text-xs text-slate-400">Submissions will appear here once students turn in their work.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Result / Score</th>
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
                            onClick={() => handleOpenEvaluate(sub)}
                            className="px-4 py-1.5 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <EditOutlined />
                            <span>{isEvaluated ? "Edit Grade" : "Evaluate"}</span>
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

      {/* Evaluation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SafetyCertificateOutlined className="text-[#315CFF] text-lg" />
            <span className="font-bold text-lg text-slate-900">Evaluate Student Submission</span>
          </div>
        }
        open={evalModalOpen}
        onCancel={() => setEvalModalOpen(false)}
        footer={null}
        width={560}
        centered
        className="rounded-3xl"
      >
        <div className="py-2 space-y-4">
          {evaluatingSub && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Student
                </span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {evaluatingSub.name}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">{evaluatingSub.email}</span>
            </div>
          )}

          {evaluatingSub?.submittedText && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Submitted Work / Notes:
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-h-44 overflow-y-auto">
                <QuillEditor readOnly value={evaluatingSub.submittedText} />
              </div>
            </div>
          )}

          <Form form={evalForm} layout="vertical" onFinish={handleSaveEvaluation} className="space-y-3">
            <Form.Item
              name="result"
              label={<span className="text-xs font-bold text-slate-700">Grade / Result (e.g. 85%, Passed, A)</span>}
              rules={[{ required: true, message: "Please input grade or result" }]}
            >
              <Input placeholder="e.g. 90/100 or Grade A" className="!py-2 !rounded-xl text-sm" />
            </Form.Item>

            <Form.Item
              name="feedback"
              label={<span className="text-xs font-bold text-slate-700">Instructor Feedback</span>}
            >
              <Input.TextArea
                rows={4}
                placeholder="Provide constructive feedback and recommendations for the student..."
                className="!rounded-xl text-sm"
              />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEvalModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={evalLoading}
                className="px-5 py-2 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {evalLoading ? "Saving..." : "Save Evaluation"}
              </button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AssignmentDetailsView;
