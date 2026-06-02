import { CommonLinkProps } from "@/utils/interface";
import React from "react";

const CommonLink: React.FC<CommonLinkProps> = ({
  text,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-secondary cursor-pointer font-[600] hover:underline ${className}`}
    >
      {text}
    </button>
  );
};

export default CommonLink;
