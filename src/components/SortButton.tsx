"use client";

import React from "react";
import { Dropdown } from "antd";
import { DownOutlined, CloseCircleFilled } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { SortByDropdownProps } from "@/utils/interface";

const SortButton: React.FC<SortByDropdownProps> = ({
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  sortOptions,
  allowClear = false,
  className = "",
}) => {
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === sortField) {
      setSortField(null);
      setSortOrder(null);
    } else {
      setSortField(key);
    }
  };

  const handleSort = (direction: "asc" | "desc") => {
    if (!sortField) return;
    setSortOrder(direction);
  };
  console.log(sortOrder, handleSort);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSortField(null);
    setSortOrder(null);
  };

  const menuProps: MenuProps = {
    items: sortOptions.map(({ label, value }) => ({
      key: value,
      label,
    })),
    onClick: handleMenuClick,
    selectedKeys: sortField ? [sortField] : [],
  };

  // console.log(sortOrder, "  sdsdcsd ", sortField);

  return (
    <Dropdown menu={menuProps} trigger={["click"]}>
      <button
        className={`flex items-center gap-[10px] justify-between cursor-pointer !h-[40px] !py-[10px] px-[10px] lg:!px-[16px] border !border-[#9A9A9A] !rounded-[12px] !shadow-none ${className}`}
      >
        {/* {sortField && (
          <div className="hover:text-blue-500">
            {sortOrder === "asc" ? (
              <ArrowDownOutlined
                className="w-[12px] h-[12px]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSort("desc");
                }}
              />
            ) : (
              <ArrowUpOutlined
                className="w-[12px] h-[12px]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSort("asc");
                }}
              />
            )}
          </div>
        )} */}

        <span className=" whitespace-nowrap">
          {sortField
            ? sortOptions.find((o) => o.value === sortField)?.label
            : "Sort By"}
        </span>

        {allowClear && sortField ? (
          <span
            className="text-gray-400 text-xs ml-2 hover:text-gray-600 cursor-pointer"
            onClick={handleClear}
          >
            <CloseCircleFilled />
          </span>
        ) : (
          <DownOutlined className="w-[12px] h-[12px]" />
        )}
      </button>
    </Dropdown>
  );
};

export default SortButton;
