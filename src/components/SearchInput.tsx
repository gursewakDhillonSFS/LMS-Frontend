import { SearchIcon } from "@/utils/icons";
import { CommonSearchProp } from "@/utils/interface";
import { Input } from "antd";
import React from "react";

const SearchInput: React.FC<CommonSearchProp> = ({
  onChange,
  className,
  search,
  borderRadius = "12px",
  suffix = true,
  icon,
  placeholder = "Search classes...."
}) => {
  return (
      <Input
        value={search}
        onChange={onChange}
        placeholder={placeholder}
        suffix={suffix && (icon ?? <SearchIcon />)}
        prefix={!suffix && <SearchIcon />}
        className={`!h-[40px] !py-[10px] px-[16px]  border !border-[#9A9A9A] !rounded-[${borderRadius}] !shadow-none ${className}`}
      />
  );
};

export default SearchInput;
