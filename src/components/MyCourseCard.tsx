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
    <div className="p-4 rounded-[12px] bg-white border border-[var(--border)] shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] flex flex-col gap-4 hover:shadow-[0_4px_16px_rgba(16,24,40,0.08),0_12px_24px_-4px_rgba(49,92,255,0.08)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] transition-all duration-150">
      <div className="flex items-center gap-3.5">
        <div className="relative w-16 h-16 shrink-0 rounded-[8px] overflow-hidden bg-[var(--surface-subtle)] border border-[var(--border)]">
          <Image
            className="object-cover"
            src={courseImageUrl && !imgError ? courseImageUrl : Fallback}
            alt={course_name}
            unoptimized
            fill
            onError={() => setImgError(true)}
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-semibold text-[15px] text-[var(--text-primary)] truncate">
            {course_name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1">
            <div className="relative w-5 h-5 shrink-0 rounded-full overflow-hidden">
              <Image
                src={
                  teacherImageUrl && !teacherImgError
                    ? teacherImageUrl
                    : Fallback
                }
                alt={name}
                unoptimized
                fill
                onError={() => setTeacherImgError(true)}
                className="object-cover"
              />
            </div>
            <p className="text-xs text-[var(--text-secondary)] truncate">by {name}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 pt-2 border-t border-[var(--border)]">
        {demoClass ? (
          <div className="flex items-center text-xs text-[var(--text-secondary)] gap-1.5">
            <ClockWheelIcon />
            <span>6:00 PM - 6:45 PM</span>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2.5 max-w-[60%]">
            <Progress
              strokeColor={progress >= 100 ? "#10B981" : "var(--primary)"}
              percent={progress}
              showInfo={false}
              size="small"
              className="!m-0"
            />
            <span className={`text-xs font-semibold whitespace-nowrap ${
              progress >= 100 ? "text-emerald-600" : "text-[var(--text-secondary)]"
            }`}>
              {Number(progress)}%
            </span>
            {progress >= 100 && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Completed
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 shrink-0">
          {progress >= 100 && !demoClass && (
            <button
              type="button"
              onClick={() => route.push(RoutePaths.MyCertificate)}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              Certificate
            </button>
          )}
          <CommonButton
            text={demoClass ? "Demo Class" : progress >= 100 ? "Review" : "Continue"}
            onClick={
              demoClass
                ? () => {}
                : () => route.push(`${RoutePaths?.MyCourses}/course-details?course_id=${course_id}${batch_id ? `&batch_id=${batch_id}` : ''}`)
            }
            className="!w-auto !px-4 !h-8 !text-xs !rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
