"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import { RoutePaths } from "@/utils/enums";
import { Breadcrumb, Form, Input, Skeleton } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  getAssignmentDetailsApi,
  getSubmissionDetailsApi,
  gradeSubmissionApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";

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

  const [submission, setSubmission] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);

  const batchDetailsUrl = `${RoutePaths?.Assignments}/batch-details?course_id=${courseId}&batch_id=${batchId}`;
  const testDetailsUrl = `${batchDetailsUrl}/test-details?assignment_id=${assignmentId}&course_id=${courseId}&batch_id=${batchId}`;

  const items = [
    { title: "Assignments", href: RoutePaths?.Assignments },
    { title: "Batch Assignments", href: batchDetailsUrl },
    { title: assignment?.assignmentName || "Assignment Details", href: testDetailsUrl },
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
        router.push(testDetailsUrl);
      } else {
        toast.warning(res?.message || "Failed to grade");
      }
    } catch (_) {
      toast.error("Error grading submission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      <Breadcrumb
        separator={<span className="text-slate-400 font-bold">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      {dataLoading ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Column: Submission Details */}
          <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-6 w-full">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Evaluation Cockpit
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                  Submission Details
                </h1>
              </div>

              {submission?.status && (
                <div
                  className={`px-3.5 py-1 rounded-full text-xs font-bold ${
                    submission.status === "Graded"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : submission.status === "Pending" ||
                        submission.status === "Submitted"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {submission.status}
                </div>
              )}
            </div>

            {/* Student Profile Card */}
            <div className="flex items-center gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 shadow-2xs">
              <UserAvatarDisplay
                user={{ name: submission?.name, image: submission?.avatar }}
              />
              <div className="flex flex-col min-w-0">
                <p className="font-bold text-slate-900 text-base leading-tight truncate">
                  {submission?.name}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {submission?.email}
                </p>
                {submission?.dateOfSubmit && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Submitted on: {submission.dateOfSubmit}
                  </p>
                )}
              </div>
            </div>

            {/* Assignment Title Chip */}
            <div className="flex flex-col gap-1.5">
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Assignment Context
              </h2>
              <div className="text-sm font-semibold text-slate-800 bg-slate-50/60 px-4 py-3 rounded-xl border border-slate-200/60">
                {assignment?.assignmentName}
              </div>
            </div>

            {/* Student's Work */}
            {assignment?.projects && assignment.projects.length > 0 ? (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h2 className="font-bold text-base text-slate-900">
                    Student's Work by Project
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">
                    {assignment.projects.length} Tasks
                  </span>
                </div>

                {assignment.projects.map((proj: any, idx: number) => {
                  let answer =
                    "<span class='text-slate-400 italic'>No answer provided.</span>";
                  try {
                    const parsed = JSON.parse(submission?.submittedText || "{}");
                    if (parsed[idx]) answer = parsed[idx];
                  } catch {
                    if (idx === 0 && submission?.submittedText)
                      answer = submission.submittedText;
                  }

                  return (
                    <div
                      key={idx}
                      className="flex flex-col border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white"
                    >
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">
                          Task {idx + 1}: {proj.projectName || proj.title}
                        </span>
                      </div>
                      <div
                        className="p-5 text-slate-700 text-sm leading-relaxed prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: answer }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <h2 className="font-bold text-base text-slate-900">
                  Student's Work
                </h2>
                <div
                  className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200 min-h-[220px] text-slate-700 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      submission?.submittedText ||
                      "<span class='text-slate-400 italic'>No text submitted.</span>",
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Column: Grading Form */}
          <div className="w-full lg:w-[380px] bg-white p-6 md:p-7 rounded-2xl border border-slate-200/80 shadow-2xs sticky top-6 flex flex-col gap-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">
                Grading & Feedback
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign a score and provide personalized guidance
              </p>
            </div>

            <Form form={form} layout="vertical" className="flex flex-col gap-3">
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
                  placeholder='e.g. "92/100", "A+" or "Pass"'
                  className="!h-11 rounded-xl text-sm"
                />
              </Form.Item>

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
                  placeholder="Share constructive feedback on project deliverables, code quality, or conceptual strengths..."
                  className="!rounded-xl text-sm resize-none"
                />
              </Form.Item>
            </Form>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <CommonButton
                text="Cancel"
                onClick={() => router.push(testDetailsUrl)}
                className="border border-slate-200 !bg-white !text-slate-700 flex-1 hover:bg-slate-50"
                type="button"
                disable={loading}
              />
              <CommonButton
                text="Submit Grade"
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
    </div>
  );
};

export default EvaluateSubmission;
