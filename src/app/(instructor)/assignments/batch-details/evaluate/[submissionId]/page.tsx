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
import { toast } from "react-toastify";
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
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      {dataLoading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Submission Details */}
          <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-[#0E0E0E]">Submission Details</h1>
              {submission?.status && (
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  submission.status === "Graded" ? "bg-green-100 text-green-700" :
                  submission.status === "Pending" || submission.status === "Submitted" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {submission.status}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
              <UserAvatarDisplay
                user={{ name: submission?.name, image: submission?.avatar }}
              />
              <div className="flex flex-col">
                <p className="font-semibold text-[#002333]">{submission?.name}</p>
                <p className="text-sm text-gray-500">{submission?.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <h2 className="font-semibold text-[16px]">Assignment</h2>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                {assignment?.assignmentName}
              </p>
            </div>

            {assignment?.projects && assignment.projects.length > 0 ? (
              <div className="flex flex-col gap-4 flex-1 mt-2">
                <h2 className="font-semibold text-[16px]">Student's Work (Projects)</h2>
                {assignment.projects.map((proj: any, idx: number) => {
                  let answer = "<span class='text-gray-400 italic'>No answer provided.</span>";
                  try {
                    const parsed = JSON.parse(submission?.submittedText || "{}");
                    if (parsed[idx]) answer = parsed[idx];
                  } catch {
                    if (idx === 0 && submission?.submittedText) answer = submission.submittedText;
                  }
                  
                  return (
                    <div key={idx} className="flex flex-col gap-2 border border-blue-100 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-blue-50/80 px-4 py-3 border-b border-blue-100 font-semibold text-[#002333]">
                        {proj.projectName || proj.title}
                      </div>
                      <div className="p-4 bg-white text-[#002333] [&>p]:mb-0" dangerouslySetInnerHTML={{ __html: answer }} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2 flex-1 mt-2">
                <h2 className="font-semibold text-[16px]">Student's Work</h2>
                <div 
                  className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex-1 min-h-[200px] whitespace-pre-wrap text-[#002333]"
                  dangerouslySetInnerHTML={{ __html: submission?.submittedText || "<span class='text-gray-400 italic'>No text submitted.</span>" }}
                />
              </div>
            )}
          </div>

          {/* Right Column: Grading Form */}
          <div className="w-full md:w-[400px] bg-white p-6 rounded-xl border border-gray-200 h-fit sticky top-6">
            <h2 className="text-xl font-bold text-[#0E0E0E] mb-6">Evaluation</h2>
            <Form form={form} layout="vertical">
              <Form.Item
                name="result"
                label="Result / Score"
                rules={[{ required: true, message: "Please enter a result" }]}
              >
                <Input placeholder='e.g. "85/100" or "Pass"' size="large" />
              </Form.Item>

              <Form.Item name="feedback" label="Instructor Feedback (Optional)">
                <Input.TextArea
                  rows={6}
                  placeholder="Write your feedback for the student..."
                  className="resize-none"
                />
              </Form.Item>
            </Form>

            <div className="flex justify-end gap-3 mt-8">
              <CommonButton
                text="Cancel"
                onClick={() => router.push(testDetailsUrl)}
                className="!bg-transparent border !text-[#002333] flex-1"
                type="button"
              />
              <CommonButton
                text="Submit Grade"
                loading={loading}
                onClick={handleGrade}
                className="!bg-secondary text-white flex-1"
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
