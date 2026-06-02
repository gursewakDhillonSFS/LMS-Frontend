import { TabSwitcherProps } from "@/utils/interface";
import React from "react";

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeKey,
  onChange,
  className = "",
  minWidth = "150px"
}) => (
  <div className={`rounded-[10px] bg-white p-[2px] w-fit flex ${className}`}>
    {tabs.map(({ key, label }) => {
      const isActive = key === activeKey;
      const activeClasses = "bg-primary text-[#002333] font-medium";
      const inactiveClasses = "text-black";
      return (
        <button
          key={key}
          onClick={() => onChange?.(key)}
          className={`text-[#2D2D2D] transition-all ease-in duration-200 whitespace-nowrap min-w-[${minWidth}] px-4 sm:px-10 py-2 rounded-[10px] cursor-pointer text-sm ${
            isActive ? activeClasses : inactiveClasses
          }`}
        >
          {label}
        </button>
      );
    })}
  </div>
);

export default TabSwitcher;
