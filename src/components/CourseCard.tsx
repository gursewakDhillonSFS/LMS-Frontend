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
  bgColor = "#0E0E0E",
  footerColor = "var(--primary)",
  titleColor = "#ffffff",
  instructorColor = "#ffffff",
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
        boxShadow: "0px 4px 35px rgba(0, 0, 0, 0.08)",
      }}
      className={`cursor-pointer flex flex-col justify-between rounded-[15px] h-[355px] p-[16px] gap-[12px] w-full text-white ${className}`}
    >
      <div className="flex flex-col gap-[12px]">
        <div className="w-full h-[180px] relative">
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
            className="rounded-[12px] object-cover"
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center gap-[4px]">
            <div className="w-[24px] h-[24px] relative">
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
                className="rounded-[12px] object-cover"
              />
            </div>
            <div className="text-[14px]" style={{ color: instructorColor }}>
              by {data?.instructor_name ?? data?.head_teacher_name}
            </div>
          </div>
          <div
            className={`font-[700] text-[18px] truncate`}
            style={{ color: titleColor }}
          >
            <Tooltip placement="bottom" title={data?.course_name}>
              {data?.course_name}
            </Tooltip>
          </div>
        </div>
      </div>

      {certificate ? (
        <p
          className={`flex items-center gap-1 text-[12px] font-[500]`}
          style={{ color: footerColor }}
        >
          Professional Certificate | {data?.enrolled_user_count} students
        </p>
      ) : (
        <div className="flex items-center justify-between">
          <p
            className={`text-[12px] font-[500]`}
            style={{ color: footerColor }}
          >
            {data?.enrolled_user_count} students
          </p>
          <span
            className={`flex items-center gap-1 text-[12px] font-[500]`}
            style={{ color: footerColor }}
          >
            <StarIcon color={footerColor} />
            {data?.average_rating}
          </span>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
