"use client";
import CommonButton from "@/components/CommonButton";
import QuillEditor from "@/components/QuillEditor";
import {
  getCourseProgressApi,
  getLessonsWithSublessonsApi,
  getCourseReviewApi,
} from "@/services/collections";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  ClockWheelIcon,
  FileIcon,
  LockIcon,
  VideoIcon,
} from "@/utils/icons";
import { CheckCircleFilled, RightOutlined, StarOutlined } from "@ant-design/icons";
import { Collapse, Input, Modal, Rate, Skeleton } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "@/utils/toast";
import { formatMediaDuration, materialKindLabel } from "@/utils/comman";
import { CustomerServiceOutlined, FilePdfOutlined, FileTextOutlined } from "@ant-design/icons";
import { postApi } from "@/services/methods";
import { useRouter } from "next/navigation";

// ─── Type definitions ────────────────────────────────────────────────────────
interface StudyMaterial {
  file_url: string;
  file_name: string;
  file_type: string;
  duration_seconds?: number | null;
}

interface Sublesson {
  sublesson_id: string;
  sublesson_name: string;
  sublesson_description?: string;
  studyMaterials?: StudyMaterial[];
}

interface Lesson {
  lesson_id: string;
  lesson_name: string;
  lesson_description?: string;
  unlock_after_previous?: boolean;
  sublessons: Sublesson[];
  studyMaterials?: StudyMaterial[];
  week?: number;
  order?: number;
}

interface CourseProps {
  courseId: string;
  batchId: string;
  overview?: string;
}

