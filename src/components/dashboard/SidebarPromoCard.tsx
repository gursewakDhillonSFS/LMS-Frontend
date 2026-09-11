"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PlusOutlined, ReadOutlined } from "@ant-design/icons";

interface SidebarPromoCardProps {
  collapsed?: boolean;
  createCoursePath?: string;
}

const SidebarPromoCard: React.FC<SidebarPromoCardProps> = ({
  collapsed = false,
  createCoursePath = "/courses/create-course",
}) => {
  const router = useRouter();

  if (collapsed) return null;

  return (
    <div className="mx-3.5 my-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-100 flex flex-col gap-3 relative overflow-hidden group shadow-xs">
      {/* Background ambient light */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />

      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-[#315CFF] text-white flex items-center justify-center shadow-xs shrink-0">
        <ReadOutlined className="text-base" />
      </div>

      {/* Text Copy */}
      <div className="flex flex-col gap-1 z-10">
        <h4 className="text-xs font-bold text-[#101828] tracking-tight">
          Create. Teach. Inspire.
        </h4>
        <p className="text-[11px] text-[#667085] leading-relaxed">
          Share your knowledge and help students grow.
        </p>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => router.push(createCoursePath)}
        className="w-full h-8 rounded-xl bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_2px_6px_rgba(49,92,255,0.25)] transition-all cursor-pointer group-hover:-translate-y-0.5"
      >
        <PlusOutlined className="text-xs" />
        <span>Create Course</span>
      </button>
    </div>
  );
};

export default SidebarPromoCard;
