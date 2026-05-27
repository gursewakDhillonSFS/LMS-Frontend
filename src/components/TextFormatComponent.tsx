import React from "react";

interface TextFormatComponentProp {
  text?: string | undefined;
  number?: string | undefined;
  className?: string;
}
const TextFormatComponent = ({
  text,
  number,
  className,
}: TextFormatComponentProp) => {
  const getColorScheme = () => {
    switch (text?.toLowerCase()) {
      case "d":
      case "d+":
      case "fail":
        return "text-[#FB4A49]";
      case "a":
      case "a+":
      case "pass":
      case "completed":
        return "text-[#5EB85C]";
      case "b":
      case "b+":
      case "pending":
        return "text-[#FFC023]";
      case "c":
      case "c+":
        return "text-[#0177DB] ";
      default:
        return "text-gray-600";
    }
  };
  const getNumberColorScheme = () => {
    if (number) {
      const value = Number(number?.split("/")?.[0]);
      if (value >= 85) {
        return "text-[#5EB85C]";
      }
      if (value >= 40 && value < 85) {
        return "text-[#FFC023]";
      }
      if (value < 40) {
        return "text-[#FB4A49]";
      }
    }
  };

  return (
    <div
      className={`text-[18px] font-semibold ${
        text ? getColorScheme() : getNumberColorScheme()
      } ${className}`}
    >
      {text ?? number}
    </div>
  );
};

export default TextFormatComponent;
