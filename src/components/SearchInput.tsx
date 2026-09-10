import { SearchIcon } from "@/utils/icons";
import { CommonSearchProp } from "@/utils/interface";
import { Input } from "antd";
import React from "react";

const SearchInput: React.FC<CommonSearchProp> = ({
  onChange,
  className,
  search,
  borderRadius = "8px",
  suffix = true,
  icon,
  placeholder = "Search..."
}) => {
  return (
      <Input
        value={search}
        onChange={onChange}
        placeholder={placeholder}
        suffix={suffix && (icon ?? <SearchIcon />)}
        prefix={!suffix && <SearchIcon />}
        className={`!h-[40px] !py-[8px] !px-[12px] !border !border-[var(--border)] hover:!border-[var(--border-strong)] focus-within:!border-[var(--primary)] focus-within:!shadow-[0_0_0_3px_rgba(49,92,255,0.12)] !bg-white !shadow-[0_1px_2px_rgba(16,24,40,0.03),inset_0_1px_1px_rgba(16,24,40,0.02)] !rounded-[${borderRadius}] !text-[14px] !text-[var(--text-primary)] transition-all duration-[150ms] ${className}`}
      />
  );
};

export default SearchInput;
