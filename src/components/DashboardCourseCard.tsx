"use client";
import { StarIcon } from "@/utils/icons";
import { Fallback } from "@/utils/images";
import { CourseCardProps } from "@/utils/interface";
import { Tooltip } from "antd";
import Image from "next/image";
import { FC, useState } from "react";
import CommonButton from "./CommonButton";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { HeartFilled, LoadingOutlined } from "@ant-design/icons";

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
}) => {
  const [imgError, setImgError] = useState(false);
  const [teacherImgError, setTeacherImgError] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const courseImageUrl = getImageUrl(courseData?.course_image_url);
  const teacherImageUrl = getImageUrl(courseData?.head_teacher_image_url);

  const isFree = !courseData?.course_price || courseData.course_price === 0;
  const isEnrolled = courseData?.enrolled_status || courseData?.is_enrolled;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favLoading) return;
    const courseId = courseData?.course_id;
    if (!courseId) return;

    try {
      setFavLoading(true);
      if (!courseData?.favorite) {
        await handleAddFavorite?.(courseId);
      } else {
        await handleRemoveFavorite?.(courseId);
      }
    } catch (error) {
      console.error("Failed to toggle favorite course:", error);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: bgColor,
      }}
      className={`cursor-pointer flex flex-col justify-between rounded-[12px] bg-white border border-[var(--border)] gap-[16px] min-w-full overflow-hidden shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-[200ms] hover:shadow-[0_8px_20px_rgba(16,24,40,0.08),0_16px_32px_-4px_rgba(49,92,255,0.12)] hover:-translate-y-1 hover:border-[#C7D7FE] ${className}`}
    >
      <div className="flex flex-col gap-[12px]" onClick={() => courseData && veiwDetail?.(courseData)}>
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
            type="button"
            onClick={handleFavoriteClick}
            disabled={favLoading}
            className="absolute top-[12px] right-[12px] w-[32px] h-[32px] rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-[var(--shadow-xs)] hover:bg-white transition-all duration-[150ms] z-10 disabled:cursor-wait"
            title={courseData?.favorite ? "Remove from saved" : "Save course"}
          >
            {favLoading ? (
              <LoadingOutlined className="!text-[15px] !text-[#315CFF] animate-spin" />
            ) : (
              <HeartFilled
                className={`!text-[16px] transition-colors ${
                  courseData?.favorite ? "!text-[var(--error)]" : "!text-[var(--text-muted)] hover:!text-[var(--text-secondary)]"
                }`}
              />
            )}
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
                {courseData?.average_rating || 0}
              </span>
            </div>
            <p
              className="text-[12px] font-[500] mt-[2px]"
              style={{ color: footerColor }}
            >
              {courseData?.enrolled_user_count || 0} students
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
          <div className="flex flex-col">
            <span className="text-[11px] font-[500] text-[var(--text-tertiary)] uppercase tracking-wider">Price</span>
            <span className="text-[16px] font-[700] text-[var(--text-primary)]">
              {isFree ? "Free" : `$${courseData?.course_price}`}
            </span>
          </div>
          {isEnrolled ? (
            <CommonButton
              text="Start Course"
              className="!h-[36px] !px-[16px] !text-[13px]"
              onClick={() => courseData && veiwDetail?.(courseData)}
            />
          ) : (
            <CommonButton
              text="View Details"
              onClick={() => courseData && veiwDetail?.(courseData)}
              className="!h-[36px] !px-[16px] !text-[13px] border !border-[var(--primary)] !bg-primary/5 !text-[var(--primary)] hover:!bg-primary hover:!text-white transition-all"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCourseCard;
