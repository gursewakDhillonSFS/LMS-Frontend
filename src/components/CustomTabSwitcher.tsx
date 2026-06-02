import { TabSwitcherProps } from "@/utils/interface";
import React from "react";

export const CustomTabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeKey,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex bg-white w-full items-start ${className}`}>
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`cursor-pointer w-[200px] relative px-4 py-2 text-sm font-medium transition-colors ${
            activeKey === key ? "text-[#3F27F0] font-semibold" : "text-black"
          }`}
        >
          {label}
          {activeKey === key && (
            <div className="absolute left-0 bottom-0 w-full h-1 bg-[#3F27F0] rounded-t-[16px]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default CustomTabSwitcher;
