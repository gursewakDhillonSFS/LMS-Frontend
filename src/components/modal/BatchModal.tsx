"use client";

import React from "react";
import Image from "next/image";
import { Card1 } from "@/utils/images";
import { BatchModalProps } from "@/utils/interface";
import { Modal } from "antd";
import { CloseOutlined, ReadOutlined, CheckCircleFilled } from "@ant-design/icons";

const BatchModal: React.FC<BatchModalProps> = ({
  open,
  onClose,
  centered = true,
  title = "Select Cohort Batch",
  batchList = [],
  courseData,
  handleRedirect,
  selectedBatch = null,
  setSelectedBatch,
}) => {
  const handleClose = () => {
    onClose();
    setSelectedBatch(null);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={460}
      centered={centered}
      closable={false}
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <ReadOutlined className="text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500">
                Choose a batch to continue
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Course Card Preview */}
        {courseData && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200 relative">
              <Image
                src={courseData?.image || Card1}
                alt="Course"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Selected Course</p>
              <p className="font-bold text-sm text-slate-800 truncate">
                {courseData?.name}
              </p>
            </div>
          </div>
        )}

        {/* Batch List */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin mb-5">
          {batchList.map((batch) => {
            const isSelected = selectedBatch === batch.id;
            return (
              <div
                key={batch.id}
                onClick={() => setSelectedBatch(batch.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#315CFF] bg-blue-50/50 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                  <span className={`font-semibold text-sm ${isSelected ? "text-[#315CFF]" : "text-slate-800"}`}>
                    {batch.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {batch.assignments !== undefined && (
                      <span>Assignments: {batch.assignments}</span>
                    )}
                    {batch.lastQuizDate && (
                      <span>• Last Quiz: {batch.lastQuizDate}</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <CheckCircleFilled className="text-xl text-[#315CFF]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedBatch === null}
            onClick={handleRedirect}
            className="py-2.5 px-6 rounded-xl bg-[#315CFF] text-white font-semibold text-sm shadow-xs hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Batch
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BatchModal;
