import { Fallback } from "@/utils/images";
import { getImageUrl } from "@/utils/comman";
import { Progress } from "antd";
import Image from "next/image";
import React, { FC, useState } from "react";
import CommonButton from "./CommonButton";
import { ClockWheelIcon } from "@/utils/icons";
import { useRouter } from "next/navigation";
import { RoutePaths } from "@/utils/enums";

interface MyCourseCardProp {
  demoClass?: boolean;
  course_id: string;
  batch_id?: string;
  user_id: string;
  course_name: string;
  course_image_url: string;
  progress: number;
  instructor_id: string;
  name: string;
  instructor_url: string;
  enrolled_at: string;
}

export const MyCoursesCard: FC<MyCourseCardProp> = ({
  demoClass = false,
  course_id,
  batch_id,
  course_name,
  course_image_url,
  name,
  instructor_url,
  progress,
}) => {
  const route = useRouter();
  const [imgError, setImgError] = useState(false);
  const [teacherImgError, setTeacherImgError] = useState(false);

  const courseImageUrl = getImageUrl(course_image_url);
  const teacherImageUrl = getImageUrl(instructor_url);
  return (
    <div className="p-4 rounded-[15px] bg-white">
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20">
          <Image
            className=" rounded-xl"
            src={courseImageUrl && !imgError ? courseImageUrl : Fallback}
            alt="image"
            unoptimized
            fill
            onError={() => setImgError(true)}
          />
        </div>
        <div className="flex flex-col">
          <div className={`font-[700] text-[18px] leading-[150%] text-black`}>
            {course_name}
          </div>

          <div className="flex items-center gap-[4px]">
            <div className="relative w-[24px] h-[24px]">
              <Image
                src={
                  teacherImageUrl && !teacherImgError
                    ? teacherImageUrl
                    : Fallback
                }
                alt={"avtar"}
                unoptimized
                fill
                onError={() => setTeacherImgError(true)}
                className="rounded-[12px] object-cover"
              />
            </div>
            <p className="text-[12px] leading-[150%]">by {name}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {demoClass ? (
          <div className="flex items-center text-sm text-[#7B7B7B]  gap-1">
            <ClockWheelIcon />
            {"6:00 PM - 6:45 PM"}
          </div>
        ) : (
          <div className="w-[60%] flex items-center justify-center gap-1">
            <Progress
              strokeColor="var(--secondary)"
              percent={progress}
              showInfo={false}
            />{" "}
            <span className="text-[#2D2D2D] font-poppins whitespace-nowrap">
              {Number(progress)}% complete
            </span>
          </div>
        )}
        <CommonButton
          text={demoClass ? "Demo Class" : "Start Now"}
          onClick={
            demoClass
              ? () => {}
              : () => route.push(`${RoutePaths?.MyCourses}/course-details?course_id=${course_id}${batch_id ? `&batch_id=${batch_id}` : ''}`)
          }
          className="w-[130px]"
        />
      </div>
    </div>
  );
};
