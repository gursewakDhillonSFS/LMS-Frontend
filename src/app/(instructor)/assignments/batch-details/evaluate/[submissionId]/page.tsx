"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  Form,
  Input,
  Skeleton,
  Tag,
  Drawer,
  Tooltip,
  Modal,
  Button,
} from "antd";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  EditOutlined,
  LinkOutlined,
  GlobalOutlined,
  GithubOutlined,
  CopyOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  StarFilled,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import { RoutePaths } from "@/utils/enums";
import {
  getAssignmentDetailsApi,
  getSubmissionDetailsApi,
  gradeSubmissionApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";

// Helper to extract URLs from submission text
const extractUrls = (text: string): string[] => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
};

// Helper to get brand info for URL
const getUrlMeta = (url: string) => {
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) {
    return {
      label: "GitHub Repository",
      badge: "Code Repo",
      icon: <GithubOutlined className="text-slate-900" />,
      color: "bg-slate-900 text-white",
    };
  }
  if (lower.includes("vercel.app") || lower.includes("netlify.app")) {
    return {
      label: "Live Demo / Deployment",
      badge: "Live App",
      icon: <GlobalOutlined className="text-blue-600" />,
      color: "bg-blue-600 text-white",
    };
  }
  if (lower.includes("drive.google.com") || lower.includes("docs.google.com")) {
    return {
      label: "Google Drive / Document",
      badge: "Document",
      icon: <FileTextOutlined className="text-emerald-600" />,
      color: "bg-emerald-600 text-white",
    };
  }
  if (lower.includes("figma.com")) {
    return {
      label: "Figma Prototype",
      badge: "Design",
      icon: <GlobalOutlined className="text-purple-600" />,
      color: "bg-purple-600 text-white",
    };
  }
  return {
    label: "External Project Link",
    badge: "Link",
    icon: <LinkOutlined className="text-blue-500" />,
    color: "bg-blue-500 text-white",
  };
};

const QUICK_SCORES = [
  "100/100",
  "95/100",
  "90/100",
  "85/100",
  "80/100",
  "75/100",
  "Pass",
  "Needs Revision",
];

const FEEDBACK_PRESETS = [
  "🌟 Outstanding work! Clean implementation and exceeded expectations.",
  "✅ All core requirements and test deliverables are met.",
  "👍 Good effort overall. Code logic is sound and well structured.",
  "💡 Consider refining variable naming and adding more code documentation.",
  "⚠️ Some project tasks are incomplete or missing. Please revise and resubmit.",
];

