"use client";

import React, { useState } from "react";
import { Modal, Input, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UsergroupAddOutlined,
  PlusOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { toast } from "@/utils/toast";
import useInstructor from "@/hooks/useInstructor";
import { createBatchApi, updateBatchApi, deleteBatchApi } from "@/services/collections";
import { CourseInfoDataProp } from "@/utils/interface";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface BatchItem {
  _id?: string;
  batchName?: string;
  teacher?: string | null;
}

interface InstructorBatchProp {
  coursesInfo: CourseInfoDataProp | undefined;
  fetchCourseInfo: () => Promise<void>;
}

const InstructorBatch: React.FC<InstructorBatchProp> = ({
  coursesInfo,
  fetchCourseInfo,
}) => {
  const [batchModal, setBatchModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  const [batchName, setBatchName] = useState("");
  const [teacher, setTeacher] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const userData = useSelector((state: RootState) => state.userdata);
  const role_name = userData?.role_name;
  const isTeacher = role_name === "teacher";
  const isHeadTeacher = String(coursesInfo?.head_teacher_id) === String(userData?.instructor_id);

  const visibleBatches = isTeacher && !isHeadTeacher
    ? coursesInfo?.batch?.filter((b: BatchItem) => String(b.teacher) === String(userData?.instructor_id))
    : coursesInfo?.batch;

  const { data: instructorOptions } = useInstructor();

  const getTeacherName = (teacherId: string | null | undefined) => {
    if (!teacherId) return "Unassigned";
    const options = instructorOptions as unknown as { label: string; value: string }[] | undefined;
    const matched = options?.find((i) => i.value === teacherId);
    return matched ? matched.label : teacherId;
  };

  const resetForm = () => {
    setBatchName("");
    setTeacher(null);
    setIsEditing(false);
    setEditBatchId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setBatchModal(true);
  };

  const handleOpenEdit = (batch: BatchItem) => {
    setBatchName(batch.batchName || "");
    setTeacher(batch.teacher ?? null);
    setEditBatchId(batch._id ?? null);
    setIsEditing(true);
    setBatchModal(true);
  };

  const handleSaveBatch = async () => {
    if (!coursesInfo?.course_id) return;
    if (!batchName.trim()) {
      toast.error("Batch name is required.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && editBatchId) {
        const res = await updateBatchApi({
          course_id: coursesInfo.course_id,
          batch_id: editBatchId,
          batchName,
          teacher,
        });
        if (res.status) {
          toast.success("Batch updated successfully!");
          await fetchCourseInfo();
          setBatchModal(false);
        } else {
          toast.error(res.message || "Failed to update batch.");
        }
      } else {
        const res = await createBatchApi({
          course_id: coursesInfo.course_id,
          batchName,
          teacher,
        });
        if (res.status) {
          toast.success("Batch created successfully!");
          await fetchCourseInfo();
          setBatchModal(false);
        } else {
          toast.error(res.message || "Failed to create batch.");
        }
      }
    } catch {
      toast.error("An error occurred while saving batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = (batchId: string | undefined) => {
    if (!coursesInfo?.course_id) return;
    Modal.confirm({
      title: "Are you sure you want to delete this batch?",
      content: "This operation will remove the batch permanently.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteBatchApi(coursesInfo.course_id || "", batchId || "");
          if (res.status) {
            toast.success("Batch deleted successfully!");
            await fetchCourseInfo();
          } else {
            toast.error(res.message || "Failed to delete batch.");
          }
        } catch {
          toast.error("Error deleting batch.");
        }
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Study Batches
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {visibleBatches?.length || 0} Batches
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize course cohorts, assign lead instructors, and manage active student sessions.
          </p>
        </div>

        {!isTeacher && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-2xl bg-[#315CFF] hover:bg-[#2547D0] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-2xs cursor-pointer shrink-0 self-start sm:self-center"
          >
            <PlusOutlined />
            <span>Create Batch</span>
          </button>
        )}
      </div>

      {/* Batches Grid */}
      {visibleBatches && visibleBatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleBatches.map((batchItem: BatchItem, index: number) => (
            <div
              key={batchItem._id || index}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                    Cohort {index + 1}
                  </span>
                  {!isTeacher && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(batchItem)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                        title="Edit Batch"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBatch(batchItem._id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Batch"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  )}
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {batchItem.batchName}
                </h2>
              </div>

              {/* Assigned Instructor Strip */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamOutlined className="text-slate-400 text-sm shrink-0" />
                  <span className="text-xs text-slate-500 truncate">Instructor:</span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100/80 truncate max-w-[150px]">
                  {getTeacherName(batchItem.teacher)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <TeamOutlined className="text-4xl text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Batches Configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create study batches to assign students into cohorts and designate instructors.
          </p>
          {!isTeacher && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-2 px-4 py-2 rounded-xl bg-[#315CFF] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusOutlined />
              <span>Create First Batch</span>
            </button>
          )}
        </div>
      )}

      {/* Create / Edit Batch Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SafetyCertificateOutlined className="text-[#315CFF] text-lg" />
            <span className="font-bold text-lg text-slate-900">
              {isEditing ? "Edit Study Batch" : "Create New Batch"}
            </span>
          </div>
        }
        open={batchModal}
        onCancel={() => setBatchModal(false)}
        footer={null}
        width={480}
        centered
        className="rounded-3xl"
      >
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Batch Name</label>
            <Input
              placeholder="e.g. Summer Morning Cohort A"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="!py-2.5 !rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Assign Instructor</label>
            <Select
              placeholder="Select assigned instructor"
              value={teacher}
              onChange={(val) => setTeacher(val)}
              className="w-full !h-11"
              allowClear
              options={(instructorOptions as { label: string; value: string }[]) || []}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBatchModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveBatch}
              className="px-5 py-2 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditing ? "Update Batch" : "Create Batch"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorBatch;
