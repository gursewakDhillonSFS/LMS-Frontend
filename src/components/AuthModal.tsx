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
      width={460}
      centered={centered}
      closable={false}
      prefixCls="common-modal"
      className={`relative ${!centered && "!top-10"}`}
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-8 h-8 bg-[var(--surface-subtle)] hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full flex items-center justify-center top-4 right-4 transition-colors duration-150 z-10"
        aria-label="Close"
      >
        <CloseIcon />
      </button>
      <div className="flex flex-col items-center gap-2 justify-center text-center pt-2 pb-4">
        <h2 className="text-[24px] md:text-[26px] font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-sm">
            {subtitle}
          </p>
        )}
      </div>
      <div>{children}</div>
    </Modal>
  );
};

export default AuthModal;
