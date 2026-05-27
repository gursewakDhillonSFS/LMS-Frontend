"use client";
import CommonButton from "@/components/CommonButton";
import QuillEditor from "@/components/QuillEditor";
import { getQuizzesByBatchApi, submitQuizApi } from "@/services/collections";
import { TagColors } from "@/utils/constant";
import { QuizCardIcon, QuizeStopWatch } from "@/utils/icons";
import { Alert, Modal, Radio, Spin, Input } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  timer?: number;
  questions: QuizQuestion[];
  totalMarks: number;
  studentSubmission: {
    status: string;
    obtainedScore: number;
    totalMarks: number;
  } | null;
}

interface CourseQuizzesProps {
  courseId: string;
  batchId: string;
}

const CourseQuizzes: React.FC<CourseQuizzesProps> = ({ courseId, batchId }) => {
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState(false);

  // Attempt modal
  const [attemptOpen, setAttemptOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<ApiQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    if (!batchId || !courseId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ batchId, courseId });
      const res = await getQuizzesByBatchApi(params);
      if (res?.status) {
        setQuizzes(res.data?.quizzes || []);
      }
    } catch {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }, [batchId, courseId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const openAttempt = (quiz: ApiQuiz) => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setEssayAnswers({});
    setAttemptOpen(true);
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: selectedQuiz.questions.map((q, idx) => ({
          questionIndex: idx,
          questionType: q.questionType,
          ...(q.questionType === "mcq"
            ? { selectedOption: answers[idx] || "" }
            : { submittedText: essayAnswers[idx] || "" }),
        })),
      };
      await submitQuizApi(selectedQuiz.quiz_id, payload);
      toast.success("Quiz submitted successfully!");
      setAttemptOpen(false);
      fetchQuizzes();
    } catch {
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8 text-[#7B7B7B]">
        No quizzes available for this course.
      </div>
    );
  }

  return (
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
            <div className="flex-1 flex flex-col gap-[12px] w-full">
              <div className="flex flex-col">
                <h3 className="font-semibold text-[18px] leading-[120%]">
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
                      Score: {quiz.studentSubmission.obtainedScore}/
                      {quiz.studentSubmission.totalMarks}
                    </p>
                  )}
                </div>
                <CommonButton
                  text={isSubmitted ? "Submitted" : "Start Quiz"}
                  onClick={() => {
                    if (!isSubmitted) openAttempt(quiz);
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

      {/* Quiz Attempt Modal */}
      <Modal
        open={attemptOpen}
        onCancel={() => setAttemptOpen(false)}
        title={selectedQuiz?.quizName || "Quiz"}
        width={720}
        footer={[
          <CommonButton
            key="cancel"
            text="Cancel"
            onClick={() => setAttemptOpen(false)}
            className="border mr-2"
          />,
          <CommonButton
            key="submit"
            text="Submit Quiz"
            loading={submitting}
            onClick={handleSubmitQuiz}
            className="!bg-secondary text-white"
          />,
        ]}
      >
        {selectedQuiz && (
          <div className="flex flex-col gap-6 py-4 max-h-[65vh] overflow-y-auto">
            {selectedQuiz.enableTimer && selectedQuiz.timer && (
              <Alert
                type="info"
                message={`Timed Quiz: ${selectedQuiz.timer} minutes`}
                showIcon
              />
            )}
            {selectedQuiz.questions.map((q, idx) => (
              <div key={idx} className="flex flex-col gap-3 bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-[#0E0E0E]">
                    Q{idx + 1}. {q.question}
                  </p>
                  <span className="text-xs text-gray-400 bg-white border rounded-full px-2 py-0.5">
                    {q.marks} marks
                  </span>
                </div>
                {q.questionType === "mcq" ? (
                  <Radio.Group
                    value={answers[idx]}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                    }
                    className="flex flex-col gap-2"
                  >
                    {q.options.map((opt, oi) => (
                      <Radio key={oi} value={opt} className="text-[#002333]">
                        {opt}
                      </Radio>
                    ))}
                  </Radio.Group>
                ) : (
                  <Input.TextArea
                    rows={3}
                    placeholder="Write your answer..."
                    value={essayAnswers[idx] || ""}
                    onChange={(e) =>
                      setEssayAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseQuizzes;