// ─── Reusable study-material row ─────────────────────────────────────────────
const MaterialRow = ({
  name,
  fileType,
  durationSeconds,
  isCompleted,
  onOpen,
}: {
  name: string;
  fileType: string | null;
  durationSeconds?: number | null;
  isCompleted: boolean;
  onOpen: () => void;
}) => {
  const kind = (fileType || "").toLowerCase();
  const durationLabel = kind === "video" || kind === "audio" ? formatMediaDuration(durationSeconds) : "";
  return (
  <div
    className="flex items-center justify-between border-b border-[#C8C8C8] last:border-0 p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
    onClick={onOpen}
  >
    <div className="flex gap-3 items-center">
      <div className="bg-primary rounded-full h-11 w-11 flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
        {kind === "video" ? (
          <VideoIcon />
        ) : kind === "audio" ? (
          <CustomerServiceOutlined className="text-lg" />
        ) : kind === "pdf" ? (
          <FilePdfOutlined className="text-lg" />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[16px] font-[600] leading-[120%] group-hover:text-secondary transition-colors">{name}</p>
        <p className="text-sm text-[#7B7B7B] flex gap-1 items-center">
          {durationLabel ? <ClockWheelIcon /> : <FileTextOutlined />}
          <span>{materialKindLabel(kind)}</span>
          {durationLabel ? <span>• {durationLabel}</span> : null}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {isCompleted ? (
        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
          <CheckCircleFilled /> Completed
        </span>
      ) : (
        <span className="text-xs text-white bg-secondary hover:bg-secondary/90 font-medium rounded-full px-3.5 py-1.5 transition-colors shadow-2xs flex items-center gap-1">
          Open Task
        </span>
      )}
    </div>
  </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Course: React.FC<CourseProps> = ({ courseId, batchId, overview }) => {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState<string[] | string>(["0"]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Get current user id
  const userId = useSelector((state: RootState) => state?.userdata?.user_id);

  // Lessons & progress state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [totalWeeks, setTotalWeeks] = useState<number>(4);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | "all">("all");
  const [lessonOverview, setLessonOverview] = useState<string>("");
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [completedSublessons, setCompletedSublessons] = useState<Set<string>>(new Set());
  const [completedMaterials, setCompletedMaterials] = useState<Set<string>>(new Set());
  const [progressPercent, setProgressPercent] = useState(0);

  // ─── Fetch lessons ──────────────────────────────────────────────────────
  const fetchLessons = useCallback(async () => {
    if (!courseId) return;
    setLoadingLessons(true);
    try {
      const res = await getLessonsWithSublessonsApi(courseId);
      if (res?.status) {
        const fetchedLessons = res.data?.lessons || [];
        setLessons(fetchedLessons);
        setLessonOverview(res.data?.overview || "");
        const computedWeeks =
          res.data?.total_weeks ||
          Math.max(1, ...fetchedLessons.map((l: any) => l.week || 1));
        setTotalWeeks(computedWeeks || 4);
      }
    } catch {
      toast.error("Failed to load lessons");
    } finally {
      setLoadingLessons(false);
    }
  }, [courseId]);

  // ─── Fetch progress ─────────────────────────────────────────────────────
  const fetchProgress = useCallback(async () => {
    if (!courseId || !batchId) return;
    try {
      const res = await getCourseProgressApi(courseId, batchId);
      if (res?.status) {
        setCompletedLessons(new Set(res.data?.completed_lessons || []));
        setCompletedSublessons(new Set(res.data?.completed_sublessons || []));
        setCompletedMaterials(new Set(res.data?.completed_materials || []));
        setProgressPercent(res.data?.progress_percent || 0);
      }
    } catch {
      // silently fail
    }
  }, [courseId, batchId]);

  const fetchReviews = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await getCourseReviewApi({ courseId });
      if (res?.status && res?.data) {
        // Check if the current user has already submitted a review
        const userReviewed = res.data.some((review: any) => review.user_id === userId);
        setHasReviewed(userReviewed);
      }
    } catch {
      // silently fail
    }
  }, [courseId, userId]);

  useEffect(() => {
    fetchLessons();
    fetchProgress();
    fetchReviews();
  }, [fetchLessons, fetchProgress, fetchReviews]);

  // ─── Open lesson in same tab ─────────────────────────────────────────────
  const openLesson = useCallback(
    (lessonId: string, materialUrl?: string) => {
      const url = `/my-courses/course-details/lesson-view?courseId=${encodeURIComponent(
        courseId
      )}&batchId=${encodeURIComponent(batchId)}&lessonId=${encodeURIComponent(
        lessonId
      )}${materialUrl ? `&materialUrl=${encodeURIComponent(materialUrl)}` : ""}`;
      router.push(url);
    },
    [router, courseId, batchId]
  );

  // Auto-refresh progress whenever user returns/focuses back to this tab
  useEffect(() => {
    const handleFocus = () => {
      fetchProgress();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchProgress]);

  // ─── Review submit ───────────────────────────────────────────────────────
  const submitReview = async () => {
    if (!rating || !reviewText.trim()) return;
    setReviewLoading(true);
    try {
      await postApi("/review/v1/create/review_course", {
        course_id: courseId,
        rating,
        review: reviewText,
      });
      toast.success("Review submitted!");
      setHasReviewed(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
      setIsReviewModalVisible(false);
      setRating(0);
      setReviewText("");
    }
  };

  const displayOverview = overview || lessonOverview;

  return (
    <div className="w-full flex flex-col gap-[12px]">
      {/* Overview */}
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center justify-between w-full">
          <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Overview</h1>
          {!hasReviewed && (
            <CommonButton
              text="Write a Review"
              icon={<StarOutlined />}
              onClick={() => setIsReviewModalVisible(true)}
              className="!bg-secondary text-white w-[160px]"
            />
          )}
        </div>
        {displayOverview && (
          <div className="text-[16px] text-[#002333]">
            <QuillEditor readOnly value={displayOverview} />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {batchId && (
        <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#0E0E0E]">Course Progress</span>
            <span className="font-bold text-secondary text-lg">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#E7E7E7] rounded-full h-3">
            <div
              className="bg-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-[#7B7B7B]">
            {progressPercent >= 100
              ? "🎉 Course completed!"
              : "Lessons and assignments must all be completed to finish the course."}
          </p>
        </div>
      )}

      {/* Lessons Curriculum Grouped Week-Wise */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Curriculum & Weekly Lessons</h1>
            <p className="text-xs text-gray-500 mt-0.5">Structured weekly modules for guided learning</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"} Total
          </span>
        </div>

        {/* Week Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedWeekFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedWeekFilter === "all"
                ? "bg-secondary text-white shadow-xs"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Weeks ({totalWeeks} Weeks)
          </button>
          {Array.from({ length: totalWeeks }, (_, idx) => idx + 1).map((w) => {
            const weekLessons = (lessons || []).filter((l) => (l.week || 1) === w);
            const count = weekLessons.length;
            const completedCount = weekLessons.filter((l) => {
              const materials = l.studyMaterials ?? [];
              const sublessons = l.sublessons ?? [];
              if (materials.length === 0 && sublessons.length === 0) {
                return completedLessons.has(l.lesson_id);
              }
              const allMatDone = materials.every((m) => completedMaterials.has(m.file_url));
              const allSubDone = sublessons.every((sl) => {
                const slm = sl.studyMaterials ?? [];
                return slm.length === 0
                  ? completedSublessons.has(sl.sublesson_id)
                  : slm.every((m) => completedMaterials.has(m.file_url));
              });
              return allMatDone && allSubDone;
            }).length;

            return (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWeekFilter(w)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedWeekFilter === w
                    ? "bg-secondary text-white shadow-xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>Week {w}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedWeekFilter === w
                      ? "bg-white/25 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {completedCount}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {loadingLessons ? (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3"
              >
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
            No lessons available for this course yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(selectedWeekFilter === "all"
              ? Array.from({ length: totalWeeks }, (_, idx) => idx + 1)
              : [selectedWeekFilter]
            ).map((weekNum) => {
              const weekLessons = (lessons || []).filter(
                (l) => (l.week || 1) === weekNum
              );

              return (
                <div
                  key={weekNum}
                  className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-md bg-secondary/10 text-secondary font-bold text-xs tracking-wider uppercase">
                        Week {weekNum}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {weekLessons.length} {weekLessons.length === 1 ? "Lesson" : "Lessons"}
                      </span>
                    </div>
                  </div>

                  {weekLessons.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      No lessons scheduled for Week {weekNum}.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {weekLessons.map((lesson, index) => {
                        const checkIsLessonCompleted = (l: Lesson) => {
                          const materials = l.studyMaterials ?? [];
                          const sublessons = l.sublessons ?? [];
                          const hasMaterials = materials.length > 0;
                          const hasSublessons = sublessons.length > 0;

                          if (!hasMaterials && !hasSublessons) {
                            return completedLessons.has(l.lesson_id);
                          }

                          if (hasMaterials) {
                            const allMaterialsCompleted = materials.every((m) =>
                              completedMaterials.has(m.file_url)
                            );
                            if (!allMaterialsCompleted) return false;
                          }

                          if (hasSublessons) {
                            const allSubCompleted = sublessons.every((sl) => {
                              const slMaterials = sl.studyMaterials ?? [];
                              if (slMaterials.length === 0) {
                                return completedSublessons.has(sl.sublesson_id);
                              }
                              return slMaterials.every((m) =>
                                completedMaterials.has(m.file_url)
                              );
                            });
                            if (!allSubCompleted) return false;
                          }

                          return true;
                        };

                        const isLocked =
                          lesson.unlock_after_previous &&
                          index > 0 &&
                          !checkIsLessonCompleted(weekLessons[index - 1]);
                        const isLessonCompleted = checkIsLessonCompleted(lesson);
                        const collapseKey = `${weekNum}-${lesson.lesson_id || index}`;
                        const isActive = Array.isArray(activeKey)
                          ? activeKey.includes(collapseKey)
                          : activeKey === collapseKey;

                        return (
                          <div key={collapseKey} className="flex items-center gap-3">
                            <Collapse
                              accordion={false}
                              onChange={!isLocked ? (key) => setActiveKey(key) : undefined}
                              expandIconPosition="end"
                              prefixCls="custom-course-collapse"
                              activeKey={activeKey}
                              expandIcon={({ isActive: ia }) =>
                                !isLocked ? (
                                  <RightOutlined
                                    style={{
                                      color: ia ? "white" : "black",
                                      transform: ia ? "rotate(90deg)" : "rotate(0deg)",
                                      transition: "0.2s",
                                    }}
                                  />
                                ) : (
                                  <LockIcon />
                                )
                              }
                              className={`${
                                isActive ? "!bg-secondary w-full" : "!bg-[#FAFAFA] w-full"
                              } border border-gray-200/70 rounded-xl overflow-hidden`}
                              items={[
                                {
                                  key: collapseKey,
                                  label: (
                                    <div className="flex items-center gap-2 py-0.5">
                                      {isLessonCompleted && (
                                        <CheckCircleFilled className="text-emerald-500" />
                                      )}
                                      <p
                                        className={`text-[15px] font-[600] ${
                                          isActive && "text-white"
                                        }`}
                                      >
                                        {lesson.lesson_name}
                                      </p>
                                    </div>
                                  ),
                                  children: (
                                    <div className="flex flex-col gap-4 px-3 py-4 w-full bg-white rounded-lg">
                                      {lesson.lesson_description && (
                                        <div className="text-[#002333] text-[15px] leading-[150%]">
                                          <QuillEditor readOnly value={lesson.lesson_description} />
                                        </div>
                                      )}

                                      {/* Lesson file */}
                                      {lesson.studyMaterials && lesson.studyMaterials.length > 0 && (
                                        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Study Materials ({lesson.studyMaterials.length})
                                          </span>
                                          {lesson.studyMaterials.map((material, idx) => {
                                            const isMaterialCompleted = completedMaterials.has(
                                              material.file_url
                                            );
                                            return (
                                              <MaterialRow
                                                key={idx}
                                                name={material.file_name || lesson.lesson_name}
                                                fileType={material.file_type}
                                                durationSeconds={material.duration_seconds}
                                                isCompleted={isMaterialCompleted}
                                                onOpen={() =>
                                                  openLesson(
                                                    lesson.lesson_id,
                                                    material.file_url
                                                  )
                                                }
                                              />
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* Sub-lessons */}
                                      {lesson.sublessons && lesson.sublessons.length > 0 && (
                                        <div className="flex flex-col gap-3 border-t border-gray-100 pt-3">
                                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Sub-Topics ({lesson.sublessons.length})
                                          </span>
                                          {lesson.sublessons.map((sub) => {
                                            const isSubCompleted = completedSublessons.has(
                                              sub.sublesson_id
                                            );
                                            return (
                                              <div
                                                key={sub.sublesson_id}
                                                className="w-full bg-[#F9FAFB] rounded-xl p-3.5 flex flex-col gap-2 border border-gray-100"
                                              >
                                                <div className="flex items-center gap-2 font-bold text-[15px]">
                                                  {isSubCompleted && (
                                                    <CheckCircleFilled className="text-emerald-500" />
                                                  )}
                                                  {sub.sublesson_name}
                                                </div>
                                                {sub.sublesson_description && (
                                                  <div className="text-sm">
                                                    <QuillEditor
                                                      readOnly
                                                      value={sub.sublesson_description}
                                                    />
                                                  </div>
                                                )}
                                                {sub.studyMaterials &&
                                                  sub.studyMaterials.length > 0 && (
                                                    <div className="flex flex-col gap-2 mt-2">
                                                      {sub.studyMaterials.map((material, idx) => {
                                                        const isMaterialCompleted =
                                                          completedMaterials.has(material.file_url);
                                                        return (
                                                          <MaterialRow
                                                            key={idx}
                                                            name={
                                                              material.file_name || sub.sublesson_name
                                                            }
                                                            fileType={material.file_type}
                                                            durationSeconds={material.duration_seconds}
                                                            isCompleted={isMaterialCompleted}
                                                            onOpen={() =>
                                                              openLesson(
                                                                sub.sublesson_id,
                                                                material.file_url
                                                              )
                                                            }
                                                          />
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ),
                                },
                              ]}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>



      {/* Review Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <StarOutlined className="text-secondary text-xl" />
            <span className="font-bold text-xl text-[#0E0E0E]">Write a Review</span>
          </div>
        }
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
        destroyOnHidden
        className="rounded-2xl"
        closeIcon={<div className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">✕</div>}
      >
        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Overall Rating</label>
            <Rate 
              value={rating} 
              onChange={setRating} 
              className="text-3xl text-secondary" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Your Review</label>
            <Input.TextArea
              rows={5}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience and thoughts about this course..."
              className="rounded-xl border-gray-300 focus:border-secondary focus:ring-secondary/20 resize-none p-3"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <CommonButton
              key="cancel"
              text="Cancel"
              onClick={() => setIsReviewModalVisible(false)}
              className="!bg-white border border-gray-300 text-gray-700 hover:!bg-gray-50 !w-[120px]"
            />
            <CommonButton
              key="submit"
              text="Submit Review"
              loading={reviewLoading}
              onClick={submitReview}
              className="!bg-secondary text-white !w-[160px]"
              disable={rating === 0 || !reviewText.trim()}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Course;