const EvaluateSubmission = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const submissionId = params.submissionId as string;
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";
  const assignmentId = searchParams.get("assignment_id") || "";

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [submission, setSubmission] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);

  const batchDetailsUrl = `${RoutePaths?.Assignments}/batch-details?course_id=${courseId}&batch_id=${batchId}`;
  const testDetailsUrl = `${batchDetailsUrl}/test-details?assignment_id=${assignmentId}&course_id=${courseId}&batch_id=${batchId}`;

  const items = [
    { title: "Assignments", href: RoutePaths?.Assignments },
    { title: "Batch Assignments", href: batchDetailsUrl },
    {
      title: assignment?.assignmentName || "Assignment Details",
      href: testDetailsUrl,
    },
    { title: "Evaluate Submission" },
  ];

  useEffect(() => {
    if (!submissionId || !assignmentId) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [subRes, assRes] = await Promise.all([
          getSubmissionDetailsApi(submissionId),
          getAssignmentDetailsApi(assignmentId),
        ]);

        if (subRes?.status) {
          setSubmission(subRes.data);
          form.setFieldsValue({
            result: subRes.data.result !== "-" ? subRes.data.result : "",
            feedback: subRes.data.feedback || "",
          });
        } else {
          toast.error("Failed to load submission");
        }

        if (assRes?.status) {
          setAssignment(assRes.data);
        }
      } catch (err) {
        toast.error("Error fetching data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [submissionId, assignmentId, form]);

  const handleGrade = async () => {
    try {
      await form.validateFields();
    } catch (_) {
      return;
    }
    const values = form.getFieldsValue();
    setLoading(true);
    try {
      const res = await gradeSubmissionApi({
        submissionId,
        result: values.result,
        feedback: values.feedback,
      });
      if (res?.status) {
        toast.success(res.message || "Graded successfully");
        setSubmission((prev: any) => ({
          ...prev,
          result: values.result,
          feedback: values.feedback,
          status: "Graded",
        }));
        setDrawerOpen(false);
      } else {
        toast.warning(res?.message || "Failed to grade");
      }
    } catch (_) {
      toast.error("Error grading submission");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parsedAnswers = useMemo(() => {
    if (!submission?.submittedText) return {};
    try {
      return JSON.parse(submission.submittedText);
    } catch {
      return { 0: submission.submittedText };
    }
  }, [submission?.submittedText]);

  const isGraded = submission?.status === "Graded" && submission?.result && submission.result !== "-";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16 px-2 sm:px-4">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col gap-3">
        <Breadcrumb
          separator={<span className="text-slate-400 font-bold">{">"}</span>}
          items={items}
          itemRender={(item) => <BreadcrumbItemRender item={item} />}
        />

        {/* Action Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => router.push(testDetailsUrl)}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shrink-0"
              title="Back to submissions list"
            >
              <ArrowLeftOutlined />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                  Evaluation Cockpit
                </span>
                {isGraded ? (
                  <Tag color="success" className="!rounded-md !px-2 !font-semibold">
                    <CheckCircleFilled className="mr-1" /> Graded
                  </Tag>
                ) : (
                  <Tag color="warning" className="!rounded-md !px-2 !font-semibold">
                    <ClockCircleOutlined className="mr-1" /> Pending Evaluation
                  </Tag>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {assignment?.assignmentName || "Assignment Submission"}
              </h1>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {isGraded && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
                <SafetyCertificateOutlined className="text-base text-emerald-600" />
                <span>Score: {submission.result}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-98"
            >
              <StarFilled className="text-amber-300" />
              <span>{isGraded ? "Update Grade" : "Grade Submission"}</span>
            </button>
          </div>
        </div>
      </div>

      {dataLoading ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Skeleton active avatar paragraph={{ rows: 8 }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main Left Column: Submission Work & Details (xl: 8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            {/* Student Profile & Meta Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <UserAvatarDisplay
                  user={{ name: submission?.name, image: submission?.avatar }}
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">
                    {submission?.name || "Student"}
                  </h3>
                  <a
                    href={`mailto:${submission?.email}`}
                    className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
                  >
                    {submission?.email}
                  </a>
                  {submission?.dateOfSubmit && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                      <CalendarOutlined />
                      <span>
                        Submitted on:{" "}
                        {new Date(submission.dateOfSubmit).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and summary chips */}
              <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs font-semibold text-slate-500">
                  Submission Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isGraded
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {submission?.status || "Submitted"}
                </span>
              </div>
            </div>

            {/* Existing Feedback Banner if already graded */}
            {isGraded && submission?.feedback && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SafetyCertificateOutlined className="text-emerald-600 text-lg" />
                    <span className="font-bold text-emerald-900 text-sm">
                      Current Evaluation & Feedback
                    </span>
                  </div>
                  <span className="font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-xs shadow-2xs">
                    Score: {submission.result}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap pl-6">
                  {submission.feedback}
                </p>
              </div>
            )}

            {/* Student's Submitted Work Section */}
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Student's Submitted Work
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Carefully review code repositories, written responses, and project links below
                  </p>
                </div>
                {assignment?.projects && assignment.projects.length > 0 && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {assignment.projects.length} Tasks
                  </span>
                )}
              </div>

              {/* Tasks List */}
              {assignment?.projects && assignment.projects.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {assignment.projects.map((proj: any, idx: number) => {
                    const answerText: string =
                      parsedAnswers[idx] ||
                      parsedAnswers[String(idx)] ||
                      (idx === 0 && typeof submission?.submittedText === "string"
                        ? submission.submittedText
                        : "");

                    const detectedUrls = extractUrls(answerText);
                    const cleanText = answerText
                      .replace(/<[^>]*>?/gm, "")
                      .trim();

                    return (
                      <div
                        key={idx}
                        className="flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs"
                      >
                        {/* Task Title & Requirements Header */}
                        <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-sm text-slate-900">
                              {proj.projectName || proj.title || `Task ${idx + 1}`}
                            </span>
                          </div>
                          {cleanText && (
                            <Tooltip
                              title={
                                copiedIndex === idx ? "Copied!" : "Copy response"
                              }
                            >
                              <button
                                type="button"
                                onClick={() => copyToClipboard(cleanText, idx)}
                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium cursor-pointer transition-colors bg-white px-2.5 py-1 rounded-md border border-slate-200"
                              >
                                {copiedIndex === idx ? (
                                  <CheckOutlined className="text-emerald-600" />
                                ) : (
                                  <CopyOutlined />
                                )}
                                <span>Copy Text</span>
                              </button>
                            </Tooltip>
                          )}
                        </div>

                        {/* Task Requirements / Prompt */}
                        {proj.description && (
                          <div className="px-5 py-3 bg-blue-50/40 border-b border-blue-100/60 text-xs text-slate-600 flex items-start gap-2">
                            <span className="font-semibold text-blue-800 shrink-0">
                              Task Instructions:
                            </span>
                            <div
                              className="prose prose-xs max-w-none text-slate-700"
                              dangerouslySetInnerHTML={{
                                __html: proj.description,
                              }}
                            />
                          </div>
                        )}

                        {/* Detected Project URLs */}
                        {detectedUrls.length > 0 && (
                          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Submitted Links & Deliverables:
                            </span>
                            <div className="flex flex-wrap gap-2.5">
                              {detectedUrls.map((url, uIdx) => {
                                const meta = getUrlMeta(url);
                                return (
                                  <a
                                    key={uIdx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all text-xs font-semibold text-slate-800 group"
                                  >
                                    <span className="text-base">{meta.icon}</span>
                                    <span className="group-hover:text-blue-600 transition-colors">
                                      {meta.label}
                                    </span>
                                    <span className="text-[10px] text-blue-500 ml-1">
                                      ↗
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Student's Content / Text Response */}
                        <div className="p-5">
                          {answerText ? (
                            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 font-mono text-xs text-slate-800 break-all leading-relaxed whitespace-pre-wrap max-h-[360px] overflow-y-auto">
                              {cleanText || answerText}
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-xs italic text-center">
                              No response submitted for this task.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Single Task / Plain Submission */
                <div className="flex flex-col gap-4">
                  {extractUrls(submission?.submittedText || "").length > 0 && (
                    <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 flex flex-col gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Submitted Deliverable Links:
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {extractUrls(submission?.submittedText || "").map(
                          (url, uIdx) => {
                            const meta = getUrlMeta(url);
                            return (
                              <a
                                key={uIdx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-500 transition-all text-xs font-semibold text-slate-800 group"
                              >
                                <span className="text-base">{meta.icon}</span>
                                <span className="group-hover:text-blue-600">
                                  {meta.label}
                                </span>
                                <span className="text-[10px] text-blue-500">↗</span>
                              </a>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 font-mono text-xs text-slate-800 break-all leading-relaxed whitespace-pre-wrap min-h-[160px]">
                    {submission?.submittedText || (
                      <span className="text-slate-400 italic">
                        No work or text submitted.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Grading Panel (xl: 4 cols) */}
          <div className="xl:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs xl:sticky xl:top-6 flex flex-col gap-5">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Grading & Evaluation
                </h2>
                <Tag color={isGraded ? "green" : "blue"} className="!mr-0">
                  {isGraded ? "Graded" : "Evaluate"}
                </Tag>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign a grade and constructive feedback
              </p>
            </div>

            <Form form={form} layout="vertical" className="flex flex-col gap-3">
              {/* Quick Score Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Score Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SCORES.map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => form.setFieldsValue({ result: score })}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Input */}
              <Form.Item
                name="result"
                label={
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Score / Result
                  </span>
                }
                rules={[{ required: true, message: "Please enter a score or result" }]}
                className="!mb-2"
              >
                <Input
                  placeholder='e.g. "95/100", "A+" or "Pass"'
                  className="!h-11 rounded-xl text-sm font-semibold"
                />
              </Form.Item>

              {/* Quick Feedback Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Feedback Snippets
                </span>
                <div className="flex flex-col gap-1.5">
                  {FEEDBACK_PRESETS.slice(0, 3).map((snippet, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        const current = form.getFieldValue("feedback") || "";
                        form.setFieldsValue({
                          feedback: current ? `${current}\n${snippet}` : snippet,
                        });
                      }}
                      className="text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer truncate"
                    >
                      {snippet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <Form.Item
                name="feedback"
                label={
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Detailed Feedback (Optional)
                  </span>
                }
                className="!mb-0"
              >
                <Input.TextArea
                  rows={5}
                  placeholder="Share constructive feedback on project deliverables, code quality, or conceptual strengths..."
                  className="!rounded-xl text-xs sm:text-sm resize-none leading-relaxed"
                />
              </Form.Item>
            </Form>

            {/* Submit Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <CommonButton
                text="Cancel"
                onClick={() => router.push(testDetailsUrl)}
                className="border border-slate-200 !bg-white !text-slate-700 flex-1 hover:bg-slate-50"
                type="button"
                disable={loading}
              />
              <CommonButton
                text={loading ? "Saving..." : isGraded ? "Update Grade" : "Submit Grade"}
                loading={loading}
                disable={loading}
                onClick={handleGrade}
                className="!bg-secondary text-white font-semibold flex-1 shadow-xs hover:opacity-95"
                type="button"
              />
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Evaluation Drawer for quick grading on all screen sizes */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <StarFilled className="text-amber-500" />
            <span className="font-bold text-base text-slate-900">
              Evaluate Assignment Submission
            </span>
          </div>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        destroyOnClose
        extra={
          <button
            type="button"
            onClick={handleGrade}
            disabled={loading}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        }
      >
        <div className="flex flex-col gap-5 py-2">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
            <UserAvatarDisplay
              user={{ name: submission?.name, image: submission?.avatar }}
            />
            <div className="min-w-0">
              <p className="font-bold text-sm text-slate-900 truncate">
                {submission?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{submission?.email}</p>
            </div>
          </div>

          <Form form={form} layout="vertical" className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Score Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SCORES.map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => form.setFieldsValue({ result: score })}
                    className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            <Form.Item
              name="result"
              label={
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Score / Result
                </span>
              }
              rules={[{ required: true, message: "Please enter a score" }]}
              className="!mb-2"
            >
              <Input
                placeholder='e.g. "95/100", "A+" or "Pass"'
                className="!h-11 rounded-xl text-sm font-semibold"
              />
            </Form.Item>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Feedback Snippets
              </span>
              <div className="flex flex-col gap-1.5">
                {FEEDBACK_PRESETS.map((snippet, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      const current = form.getFieldValue("feedback") || "";
                      form.setFieldsValue({
                        feedback: current ? `${current}\n${snippet}` : snippet,
                      });
                    }}
                    className="text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer truncate"
                  >
                    {snippet}
                  </button>
                ))}
              </div>
            </div>

            <Form.Item
              name="feedback"
              label={
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Instructor Feedback (Optional)
                </span>
              }
              className="!mb-0"
            >
              <Input.TextArea
                rows={6}
                placeholder="Share constructive feedback for the student..."
                className="!rounded-xl text-xs sm:text-sm resize-none leading-relaxed"
              />
            </Form.Item>
          </Form>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <CommonButton
              text="Cancel"
              onClick={() => setDrawerOpen(false)}
              className="border border-slate-200 !bg-white !text-slate-700 flex-1"
              type="button"
            />
            <CommonButton
              text={loading ? "Saving..." : isGraded ? "Update Grade" : "Submit Grade"}
              loading={loading}
              disable={loading}
              onClick={handleGrade}
              className="!bg-secondary text-white font-semibold flex-1 shadow-xs"
              type="button"
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default EvaluateSubmission;
