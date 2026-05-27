import { CommonButtonProp } from "@/utils/interface";
import { LoadingOutlined } from "@ant-design/icons";
import React from "react";

const CommonButton: React.FC<CommonButtonProp> = ({
  onClick,
  className,
  text,
  icon,
  type = "submit",
  bgColor,
  loading,
  disable = false,
}) => {
  return (
    <button
      style={{ backgroundColor: bgColor ? bgColor : "var(--primary)" }}
      onClick={onClick}
      type={type}
      disabled={loading || disable}
      className={`${
        loading && "opacity-50"
      } !rounded-[10px] h-[40px] p-[10px] gap-[10px] transform transition-all duration-300 flex items-center justify-center text-black cursor-pointer ${className}`}
    >
      {loading && <LoadingOutlined spin />}
      {text !== "false" && (
        <span className={`font-[500] whitespace-nowrap`}>{text}</span>
      )}
      {icon}
    </button>
  );
};

export default CommonButton;
