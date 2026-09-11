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
    <div className="mx-3.5 my-4 p-4 rounded-2xl bg-gradient-to-br from-[#3B66FF]/15 via-[#3B66FF]/8 to-transparent border border-[#3B66FF]/20 flex flex-col gap-3 relative overflow-hidden group">
      {/* Background ambient light */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#3B66FF]/20 rounded-full blur-xl pointer-events-none" />

      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-[#3B66FF] text-white flex items-center justify-center shadow-sm shrink-0">
        <ReadOutlined className="text-base" />
      </div>

      {/* Text Copy */}
      <div className="flex flex-col gap-1 z-10">
        <h4 className="text-xs font-bold text-[var(--dash-text-primary)] tracking-tight">
          Create. Teach. Inspire.
        </h4>
        <p className="text-[11px] text-[var(--dash-text-muted)] leading-relaxed">
          Share your knowledge and help students grow.
        </p>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => router.push(createCoursePath)}
        className="w-full h-8 rounded-xl bg-[#3B66FF] hover:bg-[#2F54E8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(59,102,255,0.3)] transition-all cursor-pointer group-hover:-translate-y-0.5"
      >
        <PlusOutlined className="text-xs" />
        <span>Create Course</span>
      </button>
    </div>
  );
};

export default SidebarPromoCard;
