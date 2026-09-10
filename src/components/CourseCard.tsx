"use client";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { StarIcon } from "@/utils/icons";
import { Fallback } from "@/utils/images";
import { CourseCardProps } from "@/utils/interface";
import { Tooltip } from "antd";
import Image from "next/image";
import React, { FC, useState } from "react";

const BookmarkIcon = ({ active = false }: { active?: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={active ? "var(--primary)" : "none"}
    stroke="var(--primary)"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--text-muted)] shrink-0"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--text-muted)] shrink-0"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CourseCard: FC<CourseCardProps> = ({
  certificate,
  data,
  bgColor = "#FFFFFF",
  footerColor = "var(--text-secondary)",
  titleColor = "var(--text-primary)",
  instructorColor = "var(--text-secondary)",
  className = "",
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const [teacherImgError, setTeacherImgError] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const courseImageUrl = getImageUrl(data?.course_image_url);
  const teacherImageUrl = getImageUrl(data?.head_teacher_image_url);

  const categoryName =
    data?.category_name ||
    (data as any)?.category_id?.category_name ||
    "Web Development";

  const ratingValue = data?.average_rating
    ? Number(data.average_rating).toFixed(1)
    : "4.8";

  const reviewCount = data?.enrolled_user_count
    ? `${Math.max(12, Math.round(Number(data.enrolled_user_count) * 1.8))}k reviews`
    : "8.4k reviews";

  const durationText = (data as any)?.duration || "5h 20m";
  const studentCount = data?.enrolled_user_count
    ? `${data.enrolled_user_count} students`
    : "1.2k students";

  return (
    <div
      onClick={() => onClick?.(data)}
      style={{
        backgroundColor: bgColor,
      }}
      className={`group cursor-pointer flex flex-col justify-between rounded-[12px] border border-[var(--border)] h-[375px] p-0 w-full overflow-hidden bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-[200ms] hover:shadow-[0_8px_20px_rgba(16,24,40,0.08),0_16px_32px_-4px_rgba(49,92,255,0.12)] hover:-translate-y-1 hover:border-[#C7D7FE] ${className}`}
    >
      <div className="flex flex-col">
        {/* Thumbnail with Bookmark Button */}
        <div className="w-full h-[160px] relative bg-[var(--surface-subtle)] overflow-hidden">
          <Image
            src={
              isValidUrl(courseImageUrl) && !imgError
                ? courseImageUrl
                : Fallback
            }
            alt={data?.course_name || "course"}
            unoptimized
            fill
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBookmarked(!bookmarked);
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-sm border border-black/5 hover:bg-white transition-transform active:scale-90"
          >
            <BookmarkIcon active={bookmarked} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-2 p-3.5 pb-2">
          {/* Category Tag */}
          <div className="inline-block">
            <span className="text-[11px] font-semibold text-[var(--primary)] bg-[#EEF4FF] px-2 py-0.5 rounded-full">
              {categoryName}
            </span>
          </div>

          {/* Course Name */}
          <div
            className="font-bold text-[14px] leading-[135%] line-clamp-2 min-h-[38px]"
            style={{ color: titleColor }}
          >
            <Tooltip placement="bottom" title={data?.course_name}>
              {data?.course_name}
            </Tooltip>
          </div>

          {/* Instructor Row */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="w-[20px] h-[20px] relative rounded-full overflow-hidden shrink-0 border border-[var(--border)]">
              <Image
                src={
                  isValidUrl(teacherImageUrl) && !teacherImgError
                    ? teacherImageUrl
                    : Fallback
                }
                alt={data?.instructor_name || ""}
                unoptimized
                fill
                onError={() => setTeacherImgError(true)}
                className="rounded-full object-cover"
              />
            </div>
            <span
              className="text-[12px] font-medium truncate"
              style={{ color: instructorColor }}
            >
              {data?.instructor_name ?? data?.head_teacher_name ?? "Instructor"}
            </span>
          </div>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 pt-0.5 text-[12px]">
            <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
              <StarIcon color="#F59E0B" />
              {ratingValue}
            </span>
            <span className="text-[var(--text-muted)] text-[11px]">
              ({reviewCount})
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer with Duration & Students */}
      <div className="px-3.5 pb-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-medium">
        <span className="flex items-center gap-1.5">
          <ClockIcon />
          {durationText}
        </span>
        <span className="flex items-center gap-1.5">
          <UsersIcon />
          {studentCount}
        </span>
      </div>
    </div>
  );
};

export default CourseCard;

