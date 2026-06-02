"use client";
import React from "react";
import { Pagination as AntPagination, PaginationProps } from "antd";
import { LeftArrowIcon, RightArrowIcon } from "@/utils/icons";

interface PaginationControlProps {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  total: number;
}

const Pagination: React.FC<PaginationControlProps> = ({
  page,
  setPage,
  limit,
  total,
}) => {
  const itemRender: PaginationProps["itemRender"] = (
    _,
    type,
    originalElement
  ) => {
    if (type === "prev" || type === "next") {
      return null;
    }
    return originalElement;
  };

  return (
    <div className="flex items-center justify-between w-full px-6">
      <button
        onClick={() => {
          if (page === 1) return;
          setPage(page - 1);
        }}
        className={`flex items-center text-[14px] font-medium gap-2 px-1 py-4 ${
          page === 1 ? "opacity-20 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <LeftArrowIcon />
        Previous
      </button>
      <AntPagination
        current={page}
        total={total}
        pageSize={limit}
        onChange={(value) => setPage(value)}
        itemRender={itemRender}
        showSizeChanger={false}
      />
      <button
        onClick={() => {
          if (page === Math.ceil(total / limit)) return;
          setPage(page + 1);
        }}
        className={`flex items-center text-[14px] font-medium gap-2 px-1 py-4 ${
          page === Math.ceil(total / limit)
            ? "opacity-20 cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        Next
        <RightArrowIcon />
      </button>
    </div>
  );
};

export default Pagination;
