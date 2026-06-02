"use client";
import CommonButton from "@/components/CommonButton";
import CourseContentViewer from "@/components/CourseContentViewer";
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
import { Collapse, Input, Modal, Rate, Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { postApi } from "@/services/methods";

// ─── Type definitions ────────────────────────────────────────────────────────
interface Sublesson {
  sublesson_id: string;
  sublesson_name: string;
  sublesson_description?: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
}

interface Lesson {
  lesson_id: string;
  lesson_name: string;
  lesson_description?: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  unlock_after_previous?: boolean;
  sublessons: Sublesson[];
}

interface ViewerItem {
  id: string;
  name: string;
  file_url: string | null;
  file_type: string | null;
  isSublesson?: boolean;
  courseId: string;
  batchId: string;
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
  isCompleted,
  onOpen,
}: {
  name: string;
  fileType: string | null;
  isCompleted: boolean;
  onOpen: () => void;
}) => (
  <div className="flex items-center justify-between border-b border-[#C8C8C8] last:border-0 p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
    onClick={onOpen}
  >
    <div className="flex gap-3 items-center">
      <div className="bg-primary rounded-full h-11 w-11 flex items-center justify-center text-white font-bold flex-shrink-0">
        {fileType === "video" ? <VideoIcon /> : <FileIcon />}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[16px] font-[600] leading-[120%]">{name}</p>
        <p className="text-sm text-[#7B7B7B] flex gap-1 items-center">
          <ClockWheelIcon />
          {fileType === "video" ? "Video" : "PDF Document"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {isCompleted ? (
        <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
          <CheckCircleFilled /> Completed
        </span>
      ) : (
        <span className="text-xs text-[#7B7B7B] border border-[#D8D8D8] rounded-full px-3 py-1">
          Click to Open
        </span>
      )}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Course: React.FC<CourseProps> = ({ courseId, batchId, overview }) => {
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
  const [lessonOverview, setLessonOverview] = useState<string>("");
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [completedSublessons, setCompletedSublessons] = useState<Set<string>>(new Set());
  const [progressPercent, setProgressPercent] = useState(0);

  // Content viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItem, setViewerItem] = useState<ViewerItem | null>(null);

  // ─── Fetch lessons ──────────────────────────────────────────────────────
  const fetchLessons = useCallback(async () => {
    if (!courseId) return;
    setLoadingLessons(true);
    try {
      const res = await getLessonsWithSublessonsApi(courseId);
      if (res?.status) {
        setLessons(res.data?.lessons || []);
        setLessonOverview(res.data?.overview || "");
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

  // ─── Content viewer handlers ─────────────────────────────────────────────
  const openContent = useCallback(
    (item: ViewerItem) => {
      setViewerItem(item);
      setViewerOpen(true);
    },
    []
  );

  const handleCompleted = useCallback(
    (id: string, isSublesson: boolean) => {
      if (isSublesson) {
        setCompletedSublessons((prev) => new Set([...prev, id]));
      } else {
        setCompletedLessons((prev) => new Set([...prev, id]));
      }
      // Re-fetch progress to get updated %
      fetchProgress();
    },
    [fetchProgress]
  );

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

      {/* Lessons */}
      <div className="flex flex-col gap-[12px]">
        <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Lessons</h1>

        {loadingLessons ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-8 text-[#7B7B7B]">
            No lessons available yet.
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {lessons.map((lesson, index) => {
              const checkIsLessonCompleted = (l: Lesson) => {
                if (completedLessons.has(l.lesson_id)) return true;
                if (l.sublessons && l.sublessons.length > 0) {
                  return l.sublessons.every((sl) => completedSublessons.has(sl.sublesson_id));
                }
                return false;
              };

              const isLocked = lesson.unlock_after_previous && index > 0 && !checkIsLessonCompleted(lessons[index - 1]);
              const isLessonCompleted = checkIsLessonCompleted(lesson);
              const isActive = Array.isArray(activeKey)
                ? activeKey.includes(index.toString())
                : activeKey === index.toString();

              return (
                <div key={lesson.lesson_id} className="flex items-center gap-3">
                  <Collapse
                    accordion
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
                    className={`${isActive ? "!bg-secondary w-full" : "!bg-white w-full"}`}
                    items={[
                      {
                        key: index.toString(),
                        label: (
                          <div className="flex items-center gap-2">
                            {isLessonCompleted && (
                              <CheckCircleFilled className="text-green-400" />
                            )}
                            <p className={`text-[16px] font-[700] ${isActive && "text-white"}`}>
                              {lesson.lesson_name}
                            </p>
                          </div>
                        ),
                        children: (
                          <div className="flex flex-col gap-4 px-3 py-6 w-full">
                            {lesson.lesson_description && (
                              <div className="text-[#002333] text-[16px] leading-[150%]">
                                <QuillEditor readOnly value={lesson.lesson_description} />
                              </div>
                            )}

                            {/* Lesson file */}
                            {lesson.file_url && (
                              <div className="flex flex-col gap-3">
                                <MaterialRow
                                  name={lesson.file_name || lesson.lesson_name}
                                  fileType={lesson.file_type}
                                  isCompleted={isLessonCompleted}
                                  onOpen={() =>
                                    openContent({
                                      id: lesson.lesson_id,
                                      name: lesson.lesson_name,
                                      file_url: lesson.file_url,
                                      file_type: lesson.file_type,
                                      isSublesson: false,
                                      courseId,
                                      batchId,
                                    })
                                  }
                                />
                              </div>
                            )}

                            {/* Sub-lessons */}
                            {lesson.sublessons?.length > 0 && (
                              <div className="flex flex-col gap-4">
                                {lesson.sublessons.map((sub) => {
                                  const isSubCompleted = completedSublessons.has(
                                    sub.sublesson_id
                                  );
                                  return (
                                    <div
                                      key={sub.sublesson_id}
                                      className="w-full bg-[#F7F7F7] rounded-xl p-3 flex flex-col gap-2"
                                    >
                                      <div className="flex items-center gap-2 font-bold text-[18px]">
                                        {isSubCompleted && (
                                          <CheckCircleFilled className="text-green-500" />
                                        )}
                                        {sub.sublesson_name}
                                      </div>
                                      {sub.sublesson_description && (
                                        <div>
                                          <QuillEditor
                                            readOnly
                                            value={sub.sublesson_description}
                                          />
                                        </div>
                                      )}
                                      {sub.file_url && (
                                        <MaterialRow
                                          name={sub.file_name || sub.sublesson_name}
                                          fileType={sub.file_type}
                                          isCompleted={isSubCompleted}
                                          onOpen={() =>
                                            openContent({
                                              id: sub.sublesson_id,
                                              name: sub.sublesson_name,
                                              file_url: sub.file_url,
                                              file_type: sub.file_type,
                                              isSublesson: true,
                                              courseId,
                                              batchId,
                                            })
                                          }
                                        />
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

      {/* Content Viewer Modal */}
      <CourseContentViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        item={viewerItem}
        onCompleted={handleCompleted}
      />

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
