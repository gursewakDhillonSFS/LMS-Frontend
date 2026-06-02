"use client";
import CommonButton from "@/components/CommonButton";
import { RoutePaths } from "@/utils/enums";
import { CloseIcon } from "@/utils/icons";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export interface CourseBatchModalProps {
  open: boolean;
  onClose: () => void;
  centered?: boolean;
  batches?: any[];
  onSubmit?: (batchId: string) => void;
}

const CourseBatchModal: React.FC<CourseBatchModalProps> = ({
  open,
  onClose,
  centered = false,
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
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
      centered={centered}
      closable={false}
      prefixCls="common-modal"
      className={`relative ${!centered && "!top-10"}`}
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-black rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon />
      </button>
      <div className="flex flex-col gap-[32px]">
        <h2 className="text-2xl font-bold text-center ">Select Batch</h2>

        <div className="space-y-4">
          {batches.map((batch) => (
            <div
              key={batch._id}
              onClick={() => setSelectedBatch(batch._id)}
              className={`flex items-center gap-3 p-4 rounded-md cursor-pointer transition 
              ${selectedBatch === batch._id ? "bg-gray-100" : "bg-gray-100"}
              `}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${
                  selectedBatch === batch._id
                    ? "border-primary"
                    : "border-gray-400"
                }`}
              >
                {selectedBatch === batch._id && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-gray-800 font-medium">{batch.batchName || "Batch Name"}</span>
            </div>
          ))}
        </div>

        <CommonButton
          text={"Select"}
          disable={selectedBatch === null}
          className="!bg-secondary text-white w-full !p-[25px]"
          onClick={handleRedirect}
        />
      </div>
    </Modal>
  );
};

export default CourseBatchModal;
