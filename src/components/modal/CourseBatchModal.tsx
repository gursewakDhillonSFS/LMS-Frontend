"use client";

import { RoutePaths } from "@/utils/enums";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CloseOutlined, AppstoreOutlined, CheckCircleFilled } from "@ant-design/icons";

export interface CourseBatchModalProps {
  open: boolean;
  onClose: () => void;
  centered?: boolean;
  batches?: Array<{ _id: string; batchName?: string; [key: string]: unknown }>;
  onSubmit?: (batchId: string) => void;
}

const CourseBatchModal: React.FC<CourseBatchModalProps> = ({
  open,
  onClose,
  centered = true,
  batches = [],
  onSubmit,
}) => {
  const router = useRouter();
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const handleRedirect = () => {
    if (selectedBatch) {
      if (onSubmit) {
        onSubmit(selectedBatch);
      } else {
        router.push(`${RoutePaths?.MyExplore}/checkout`);
      }
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedBatch(null);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={440}
      centered={centered}
      closable={false}
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <AppstoreOutlined className="text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Select Batch
              </h3>
              <p className="text-xs text-slate-500">
                Choose your batch schedule
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

        {/* Batch Options */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin mb-5">
          {batches.length > 0 ? (
            batches.map((batch) => {
              const isSelected = selectedBatch === batch._id;
              return (
                <div
                  key={batch._id}
                  onClick={() => setSelectedBatch(batch._id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#315CFF] bg-blue-50/50 shadow-xs"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <span className={`font-semibold text-sm ${isSelected ? "text-[#315CFF]" : "text-slate-800"}`}>
                    {batch.batchName || "Standard Batch"}
                  </span>
                  <div>
                    {isSelected ? (
                      <CheckCircleFilled className="text-xl text-[#315CFF]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No batches available for this course.
            </div>
          )}
        </div>

        {/* Footer */}
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
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CourseBatchModal;
