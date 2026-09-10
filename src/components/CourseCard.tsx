"use client";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { StarIcon } from "@/utils/icons";
import { Fallback } from "@/utils/images";
import { CourseCardProps } from "@/utils/interface";
import { Tooltip } from "antd";
import Image from "next/image";
import { FC, useState } from "react";

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

  const courseImageUrl = getImageUrl(data?.course_image_url);
  const teacherImageUrl = getImageUrl(data?.head_teacher_image_url);
  return (
    <div
      onClick={() => onClick?.(data)}
      style={{
        backgroundColor: bgColor,
      }}
      className={`cursor-pointer flex flex-col justify-between rounded-[10px] border border-[var(--border)] h-[355px] p-0 w-full overflow-hidden transition-all duration-[200ms] hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] ${className}`}
    >
      <div className="flex flex-col">
        <div className="w-full h-[180px] relative bg-[var(--surface-subtle)]">
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
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-[8px] p-[16px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-[20px] h-[20px] relative flex-shrink-0">
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
            <div className="text-[13px] truncate" style={{ color: instructorColor }}>
              {data?.instructor_name ?? data?.head_teacher_name}
            </div>
          </div>
          <div
            className="font-[600] text-[16px] leading-[140%] line-clamp-2"
            style={{ color: titleColor }}
          >
            <Tooltip placement="bottom" title={data?.course_name}>
              {data?.course_name}
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="px-[16px] pb-[16px]">
        {certificate ? (
          <p
            className="flex items-center gap-1 text-[12px] font-[500]"
            style={{ color: footerColor }}
          >
            Professional Certificate · {data?.enrolled_user_count} students
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <p
              className="text-[12px] font-[500]"
              style={{ color: footerColor }}
            >
              {data?.enrolled_user_count} students
            </p>
            <span
              className="flex items-center gap-[4px] text-[12px] font-[500]"
              style={{ color: footerColor }}
            >
              <StarIcon color="var(--warning)" />
              {data?.average_rating}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
