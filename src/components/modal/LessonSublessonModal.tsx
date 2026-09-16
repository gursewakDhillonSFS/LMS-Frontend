"use client";

import { Checkbox, Input, Modal, Select, Upload, UploadFile, UploadProps } from "antd";
import React from "react";
import CommonButton from "../CommonButton";
import QuillEditor from "@/components/QuillEditor";
import {
  CloseOutlined,
  BookOutlined,
  InboxOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";

export interface LessonSublessonModalProps {
  addLessonModalStatus: boolean;
  addSubLessonModalStatus: boolean;
  lessonName: string;
  description: string;
  fileList: UploadFile[];
  uploadProps: UploadProps;
  unlockAfterPrevious: boolean;
  loading: boolean;
  isEditing: boolean;
  week?: number;
  totalWeeks?: number;
  setWeek?: (val: number) => void;
  onClose: () => void;
  setLessonName: (val: string) => void;
  setDescription: (val: string) => void;
  setUnlockAfterPrevious: (val: boolean) => void;
  removeFile: (index: number) => void;
  handleSave: () => void;
  handleSubLessonSave: () => void;
  onPreviewFile?: (file: { name: string; url: string; type?: string }) => void;
}

const LessonSublessonModal: React.FC<LessonSublessonModalProps> = ({
  addLessonModalStatus,
  addSubLessonModalStatus,
  lessonName,
  description,
  fileList,
  uploadProps,
  unlockAfterPrevious,
  loading,
  isEditing,
  week = 1,
  totalWeeks = 4,
  setWeek,
  onClose,
  setLessonName,
  setDescription,
  setUnlockAfterPrevious,
  removeFile,
  handleSave,
  handleSubLessonSave,
  onPreviewFile,
}) => {
  const modalTitle = addLessonModalStatus
    ? isEditing ? "Edit Lesson" : "Add Lesson"
    : isEditing ? "Edit Sub-Topic" : "Add Sub-Topic";

  const wordCount = (() => {
    const text = description?.replace(/<[^>]+>/g, "")?.replace(/&nbsp;/g, " ").trim();
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  })();

  return (
    <Modal
      open={addLessonModalStatus || addSubLessonModalStatus}
      footer={null}
      onCancel={onClose}
      closable={false}
      width={780}
      centered
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <BookOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {modalTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure curriculum topics, rich descriptions, and resources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Form Body */}
        <div className="max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-4">
          {/* Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {addLessonModalStatus ? "Lesson Title" : "Sub-Topic Title"}
            </label>
            <Input
              placeholder={
                addLessonModalStatus ? "e.g. Introduction to Financial Statements" : "e.g. Balance Sheets & Income"
              }
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              className="!h-[42px] !rounded-xl text-sm"
            />
          </div>

          {/* Assigned Week Selector (for Lessons) */}
          {addLessonModalStatus && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Assigned Curriculum Week
              </label>
              <Select
                value={week || 1}
                onChange={(val) => setWeek && setWeek(Number(val))}
                options={Array.from({ length: Math.max(1, totalWeeks || 4) }, (_, i) => ({
                  label: `Week ${i + 1}`,
                  value: i + 1,
                }))}
                className="!h-[42px] !rounded-xl text-sm w-full"
              />
            </div>
          )}

          {/* Description with Quill */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Lesson Description</label>
              <span className={`text-xs font-medium ${wordCount > 300 ? "text-red-500 font-bold" : "text-slate-400"}`}>
                {wordCount} / 300 words
              </span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <QuillEditor
                placeholder="Write a clear overview and instructions for students..."
                value={description}
                onChange={(val) => setDescription(val)}
              />
            </div>
          </div>

          {/* Study Material Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700">Study Materials & Attachments</label>
            <Upload.Dragger
              {...uploadProps}
              showUploadList={false}
              className="!border-dashed !border-slate-300 hover:!border-[#315CFF] !bg-slate-50/50 !rounded-xl !p-4"
            >
              <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315CFF] flex items-center justify-center">
                  <InboxOutlined className="text-xl" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Click or drag files here to upload
                </p>
                <p className="text-xs text-slate-400">
                  Supports PDF, DOCX, ZIP (Max file size: 25 MB)
                </p>
              </div>
            </Upload.Dragger>

            {/* Uploaded Files Grid */}
            {fileList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {fileList.map((file, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#315CFF] flex items-center justify-center shrink-0">
                        <FileTextOutlined className="text-base" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {((file?.size || 0) / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {onPreviewFile && (
                        <button
                          type="button"
                          title="Preview File"
                          onClick={() => {
                            const fileUrl =
                              file.url ||
                              (file.originFileObj
                                ? URL.createObjectURL(file.originFileObj as File)
                                : "");
                            onPreviewFile({
                              name: file.name,
                              url: fileUrl,
                              type: file.type || "file",
                            });
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <EyeOutlined className="text-xs" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        title="Remove File"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sequential Unlock Checkbox */}
          {addLessonModalStatus && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <Checkbox
                checked={unlockAfterPrevious}
                onChange={(e) => setUnlockAfterPrevious(e.target.checked)}
                className="text-xs font-medium text-slate-700"
              >
                Require completion of previous lesson before unlocking this lesson
              </Checkbox>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <CommonButton
            type="button"
            loading={loading}
            className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            onClick={addLessonModalStatus ? handleSave : handleSubLessonSave}
            text={isEditing ? "Update" : addLessonModalStatus ? "Save Lesson" : "Add Sub-Topic"}
            disable={wordCount > 300}
          />
        </div>
      </div>
    </Modal>
  );
};

export default LessonSublessonModal;
