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
        className={`!h-[40px] !py-[8px] !px-[12px] !border !border-[var(--border)] hover:!border-[var(--border-strong)] focus-within:!border-[var(--primary)] !rounded-[${borderRadius}] !shadow-none !text-[14px] !text-[var(--text-primary)] ${className}`}
      />
  );
};

export default SearchInput;
