"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import { RoutePaths } from "@/utils/enums";
import { Breadcrumb } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { getAssignmentDetailsApi, submitAssignmentApi } from "@/services/collections";
import QuillEditor from "@/components/QuillEditor";
import CommonButton from "@/components/CommonButton";
import { toast } from "react-toastify";

const AssignmentDetailsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = searchParams.get("assignmentId");
  const courseId = searchParams.get("courseId");

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittedText, setSubmittedText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignmentDetails = useCallback(async () => {
    if (!assignmentId) return;
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
    if (!assignmentId || !submittedText.trim()) return;
    setSubmitting(true);
    try {
      await submitAssignmentApi(assignmentId, {
        submittedText,
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
      href: courseId ? `${RoutePaths?.MyCourses}/course-details?id=${courseId}` : `${RoutePaths?.MyCourses}`,
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
            <div className="flex flex-col gap-4">
              {assignment.projects.map((proj: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-2 border-l-4 border-primary pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <span className="font-bold text-[16px] text-[#2D2D2D]">{proj.title}</span>
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: proj.description || "" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Editor */}
        <div className="flex flex-col gap-[12px] bg-white p-6 rounded-[12px] shadow-sm">
          <h2 className="font-[700] text-[20px] text-[#0E0E0E]">Your Submission</h2>
          <p className="text-sm font-[500] text-[#7B7B7B] mb-2">
            Provide your answers for the projects above. You can include links to repositories, documents, or type your answers directly.
          </p>
          <div className="bg-gray-50 rounded-lg p-2">
            <QuillEditor
              value={submittedText}
              onChange={setSubmittedText}
            />
          </div>

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
              disable={!submittedText.trim() || submitting}
              className="w-[200px] !bg-secondary text-white"
            />
          </div>
        </div>
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
