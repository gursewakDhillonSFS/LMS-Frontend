"use client";
import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import { RoutePaths } from "@/utils/enums";
import { Breadcrumb, Radio, Input, Alert, Spin } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuizDetailsApi, submitQuizApi } from "@/services/collections";
import CommonButton from "@/components/CommonButton";
import { toast } from "react-toastify";

const CourseQuizContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get("quizId");
  const courseId = searchParams.get("courseId");

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Use refs to access latest values in intervals
  const answersRef = useRef(answers);
  const essayAnswersRef = useRef(essayAnswers);
  const submittingRef = useRef(submitting);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    essayAnswersRef.current = essayAnswers;
  }, [essayAnswers]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  const handleSubmitQuiz = useCallback(async (autoSubmit = false) => {
    if (!quizId || !quiz || submittingRef.current) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: quiz.questions.map((q: any, idx: number) => ({
          questionIndex: idx,
          questionType: q.questionType,
          ...(q.questionType === "mcq"
            ? { selectedOption: answersRef.current[idx] || "" }
            : { submittedText: essayAnswersRef.current[idx] || "" }),
        })),
      };
      await submitQuizApi(quizId, payload);
      
      // Clear storage
      localStorage.removeItem(`quiz_${quizId}_endTime`);
      localStorage.removeItem(`quiz_${quizId}_answers`);
      localStorage.removeItem(`quiz_${quizId}_essayAnswers`);

      if (autoSubmit) {
        toast.info("Time is up! Your quiz was automatically submitted.");
      } else {
        toast.success("Quiz submitted successfully!");
      }

      if (courseId) {
        router.push(`${RoutePaths.MyCourses}/course-details?id=${courseId}&tab=quizzes`);
      } else {
        router.push(`${RoutePaths.MyCourses}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit quiz");
      setSubmitting(false);
    }
  }, [quizId, quiz, courseId, router]);

  const fetchQuizDetails = useCallback(async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      const res = await getQuizDetailsApi(quizId);
      if (res?.status && res?.data) {
        const fetchedQuiz = res.data;
        setQuiz(fetchedQuiz);

        // Restore saved answers
        const savedAnswers = localStorage.getItem(`quiz_${quizId}_answers`);
        const savedEssayAnswers = localStorage.getItem(`quiz_${quizId}_essayAnswers`);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
        if (savedEssayAnswers) setEssayAnswers(JSON.parse(savedEssayAnswers));

        // Initialize Timer
        if (fetchedQuiz.enableTimer && fetchedQuiz.timer) {
          const savedEndTime = localStorage.getItem(`quiz_${quizId}_endTime`);
          let endTime = 0;
          if (savedEndTime) {
            endTime = parseInt(savedEndTime, 10);
          } else {
            endTime = Date.now() + fetchedQuiz.timer * 60 * 1000;
            localStorage.setItem(`quiz_${quizId}_endTime`, endTime.toString());
          }
          
          const remaining = Math.floor((endTime - Date.now()) / 1000);
          if (remaining > 0) {
            setTimeLeft(remaining);
          } else {
            setTimeLeft(0);
            handleSubmitQuiz(true);
          }
        }
      } else {
        toast.error("Failed to load quiz details.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading quiz details.");
    } finally {
      setLoading(false);
    }
  }, [quizId, handleSubmitQuiz]);

  useEffect(() => {
    fetchQuizDetails();
  }, [fetchQuizDetails]);

  // Handle answers change and save to local storage
  const handleAnswerChange = (idx: number, val: string) => {
    setAnswers((prev) => {
      const updated = { ...prev, [idx]: val };
      if (quizId) localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleEssayChange = (idx: number, val: string) => {
    setEssayAnswers((prev) => {
      const updated = { ...prev, [idx]: val };
      if (quizId) localStorage.setItem(`quiz_${quizId}_essayAnswers`, JSON.stringify(updated));
      return updated;
    });
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev > 1) {
          return prev - 1;
        } else {
          clearInterval(timerInterval);
          handleSubmitQuiz(true);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft, handleSubmitQuiz]);

  const items = [
    {
      title: "My Courses",
      href: RoutePaths?.MyCourses,
    },
    {
      title: "Course Details",
      href: courseId ? `${RoutePaths?.MyCourses}/course-details?id=${courseId}` : `${RoutePaths?.MyCourses}`,
    },
    {
      title: quiz?.quizName || "Quiz Attempt",
    },
  ];

  if (loading) {
    return <div className="flex justify-center p-12"><Spin size="large" /></div>;
  }

  if (!quiz) {
    return <div className="p-8 text-center text-red-500">Quiz not found.</div>;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-primary">
          {quiz.quizName}
        </h1>
        {quiz.dueDate && (
          <p className="text-[16px] text-[#5EB85C] font-bold">
            Due on: {new Date(quiz.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-[20px] bg-white p-6 rounded-[12px] shadow-sm">
        {quiz.enableTimer && quiz.timer && timeLeft !== null && (
          <div className="sticky top-4 z-10">
            <Alert
              type={timeLeft < 60 ? "error" : "info"}
              message={
                <div className="flex justify-between items-center w-full font-bold">
                  <span>Timed Quiz</span>
                  <span className={timeLeft < 60 ? "text-red-600" : ""}>
                    Time Remaining: {formatTime(timeLeft)}
                  </span>
                </div>
              }
              showIcon
              className="shadow-sm"
            />
          </div>
        )}
        
        {quiz.questions?.map((q: any, idx: number) => (
          <div key={idx} className="flex flex-col gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-[#0E0E0E] text-[16px]">
                Q{idx + 1}. {q.question}
              </p>
              <span className="text-xs text-gray-500 bg-white border rounded-full px-2 py-1 shadow-sm shrink-0">
                {q.marks} marks
              </span>
            </div>
            {q.questionType === "mcq" ? (
              <Radio.Group
                value={answers[idx]}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                className="flex flex-col gap-3 mt-2"
              >
                {q.options.map((opt: string, oi: number) => (
                  <Radio key={oi} value={opt} className="text-[#002333] text-[15px] break-words whitespace-normal text-wrap">
                    {opt}
                  </Radio>
                ))}
              </Radio.Group>
            ) : (
              <div className="mt-2">
                <Input.TextArea
                  rows={4}
                  placeholder="Write your answer..."
                  value={essayAnswers[idx] || ""}
                  onChange={(e) => handleEssayChange(idx, e.target.value)}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end gap-3 mt-6 border-t pt-6">
          <CommonButton
            text="Cancel"
            onClick={() => {
              if (courseId) {
                router.push(`${RoutePaths.MyCourses}/course-details?id=${courseId}&tab=quizzes`);
              } else {
                router.push(`${RoutePaths.MyCourses}`);
              }
            }}
            className="bg-gray-200 text-gray-700 border-none w-[120px]"
          />
          <CommonButton
            text="Submit Quiz"
            loading={submitting}
            onClick={() => handleSubmitQuiz(false)}
            className="w-[180px] !bg-secondary text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default function CourseQuizAttempt() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Spin size="large" /></div>}>
      <CourseQuizContent />
    </Suspense>
  );
}
