"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import { RoutePaths } from "@/utils/enums";
import { Breadcrumb } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { getAssignmentDetailsApi, submitAssignmentApi } from "@/services/collections";
import QuillEditor from "@/components/QuillEditor";
import CommonButton from "@/components/CommonButton";
import { toast } from "@/utils/toast";

const AssignmentDetailsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId =
    searchParams.get("assignmentId") ||
    searchParams.get("assignment_id") ||
    searchParams.get("id") ||
    "";
  const courseId =
    searchParams.get("courseId") ||
    searchParams.get("course_id") ||
    "";

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittedText, setSubmittedText] = useState("");
  const [projectAnswers, setProjectAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignmentDetails = useCallback(async () => {
    if (!assignmentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getAssignmentDetailsApi(assignmentId);
      if (res?.status && res?.data) {
        setAssignment(res.data);
      } else {
        toast.error("Failed to load assignment details.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading assignment details.");
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [fetchAssignmentDetails]);

  const handleSubmit = async () => {
    const hasProjects = assignment?.projects && assignment.projects.length > 0;
    const isSingleEmpty = !hasProjects && !submittedText.trim();
    const isProjectsEmpty = hasProjects && Object.keys(projectAnswers).length === 0;

    if (!assignmentId || isSingleEmpty || isProjectsEmpty) return;
    setSubmitting(true);
    try {
      await submitAssignmentApi(assignmentId, {
        submittedText: hasProjects ? JSON.stringify(projectAnswers) : submittedText,
      });
      toast.success("Assignment submitted successfully!");
      // Optionally, route back to course details assignments tab
      if (courseId) {
        router.push(`${RoutePaths.MyCourses}/course-details?id=${courseId}&tab=assignments`);
      } else {
        router.push(`${RoutePaths.MyCourses}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const items = [
    {
      title: "My Courses",
      href: RoutePaths?.MyCourses,
    },
    {
      title: "Course Details",
      href: courseId ? `${RoutePaths?.MyCourses}/course-details?course_id=${courseId}` : `${RoutePaths?.MyCourses}`,
    },
    {
      title: assignment?.assignmentName || "Assignment Details",
    },
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading assignment...</div>;
  }

  if (!assignment) {
    return <div className="p-8 text-center text-red-500">Assignment not found.</div>;
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-primary">
          {assignment.assignmentName}
        </h1>
        {assignment.dueDate && (
          <p className="text-[16px] text-[#5EB85C] font-bold">
            Due on: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="w-full flex flex-col gap-[24px]">
        {/* Assignment Overview */}
        <div className="flex flex-col gap-[12px] bg-white p-6 rounded-[12px] shadow-sm">
          <h2 className="font-[700] text-[20px] text-[#0E0E0E]">Overview</h2>
          <div
            className="text-[16px] text-[#002333]"
            dangerouslySetInnerHTML={{ __html: assignment?.overview || "" }}
          />
        </div>

        {/* Projects / Tasks */}
        {assignment?.projects && assignment.projects.length > 0 && (
          <div className="flex flex-col gap-[16px] bg-white p-6 rounded-[12px] shadow-sm">
            <h2 className="font-[700] text-[20px] text-[#0E0E0E]">Projects / Tasks</h2>
            <div className="flex flex-col gap-6">
              {assignment.projects.map((proj: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 border-l-4 border-primary pl-4 py-2 bg-gray-50 rounded-r-lg">
                    <span className="font-bold text-[16px] text-[#2D2D2D]">{proj.projectName || proj.title}</span>
                    <div
                      className="text-sm text-gray-600"
                      dangerouslySetInnerHTML={{ __html: proj.description || "" }}
                    />
                  </div>
                  
                  {assignment.studentSubmission ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-sm font-semibold mb-2">Your Answer:</p>
                      <div
                        className="text-[16px] text-[#2D2D2D]"
                        dangerouslySetInnerHTML={{ __html: (() => {
                          try {
                            const parsed = JSON.parse(assignment.studentSubmission.submittedText || "{}");
                            return parsed[idx] || "No answer provided.";
                          } catch {
                            return assignment.studentSubmission.submittedText;
                          }
                        })() }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 shadow-inner">
                      <p className="text-sm font-semibold mb-2 pl-2">Your Answer:</p>
                      <QuillEditor
                        value={projectAnswers[idx] || ""}
                        onChange={(val) => setProjectAnswers((prev) => ({ ...prev, [idx]: val }))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Details */}
        {assignment?.studentSubmission ? (
          <div className="flex flex-col gap-[12px] bg-white p-6 rounded-[12px] shadow-sm">
            <h2 className="font-[700] text-[20px] text-[#0E0E0E]">Submission Details</h2>
            
            {!(assignment.projects && assignment.projects.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <p className="text-sm font-semibold mb-2">Your Answer:</p>
                <div
                  className="text-[16px] text-[#2D2D2D]"
                  dangerouslySetInnerHTML={{ __html: assignment.studentSubmission.submittedText || "Submitted." }}
                />
              </div>
            )}

            <div className="text-sm font-medium">
              <span className="font-bold text-[#0E0E0E]">Status: </span>
              <span className="text-secondary">
                {assignment.studentSubmission.status === "Submitted" || assignment.studentSubmission.status === "Pending"
                  ? "Submitted, pending for grading"
                  : assignment.studentSubmission.status}
              </span>
              {assignment.studentSubmission.result && (
                <div className="mt-2 text-green-600 font-bold">
                  Score: {assignment.studentSubmission.result}
                </div>
              )}
              {assignment.studentSubmission.feedback && (
                <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold block mb-1">Instructor Feedback:</span>
                  {assignment.studentSubmission.feedback}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <CommonButton
                text="Back to Course"
                onClick={() => {
                  const targetCourse = courseId || assignment?.courseId;
                  if (targetCourse) {
                    router.push(`${RoutePaths.MyCourses}/course-details?course_id=${targetCourse}`);
                  } else {
                    router.push(`${RoutePaths.MyCourses}`);
                  }
                }}
                className="bg-gray-200 text-gray-700 border-none w-[160px]"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px] bg-white p-6 rounded-[12px] shadow-sm">
            {!(assignment?.projects && assignment.projects.length > 0) && (
              <>
                <h2 className="font-[700] text-[20px] text-[#0E0E0E]">Your Submission</h2>
                <p className="text-sm font-[500] text-[#7B7B7B] mb-2">
                  Provide your answer for the assignment above. You can include links to repositories, documents, or type your answers directly.
                </p>
                <div className="bg-gray-50 rounded-lg p-2">
                  <QuillEditor
                    value={submittedText}
                    onChange={setSubmittedText}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <CommonButton
                text="Cancel"
                onClick={() => {
                  if (courseId) {
                    router.push(`${RoutePaths.MyCourses}/course-details?id=${courseId}&tab=assignments`);
                  } else {
                    router.push(`${RoutePaths.MyCourses}`);
                  }
                }}
                className="bg-gray-200 text-gray-700 border-none w-[120px]"
              />
              <CommonButton
                text="Submit Assignment"
                onClick={handleSubmit}
                disable={submitting || (!(assignment?.projects && assignment.projects.length > 0) && !submittedText.trim()) || ((assignment?.projects && assignment.projects.length > 0) && Object.keys(projectAnswers).length === 0)}
                className="w-[200px] !bg-secondary text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AssignmentDetails() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AssignmentDetailsContent />
    </Suspense>
  );
}
