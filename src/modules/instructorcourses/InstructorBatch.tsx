"use client";

import React, { useState } from "react";
import { Modal, Input, Select } from "antd";
import CommonButton from "@/components/CommonButton";
import NoDataFound from "@/components/NoDataFound";
import { DataNotFound } from "@/utils/images";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { CloseIcon } from "@/utils/icons";
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

  const { data: instructorOptions, loading: instructorLoading } = useInstructor();

  const getTeacherName = (teacherId: string | null | undefined) => {
    if (!teacherId) return "N/A";
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
    } catch (error) {
      toast.error("An error occurred while saving batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = (batchId: string | undefined) => {
    if (!coursesInfo?.course_id) return;
    Modal.confirm({
      title: "Are you sure you want to delete this batch?",
      content: "This operation is permanent.",
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
        } catch (error) {
          toast.error("Error deleting batch.");
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between w-full bg-white p-4 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold text-[#0E0E0E]">Batches</h1>
          <p className="text-sm text-[#7B7B7B]">Manage active study sessions</p>
        </div>
        {!isTeacher && (
          <CommonButton
            text={"+ Create Batch"}
            onClick={handleOpenCreate}
            className="!bg-secondary !text-white"
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        {visibleBatches && visibleBatches.length > 0 ? (
          visibleBatches.map((batchItem: BatchItem, index: number) => (
            <div
              key={batchItem._id || index}
              className="bg-white border border-gray-100 p-5 rounded-xl flex items-center justify-between hover:shadow-sm transition-all duration-200"
            >
              <div className="flex flex-col gap-1">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Batch {index + 1}</div>
                <h2 className="text-lg font-bold text-[#002333]">{batchItem.batchName}</h2>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-sm text-[#7B7B7B]">Assigned Instructor:</span>
                  <span className="text-sm font-medium text-secondary bg-blue-50 px-2.5 py-0.5 rounded">
                    {getTeacherName(batchItem.teacher)}
                  </span>
                </div>
              </div>

              {!isTeacher && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(batchItem)}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 p-2.5 rounded-lg transition flex items-center justify-center shadow-sm"
                    title="Edit Batch"
                  >
                    <EditOutlined className="text-[16px]" />
                  </button>
                  <button
                    onClick={() => handleDeleteBatch(batchItem._id)}
                    className="text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 p-2.5 rounded-lg transition flex items-center justify-center shadow-sm"
                    title="Delete Batch"
                  >
                    <DeleteOutlined className="text-[16px]" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <NoDataFound icon={DataNotFound} />
        )}
      </div>

      <Modal
        open={batchModal}
        onCancel={() => setBatchModal(false)}
        footer={null}
        width={450}
        centered
        closable={false}
        className="relative"
      >
        <button
          onClick={() => setBatchModal(false)}
          className="cursor-pointer absolute w-[27px] h-[27px] bg-black rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm z-50"
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col gap-5 p-2">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Edit Batch Info" : "Create New Batch"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Setup details for dynamic sessions</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Batch Name</label>
            <Input
              placeholder="e.g. Morning Advanced Batch"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="h-11 text-[15px] rounded-lg border-gray-300"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Assign Teacher (Optional)</label>
            <Select
              placeholder="-- Select Teacher --"
              options={instructorOptions}
              loading={instructorLoading}
              value={teacher}
              onChange={(val) => setTeacher(val)}
              className="h-11 text-[15px] w-full"
              allowClear
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <CommonButton
              text="Cancel"
              onClick={() => setBatchModal(false)}
              className="!bg-gray-100 !text-gray-700"
            />
            <CommonButton
              text={isEditing ? "Save Changes" : "Create Batch"}
              onClick={handleSaveBatch}
              loading={loading}
              className="!bg-secondary text-white"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorBatch;
