import { BadgeProps } from "@/utils/interface";
import React from "react";

const BadgeComponent = ({ status, shape = "round", className }: BadgeProps) => {
  const getRoundedClass = () => {
    if (shape === "round") return "rounded-full";
    if (shape === "rectangle") return "rounded-[4px]";
    return "";
  };

  const getColorScheme = () => {
    switch (status?.toLowerCase()) {
      case "cancelled":
      case "inactive":
      case "unpublish":
      case "not submitted":
        return "bg-[#FFDEE6] text-[#FB4A49]";
      case "completed":
      case "publish":
      case "submitted":
        return "bg-[#FAFFDE] text-[#5EB85C]";
      case "on going":
      case "ongoing":
      case "draft":
        return "bg-[#FFF3DB] text-[#FFC023]";
      case "assigned":
      case "active":
      case "accepted":
      case "in progress":
      case "not started":
        return "bg-[#E1E7FF] text-[#0177DB] ";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div
      className={`text-xs ${className} font-semibold py-[3px] px-2 w-fit h-fit whitespace-nowrap ${getColorScheme()}  ${getRoundedClass()}`}
    >
      {status}
    </div>
  );
};

export default BadgeComponent;
