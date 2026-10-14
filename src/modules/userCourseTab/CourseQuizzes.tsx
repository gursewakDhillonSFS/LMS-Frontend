"use client";
import CommonButton from "@/components/CommonButton";
import QuillEditor from "@/components/QuillEditor";
import { getQuizzesByBatchApi, submitQuizApi } from "@/services/collections";
import { TagColors } from "@/utils/constant";
import { QuizCardIcon, QuizeStopWatch } from "@/utils/icons";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import { AssignmentTab } from "@/utils/constant";
import { Alert, Modal, Radio, Skeleton, Input } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "@/utils/toast";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  questionType: "mcq" | "essay";
  question: string;
  marks: number;
  options: string[];
}

interface ApiQuiz {
  quiz_id: string;
  quizName: string;
  dueDate: string;
  quizType: string;
  overview: string;
  enableTimer: boolean;
  timer: string | null;
  questions: QuizQuestion[];
  studentSubmission: {
    status: string;
    score?: number;
    obtainedScore?: number;
    totalMarks: number;
    feedback?: string;
  } | null;
}

interface CourseQuizzesProps {
  courseId: string;
  batchId: string;
}

const CourseQuizzes: React.FC<CourseQuizzesProps> = ({
  courseId,
  batchId,
}) => {
  const [quizTab, setQuizTab] = useState("current");
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchQuizzes = useCallback(async () => {
    if (!batchId || !courseId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        batchId,
        courseId,
        tab: quizTab === "current" ? "ongoing" : "past",
      });
      const res = await getQuizzesByBatchApi(params);
      if (res?.status) {
        setQuizzes(res.data?.quizzes || []);
      }
    } catch {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }, [batchId, courseId, quizTab]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return (
    <div className="flex flex-col gap-6">
      <CustomTabSwitcher
        tabs={AssignmentTab}
        activeKey={quizTab}
        onChange={setQuizTab}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-3">
              <div className="flex gap-3 items-center">
                <Skeleton.Avatar active size={40} shape="circle" />
                <div className="flex-1">
                  <Skeleton.Input active size="small" style={{ width: "60%" }} />
                </div>
              </div>
              <Skeleton active paragraph={{ rows: 2 }} />
              <div className="flex justify-between pt-2">
                <Skeleton.Button active size="small" style={{ width: 80 }} />
                <Skeleton.Button active size="small" style={{ width: 100 }} />
              </div>
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8 text-[#7B7B7B]">
          No quizzes available for this course.
        </div>
      ) : (
        <div className="grid grid-cols-2 items-start gap-2">
      {quizzes.map((quiz) => {
        const isSubmitted = !!quiz.studentSubmission;
        const tags = [quiz.quizType, quiz.enableTimer ? "Time Based" : null].filter(
          Boolean
        ) as string[];

        return (
          <div
            key={quiz.quiz_id}
            className="bg-white flex gap-[10px] p-4 rounded-xl w-full shadow-sm"
          >
            <div className="bg-secondary w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0">
              <QuizCardIcon />
            </div>
            <div className="flex-1 flex flex-col gap-[12px] min-w-0">
              <div className="flex flex-col min-w-0 overflow-hidden">
                <h3 className="font-semibold text-[18px] leading-[120%] break-words whitespace-normal text-wrap max-w-full">
                  {quiz.quizName}
                </h3>
                {isSubmitted && (
                  <p className="text-sm font-medium leading-[150%] text-green-600">
                    ✓ Submitted
                  </p>
                )}
                <div className="flex gap-2 mt-2 text-white">
                  {tags.map((tag, index) => (
                    <div key={index}>
                      {tag === "Time Based" ? (
                        <span
                          className={`flex gap-1 text-xs px-2 py-1 rounded-full ${TagColors[tag] || "bg-gray-400"}`}
                        >
                          <QuizeStopWatch />
                          {tag}
                        </span>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${TagColors[tag] || "bg-gray-400"}`}
                        >
                          {tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {quiz.overview && (
                <div className="text-sm text-gray-500 line-clamp-2">
                  <QuillEditor readOnly value={quiz.overview} />
                </div>
              )}

              <div className="flex items-center justify-between w-full mt-1">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">Due: {quiz.dueDate}</p>
                  {isSubmitted && quiz.studentSubmission && (
                    <p className="text-sm font-semibold text-secondary">
                      Score: {quiz.studentSubmission.obtainedScore ?? quiz.studentSubmission.score ?? 0}/
                      {quiz.studentSubmission.totalMarks}
                    </p>
                  )}
                </div>
                <CommonButton
                  text={isSubmitted ? "Submitted" : "Start Quiz"}
                  onClick={() => {
                    if (!isSubmitted) {
                      router.push(`/learn/quiz?quizId=${quiz.quiz_id}&courseId=${courseId}${batchId ? `&batchId=${batchId}` : ""}`);
                    }
                  }}
                  icon={!isSubmitted ? <QuizeStopWatch /> : undefined}
                  className={`!w-[40%] !bg-secondary !text-white ${isSubmitted ? "opacity-70" : "flex-row-reverse"}`}
                  disable={isSubmitted}
                />
              </div>
            </div>
          </div>
        );
      })}
      </div>
      )}

    </div>
  );
};

export default CourseQuizzes;
