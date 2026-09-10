"use client";
import { StarIcon } from "@/utils/icons";
import { Fallback } from "@/utils/images";
import { CourseCardProps } from "@/utils/interface";
import { Tooltip } from "antd";
import Image from "next/image";
import { FC, useState } from "react";
import CommonButton from "./CommonButton";
import CommonLink from "./CommonLink";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { HeartFilled } from "@ant-design/icons";

const DashboardCourseCard: FC<CourseCardProps> = ({
  bgColor = "#FFFFFF",
  footerColor = "var(--text-secondary)",
  titleColor = "var(--text-primary)",
  instructorColor = "var(--text-secondary)",
  className = "",
  courseData,
  handleRedirect,
  veiwDetail,
  handleAddFavorite,
  handleRemoveFavorite,
  handleAddCart,
  handleRemoveCart,
}) => {
  const [imgError, setImgError] = useState(false);
  const [teacherImgError, setTeacherImgError] = useState(false);
  console.log(handleRedirect);

  const courseImageUrl = getImageUrl(courseData?.course_image_url);
  const teacherImageUrl = getImageUrl(courseData?.head_teacher_image_url);

  return (
    <div
      style={{
        backgroundColor: bgColor,
      }}
      className={`cursor-pointer flex flex-col justify-between rounded-[12px] bg-white border border-[var(--border)] gap-[16px] min-w-full overflow-hidden shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-[200ms] hover:shadow-[0_8px_20px_rgba(16,24,40,0.08),0_16px_32px_-4px_rgba(49,92,255,0.12)] hover:-translate-y-1 hover:border-[#C7D7FE] ${className}`}
    >
      <div className="flex flex-col gap-[12px]">
        <div className="w-full h-[200px] relative bg-[var(--surface-subtle)]">
          <Image
            src={
              isValidUrl(courseImageUrl) && !imgError
                ? courseImageUrl
                : Fallback
            }
            alt={courseData?.course_name || ""}
            fill
            unoptimized
            onError={() => setImgError(true)}
            className="object-cover"
          />
          <button
            onClick={() => {
              if (!courseData?.favorite && courseData?.course_id) {
                handleAddFavorite?.(courseData?.course_id);
              } else {
                if (courseData?.course_id)
                  handleRemoveFavorite?.(courseData?.course_id);
              }
            }}
            className="absolute top-[12px] right-[12px] w-[32px] h-[32px] rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-[var(--shadow-xs)] hover:bg-white transition-all duration-[150ms]"
          >
            <HeartFilled
              className={`!text-[16px] ${
                courseData?.favorite ? "!text-[var(--error)]" : "!text-[var(--text-muted)]"
              }`}
            />
          </button>
        </div>
        <div className="flex flex-col gap-[8px] px-[16px]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <div className="w-[20px] h-[20px] relative flex-shrink-0">
                  <Image
                    src={
                      isValidUrl(teacherImageUrl) && !teacherImgError
                        ? teacherImageUrl
                        : Fallback
                    }
                    alt={courseData?.head_teacher_name || ""}
                    unoptimized
                    fill
                    onError={() => setTeacherImgError(true)}
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="text-[13px]" style={{ color: instructorColor }}>
                  {courseData?.head_teacher_name}
                </div>
              </div>
              <span
                className="flex items-center gap-[4px] text-[12px] font-[500]"
                style={{ color: footerColor }}
              >
                <StarIcon color="var(--warning)" />
                {courseData?.average_rating}
              </span>
            </div>
            <p
              className="text-[12px] font-[500] mt-[2px]"
              style={{ color: footerColor }}
            >
              {courseData?.enrolled_user_count} students
            </p>
          </div>

          <div
            className="font-[600] text-[16px] leading-[140%] line-clamp-2"
            style={{ color: titleColor }}
          >
            <Tooltip placement="bottom" title={courseData?.course_name}>
              {courseData?.course_name}
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[8px] px-[16px] pb-[16px]">
        <div className="flex items-center justify-between w-full gap-[8px]">
          {courseData?.enrolled_status ? (
            <CommonButton
              text="Start Course"
              className="!w-[60%] !h-[36px] !text-[13px]"
              onClick={() => courseData && veiwDetail?.(courseData)}
            />
          ) : !courseData?.cart_status ? (
            <CommonButton
              text="Add to cart"
              className="!w-[60%] !h-[36px] !text-[13px]"
              onClick={() => {
                if (courseData?.course_id)
                  handleAddCart?.(courseData?.course_id);
              }}
            />
          ) : (
            <CommonButton
              text="Remove"
              className="!w-[60%] !h-[36px] !text-[13px] !bg-[var(--error)] !text-white"
              onClick={() => {
                if (courseData?.course_id)
                  handleRemoveCart?.(courseData?.course_id);
              }}
            />
          )}
          <CommonButton
            text="View Details"
            onClick={() => courseData && veiwDetail?.(courseData)}
            className="!w-[40%] !h-[36px] !text-[13px] border !border-[var(--border)] !bg-white !text-[var(--text-primary)] hover:!border-[var(--border-strong)]"
          />
        </div>
        <div className="text-[12px]">
          <span className="text-[var(--text-secondary)]">Include with </span>
          <CommonLink text="Skillora Pro" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCourseCard;
