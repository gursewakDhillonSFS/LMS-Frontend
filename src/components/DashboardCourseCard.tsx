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
  bgColor = "#ffffff",
  footerColor = "var(--secondary)",
  titleColor = "black",
  instructorColor = "black",
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
        boxShadow: "0px 4px 35px rgba(0, 0, 0, 0.08)",
      }}
      className={`cursor-pointer flex flex-col justify-between rounded-[15px] p-[16px] gap-[30px] min-w-full text-white ${className}`}
    >
      <div className="flex flex-col gap-[12px]">
        <div className="w-full h-[250px] relative">
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
            className="rounded-[12px]"
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
            className="absolute top-2 right-2"
          >
            <HeartFilled
              className={`!text-2xl ${
                courseData?.favorite ? "!text-[#FB4A49]" : ""
              }`}
            />
          </button>
        </div>
        <div className="flex flex-col gap-[6px]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[4px]">
                <div className="w-[24px] h-[24px] relative">
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
                    className="rounded-[12px] object-cover"
                  />
                </div>
                <div className="text-[14px]" style={{ color: instructorColor }}>
                  by {courseData?.head_teacher_name}
                </div>
              </div>
              <span
                className={`flex items-center gap-1 text-[12px] font-[500]`}
                style={{ color: footerColor }}
              >
                <StarIcon color={footerColor} />
                {courseData?.average_rating}
              </span>
            </div>
            <p
              className={`text-[12px] font-[500]`}
              style={{ color: footerColor }}
            >
              {courseData?.enrolled_user_count} students
            </p>
          </div>

          <div
            className={`font-[700] text-[18px]`}
            style={{ color: titleColor }}
          >
            <Tooltip placement="bottom" title={courseData?.course_name}>
              {courseData?.course_name}
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center justify-between w-full gap-[6px]">
          {courseData?.enrolled_status ? (
            <CommonButton
              text={`Start Course`}
              className="!w-[60%] !bg-[#FB4A49] !text-white border-none"
              onClick={() => courseData && veiwDetail?.(courseData)}
            />
          ) : !courseData?.cart_status ? (
            <CommonButton
              text={`Add to cart`}
              className="!w-[60%]"
              onClick={() => {
                if (courseData?.course_id)
                  handleAddCart?.(courseData?.course_id);
              }}
            />
          ) : (
            <CommonButton
              text={`Remove`}
              className="!w-[60%] !bg-[#FB4A49] !text-white"
              onClick={() => {
                if (courseData?.course_id)
                  handleRemoveCart?.(courseData?.course_id);
              }}
            />
          )}
          <CommonButton
            text="View Details"
            onClick={() => courseData && veiwDetail?.(courseData)}
            className="!w-[40%] border !bg-transparent border-secondary !text-secondary"
          />
        </div>
        <div>
          <span className="text-black">Include with </span>
          <CommonLink text="Learning+ Pro" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCourseCard;
