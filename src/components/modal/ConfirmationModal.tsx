"use client";

import { ConfirmationModalProps } from "@/utils/interface";
import { Modal } from "antd";
import React from "react";
import CommonButton from "../CommonButton";

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onCancel,
  title,
  description,
  onSubmit,
  icon,
  iconBG = "#00F3A2",
  loading = false,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      footer={null}
      width={450}
      closable={false}
      prefixCls="confirmation-modal"
    >
      <div className="w-full p-4 flex flex-col items-center justify-center gap-[16px]">
        {icon && (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: iconBG }}
          >
            {icon}
          </div>
        )}

        <div className="text-center flex flex-col gap-1">
          {title && (
            <h4 className="text-[24px] font-bold text-black">{title}</h4>
          )}
          {description && (
            <p className="text-[#2D2D2D] text-[16px]">{description}</p>
          )}
        </div>

        <div className="flex gap-3 w-full">
          <CommonButton
            text={"No"}
            onClick={onCancel}
            className="border border-black !bg-transparent !w-full"
          />
          <CommonButton
            loading={loading}
            text={"Yes"}
            onClick={onSubmit}
            className={`!bg-[${iconBG}] text-white !w-full`}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
