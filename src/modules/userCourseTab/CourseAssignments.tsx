"use client";
import BadgeComponent from "@/components/BadgeComponent";
import CommonButton from "@/components/CommonButton";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import QuillEditor from "@/components/QuillEditor";
import { getAssignmentsByBatchApi } from "@/services/collections";
import { AssignmentTab } from "@/utils/constant";
import { AssignmentIcon, StopWatchIcon } from "@/utils/icons";
import { Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { submitAssignmentApi } from "@/services/collections";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  submittedDate?: string;
  score?: string;
}

interface ApiAssignment {
  assignment_id: string;
  assignmentName: string;
  overview: string;
  dueDate: string;
  status: string;
  projects?: { title: string; description: string }[];
  studentSubmission: { status: string; result: string | null } | null;
}

interface CourseAssignmentsProps {
  courseId: string;
  batchId: string;
}

const CourseAssignments: React.FC<CourseAssignmentsProps> = ({
  courseId,
  batchId,
}) => {
  const [assignmentTab, setAssignmentTab] = useState("current");
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchAssignments = useCallback(async () => {
    if (!batchId || !courseId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        batchId,
        courseId,
        tab: assignmentTab === "current" ? "ongoing" : "past",
      });
      const res = await getAssignmentsByBatchApi(params);
      if (res?.status) {
        setAssignments(res.data?.assignments || []);
      }
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [batchId, courseId, assignmentTab]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const getSubmissionStatus = (a: ApiAssignment) => {
    return a.studentSubmission?.status || "Not Submitted";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  const renderAssignmentCard = (assignment: ApiAssignment) => {
    const subStatus = getSubmissionStatus(assignment);
    const isSubmitted = subStatus === "Submitted" || subStatus === "Graded" || subStatus === "Pending";

    return (
      <div
        key={assignment.assignment_id}
        className="bg-white flex flex-col gap-3 rounded-xl shadow-sm p-4"
      >
        <div className="flex w-full gap-2 items-start">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-[#002333] flex-shrink-0">
            <AssignmentIcon />
          </div>
          <div className="flex flex-col flex-1 gap-3 min-w-0">
            <div className="flex flex-col w-full gap-1 min-w-0 overflow-hidden">
              <div className="w-full flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg break-words whitespace-normal text-wrap max-w-[70%]">{assignment.assignmentName}</h3>
                <div className="flex-shrink-0">
                  <BadgeComponent status={subStatus} />
                </div>
              </div>
              <div className="text-sm text-[#9A9A9A] line-clamp-2 leading-[120%] break-words whitespace-normal [&_*]:whitespace-normal [&_*]:break-words overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: assignment.overview || "" }} />
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <p className="text-sm font-[500] leading-[150%] text-[#2D2D2D]">
                <span className="font-semibold">Due on:</span>{" "}
                {assignment.dueDate}
              </p>
              {assignmentTab === "current" ? (
                <CommonButton
                  text={isSubmitted ? (subStatus === "Submitted" || subStatus === "Pending" ? "Submitted, pending for grading" : subStatus) : "Start Assignment"}
                  icon={!isSubmitted ? <StopWatchIcon /> : undefined}
                  onClick={() => {
                    if (!isSubmitted) {
                      router.push(`/my-courses/course-details/assignment-details?assignmentId=${assignment.assignment_id}&courseId=${courseId}`);
                    }
                  }}
                  className={`!bg-secondary text-white ${!isSubmitted ? "flex-row-reverse" : "opacity-70"}`}
                  disable={isSubmitted}
                />
              ) : (
                <div className="flex items-center gap-3">
                  {assignment.studentSubmission?.result && (
                    <span className="text-sm font-semibold text-secondary">
                      Score: {assignment.studentSubmission.result}
                    </span>
                  )}
                  <BadgeComponent status={subStatus} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-[20px]">
      <CustomTabSwitcher
        activeKey={assignmentTab}
        onChange={setAssignmentTab}
        tabs={AssignmentTab}
        className="rounded-[6px] px-1 pt-2 !shadow-sm"
      />

      {assignments.length === 0 ? (
        <div className="text-center py-8 text-[#7B7B7B]">
          No {assignmentTab === "current" ? "current" : "past"} assignments.
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          {assignments.map(renderAssignmentCard)}
        </div>
      )}

    </div>
  );
};

export default CourseAssignments;
