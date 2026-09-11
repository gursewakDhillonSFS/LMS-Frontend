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
  disabled = false,
}) => {
  const isButtonDisabled = loading || disable || disabled;
  const hasBgInClass = className?.includes("bg-") || className?.includes("!bg-");
  const isExplicitTransparent =
    className?.includes("!bg-transparent") || className?.includes("bg-transparent");
  const isOutline = !hasBgInClass && (isExplicitTransparent || className?.includes("border"));
  const isDestructive =
    className?.includes("!bg-[#FB4A49]") || className?.includes("!text-[#FF4D4F]");

  // Inline background color resolution
  let resolvedBg: string | undefined = undefined;
  if (bgColor) {
    resolvedBg = bgColor;
  } else if (hasBgInClass) {
    resolvedBg = undefined; // Let Tailwind className handle it
  } else if (isExplicitTransparent || isOutline) {
    resolvedBg = "transparent";
  } else if (isDestructive) {
    resolvedBg = "var(--error)";
  } else {
    resolvedBg = "var(--primary)";
  }

  return (
    <button
      style={resolvedBg !== undefined ? { backgroundColor: resolvedBg } : undefined}
      onClick={onClick}
      type={type}
      disabled={isButtonDisabled}
      className={`${
        loading ? "opacity-60" : ""
      } ${
        isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
      } rounded-[8px] h-[40px] px-[16px] py-[8px] gap-[8px] transition-all duration-[150ms] ease-in-out flex items-center justify-center cursor-pointer font-[500] text-[14px] ${
        !isOutline && !isDestructive && !bgColor && !hasBgInClass
          ? "text-white bg-[linear-gradient(180deg,#3B66FF_0%,#264DE4_100%)] shadow-[0_1px_2px_rgba(16,24,40,0.08),0_2px_6px_rgba(49,92,255,0.25)] hover:shadow-[0_2px_4px_rgba(16,24,40,0.08),0_6px_14px_rgba(49,92,255,0.35)] hover:-translate-y-px active:translate-y-0 active:shadow-xs"
          : ""
      } ${
        isOutline
          ? "text-slate-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_2px_4px_rgba(16,24,40,0.07)] hover:-translate-y-px active:translate-y-0"
          : ""
      } ${
        isDestructive ? "text-white shadow-[0_1px_2px_rgba(16,24,40,0.08),0_2px_6px_rgba(214,69,69,0.25)] hover:-translate-y-px" : ""
      } ${className || ""}`}
    >
      {loading && <LoadingOutlined spin />}
      {text !== "false" && (
        <span className="font-[500] whitespace-nowrap">{text}</span>
      )}
      {icon}
    </button>
  );
};

export default CommonButton;
