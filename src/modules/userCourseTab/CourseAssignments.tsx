"use client";
import BadgeComponent from "@/components/BadgeComponent";
import CommonButton from "@/components/CommonButton";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import QuillEditor from "@/components/QuillEditor";
import { getAssignmentsByBatchApi } from "@/services/collections";
import { AssignmentTab } from "@/utils/constant";
import { AssignmentIcon, StopWatchIcon } from "@/utils/icons";
import { Spin, Modal, Input } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
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
  title: string;
  description: string;
  dueDate: string;
  status: string;
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

  // Submit modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ApiAssignment | null>(null);
  const [submittedText, setSubmittedText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const openSubmitModal = (assignment: ApiAssignment) => {
    setSelectedAssignment(assignment);
    setSubmittedText("");
    setSubmitModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !submittedText.trim()) return;
    setSubmitting(true);
    try {
      await submitAssignmentApi(selectedAssignment.assignment_id, {
        submittedText,
      });
      toast.success("Assignment submitted successfully!");
      setSubmitModalOpen(false);
      fetchAssignments();
    } catch {
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

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
    const isSubmitted = subStatus === "Submitted" || subStatus === "Graded";

    return (
      <div
        key={assignment.assignment_id}
        className="bg-white flex flex-col gap-3 rounded-xl shadow-sm p-4"
      >
        <div className="flex w-full gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-[#002333] flex-shrink-0">
            <AssignmentIcon />
          </div>
          <div className="flex flex-col w-full gap-3">
            <div className="flex flex-col w-full gap-1">
              <div className="w-full flex items-center justify-between">
                <h3 className="font-bold text-lg">{assignment.title}</h3>
                <BadgeComponent status={subStatus} />
              </div>
              <div className="text-sm text-[#9A9A9A] line-clamp-2 leading-[120%]">
                <QuillEditor readOnly value={assignment.description || ""} />
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <p className="text-sm font-[500] leading-[150%] text-[#2D2D2D]">
                <span className="font-semibold">Due on:</span>{" "}
                {assignment.dueDate}
              </p>
              {assignmentTab === "current" ? (
                <CommonButton
                  text={isSubmitted ? "Submitted" : "Start Assignment"}
                  icon={!isSubmitted ? <StopWatchIcon /> : undefined}
                  onClick={() => {
                    if (!isSubmitted) openSubmitModal(assignment);
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

      {/* Submit Modal */}
      <Modal
        open={submitModalOpen}
        title={`Submit: ${selectedAssignment?.title}`}
        onCancel={() => setSubmitModalOpen(false)}
        footer={[
          <CommonButton
            key="cancel"
            text="Cancel"
            onClick={() => setSubmitModalOpen(false)}
            className="border mr-2"
          />,
          <CommonButton
            key="submit"
            text="Submit Assignment"
            loading={submitting}
            onClick={handleSubmit}
            className="!bg-secondary text-white"
            disable={!submittedText.trim()}
          />,
        ]}
      >
        <div className="flex flex-col gap-4 py-4">
          {selectedAssignment?.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-[#0E0E0E] mb-1">Assignment:</p>
              <div className="text-sm text-[#7B7B7B]">
                <QuillEditor readOnly value={selectedAssignment.description} />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="font-semibold">
              Your Answer <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              rows={5}
              value={submittedText}
              onChange={(e) => setSubmittedText(e.target.value)}
              placeholder="Write your answer, GitHub link, or any relevant details..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseAssignments;
