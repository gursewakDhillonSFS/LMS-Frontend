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
  centered = false,
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
        className="cursor-pointer absolute w-[27px] h-[27px] bg-[#002333] rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon />
      </button>
      <div className="flex flex-col items-center gap-[12px] justify-center text-center">
        <h2 className="text-[32px] font-[700] leading-[120%]">{title}</h2>
        {subtitle && (
          <p className="text-[16px] font-[400] leading-[150%] text-[#9A9A9A]">
            {subtitle}
          </p>
        )}
      </div>
      <div>{children}</div>
    </Modal>
  );
};

export default AuthModal;
