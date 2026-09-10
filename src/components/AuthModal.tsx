import { CloseIcon } from "@/utils/icons";
import { AuthModalProps } from "@/utils/interface";
import { Modal } from "antd";
import React from "react";

const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  centered = true,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered={centered}
      closable={false}
      prefixCls="common-modal"
      className={`relative ${!centered && "!top-10"}`}
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-9 h-9 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 rounded-full flex items-center justify-center top-4 right-4 transition-all duration-150 z-30 border border-slate-300 shadow-sm focus:outline-none"
        aria-label="Close"
      >
        <CloseIcon color="#0F172A" />
      </button>
      <div className="flex flex-col items-center gap-1.5 justify-center text-center pt-2 pb-4 px-4">
        <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
            {subtitle}
          </p>
        )}
      </div>
      <div className="px-2">{children}</div>
    </Modal>
  );
};

export default AuthModal;
