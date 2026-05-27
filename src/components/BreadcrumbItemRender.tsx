"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface BreadcrumbItemType {
  key?: React.Key;
  title?: React.ReactNode;
  href?: string;
}

export const BreadcrumbItemRender: React.FC<{ item: BreadcrumbItemType }> = ({
  item,
}) => {
  const router = useRouter();

  return item.href ? (
    <span
      onClick={() => router.push(item.href!)}
      className="!text-secondary cursor-pointer font-[500] text-[16px] text-center"
    >
      {item.title}
    </span>
  ) : (
    <span className="text-[#002333] font-[500] text-[16px]">{item.title}</span>
  );
};
