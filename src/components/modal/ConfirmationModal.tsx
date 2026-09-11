"use client";

import { ConfirmationModalProps } from "@/utils/interface";
import { Modal } from "antd";
import React from "react";
import CommonButton from "../CommonButton";
import { useTranslation } from "@/context/I18nContext";
import { CloseOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onCancel,
  title,
  description,
  onSubmit,
  icon,
  iconBG,
  loading = false,
  cancelText,
  submitText,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      footer={null}
      width={440}
      closable={false}
      destroyOnClose
    >
      <div className="relative p-2 flex flex-col items-center text-center">
        {/* In-header close button */}
        <button
          onClick={onCancel}
          aria-label="Close modal"
          className="absolute top-0 right-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <CloseOutlined className="text-xs" />
        </button>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform shadow-xs"
          style={{
            backgroundColor: iconBG ? `${iconBG}18` : "#FEE4E2",
            color: iconBG || "#D92D20",
          }}
        >
          {icon ? (
            <div className="text-2xl flex items-center justify-center">{icon}</div>
          ) : (
            <ExclamationCircleOutlined className="text-2xl" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 mb-6 max-w-[340px]">
          {title && (
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            {cancelText || t("common.actions.no", { defaultValue: "Cancel" })}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onSubmit}
            className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm shadow-xs transition-opacity flex items-center justify-center cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: iconBG && iconBG !== "#00F3A2" ? iconBG : "#315CFF",
            }}
          >
            {loading ? "Processing..." : submitText || t("common.actions.yes", { defaultValue: "Confirm" })}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
