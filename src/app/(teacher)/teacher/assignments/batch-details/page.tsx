"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import TabSwitcher from "@/components/TabSwitcher";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import { InstructorAssignmentOptions } from "@/utils/constant";
import { InstructorAssignmentTab, RoutePaths } from "@/utils/enums";
import { AssignmentIcon, DeleteIcon, EditIcon } from "@/utils/icons";
import { AntDesignOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Skeleton, Tooltip, Tag } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import QuillEditor from "@/components/QuillEditor";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getAssignmentsByBatchApi,
  deleteAssignmentApi,
} from "@/services/collections";
import { toast } from "react-toastify";

interface AssignmentRow {
  assignment_id: string;
  assignmentName: string;
  dueDate: string;
  overview: string;
  created_by: string | null;
  submittedCount: number;
}

const TeacherBatchDetailInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";

  const userData = useSelector((state: RootState) => state.userdata);

  const [activeTab, setActiveTab] = useState<string>(
    InstructorAssignmentTab?.Ongoing
  );
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const items = [
    { title: "Assignments", href: RoutePaths?.TeacherAssignments },
    { title: "Batch Assignments" },
  ];

  const fetchAssignments = useCallback(async () => {
    if (!batchId || !courseId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("batchId", batchId);
      params.append("courseId", courseId);
      params.append("tab", activeTab === InstructorAssignmentTab.Ongoing ? "ongoing" : "past");
      params.append("page", "1");
      params.append("limit", "20");
      const res = await getAssignmentsByBatchApi(params);
      if (res?.status) {
        setAssignments(res.data?.assignments || []);
      }
    } catch (_) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [batchId, courseId, activeTab]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteAssignmentApi(deleteId);
      if (res?.status) {
        toast.success(res.message || "Assignment deleted");
        setDeleteModal(false);
        fetchAssignments();
      } else {
        toast.warning(res?.message || "Failed to delete");
      }
    } catch (_) {
      toast.error("Error deleting assignment");
    } finally {
      setDeleteLoading(false);
    }
  };

  const addAssignmentUrl = `${RoutePaths?.TeacherAssignments}/batch-details/add-assignment?course_id=${courseId}&batch_id=${batchId}`;
  const testDetailsUrl = (id: string) =>
    `${RoutePaths?.TeacherAssignments}/batch-details/test-details?assignment_id=${id}&course_id=${courseId}&batch_id=${batchId}`;

  return (
    <div className="flex flex-col gap-[24px]">
      <ConfirmationModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onSubmit={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Assignment"
        description="Are you sure you want to delete this assignment? This action cannot be undone."
      />

      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex justify-between items-center">
        <TabSwitcher
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={InstructorAssignmentOptions}
        />
        {activeTab === InstructorAssignmentTab.Ongoing && (
          <CommonButton
            text={"+ Add Assignment"}
            className="text-white !bg-secondary !w-auto !px-4"
            onClick={() => router.push(addAssignmentUrl)}
          />
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500">
          No {activeTab === InstructorAssignmentTab.Ongoing ? "ongoing" : "past"} assignments found.{" "}
          {activeTab === InstructorAssignmentTab.Ongoing && (
            <span
              className="text-secondary cursor-pointer underline"
              onClick={() => router.push(addAssignmentUrl)}
            >
              Create one
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map((test) => {
            const isOwner = test.created_by && String(test.created_by) === String(userData?.user_id);
            return (
              <div
                key={test.assignment_id}
                className="bg-white flex gap-[10px] p-4 rounded-xl w-full"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-[#002333] shrink-0">
                  <AssignmentIcon />
                </div>
                <div className="flex-1 flex flex-col gap-[12px] w-full">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[20px] leading-[120%]">
                            {test.assignmentName}
                          </h3>
                          {isOwner ? (
                            <Tag color="success">My Assignment</Tag>
                          ) : (
                            <Tag color="default">Instructor Created</Tag>
                          )}
                        </div>
                        <p className="text-sm font-[500] leading-[150%] text-[#2D2D2D] mt-1">
                          <span className="font-semibold">Due on:</span>{" "}
                          {test.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `${RoutePaths?.TeacherAssignments}/batch-details/add-assignment?course_id=${courseId}&batch_id=${batchId}&assignment_id=${test.assignment_id}&mode=edit`
                            )
                          }
                        >
                          <EditIcon />
                        </button>
                        <div className="w-[1px] h-6 bg-[#C8C8C8]" />
                        <button
                          onClick={() => {
                            setDeleteId(test.assignment_id);
                            setDeleteModal(true);
                          }}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 line-clamp-2">
                    <QuillEditor readOnly value={test.overview || ""} />
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center justify-center gap-2">
                      <Avatar.Group
                        size="default"
                        max={{
                          count: 2,
                          style: {
                            color: "#f56a00",
                            backgroundColor: "#fde3cf",
                            cursor: "pointer",
                          },
                          popover: { trigger: "click" },
                        }}
                      >
                        <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
                        <Tooltip title="Students" placement="top">
                          <Avatar style={{ backgroundColor: "#1677ff" }} icon={<AntDesignOutlined />} />
                        </Tooltip>
                      </Avatar.Group>
                      <div className="text-sm text-secondary font-semibold mt-1">
                        {test.submittedCount} Submitted
                      </div>
                    </div>

                    <CommonButton
                      text={"View"}
                      onClick={() => router.push(testDetailsUrl(test.assignment_id))}
                      className="!h-8 !w-[100px]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TeacherBatchDetail = () => (
  <Suspense fallback={<Skeleton active />}>
    <TeacherBatchDetailInner />
  </Suspense>
);

export default TeacherBatchDetail;
