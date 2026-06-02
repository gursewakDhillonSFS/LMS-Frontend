"use client";
import CommonButton from "@/components/CommonButton";
import TextFormatComponent from "@/components/TextFormatComponent";
import { TagColors } from "@/utils/constant";
import { RoutePaths } from "@/utils/enums";
import { CalendarIcon2, QuizCardIcon, QuizeStopWatch } from "@/utils/icons";
import { DatePicker } from "antd";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import QuillEditor from "@/components/QuillEditor";


interface StudentQuizItem {
  id: string;
  title: string;
  submittedOn?: string;
  tags?: string[];
  description?: string;
  score?: string;
  status?: string;
  dueDate?: string;
}

interface StudentQuizesProps {
  quizzes?: StudentQuizItem[];
}

const StudentQuizes: React.FC<StudentQuizesProps> = ({ quizzes = [] }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleRedirect = (quizId: string) => {
    router.push(`${pathname}/quiz-details?quiz_id=${quizId}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <DatePicker.RangePicker
          prefixCls="ant-rangepicker"
          allowClear={false}
          format={"YYYY-MM-DD"}
          prefix={<CalendarIcon2 color="var(--secondary)" />}
          suffixIcon={null}
        />
      </div>
      <div className="flex flex-col gap-3">
        {quizzes.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
            No quizzes assigned yet
          </div>
        ) : (
          quizzes.map((test: StudentQuizItem) => (
            <div
              key={test.id}
              className="bg-white flex gap-[10px] p-4 rounded-xl w-full"
            >
              <div className="bg-secondary w-11 h-11 rounded-full flex items-center justify-center">
                <QuizCardIcon />
              </div>
              <div className="flex-1 flex-col gap-[12px] w-full">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-[20px] leading-[120%]">
                    {test.title}
                  </h3>
                  {test?.submittedOn && (
                    <p className="text-sm font-medium leading-[150%] text-secondary">
                      Submitted on: {test?.submittedOn}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2 text-white">
                    {test.tags?.map((tag: string, index: number) => (
                      <div key={index}>
                        {tag === "Time Based" ? (
                          <span
                            className={`flex gap-1 text-xs px-2 py-1 rounded-full ${TagColors[tag] || "bg-primary"}`}
                          >
                            <QuizeStopWatch />
                            {tag}
                          </span>
                        ) : (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${TagColors[tag] || "bg-secondary"}`}
                          >
                            {tag}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  <QuillEditor readOnly value={test.description || ""} />
                </div>
                <div className="flex items-center justify-between w-full">
                  {test.score || test?.status === "Pending" ? (
                    <div className="text-sm mt-1 text-gray-700 flex gap-2 items-center justify-center">
                      <strong>Score:</strong>{" "}
                      <TextFormatComponent text={test?.score ?? test?.status} />
                    </div>
                  ) : (
                    <p className="text-sm font-[500] leading-[150%] text-[#2D2D2D]">
                      <span className="font-semibold">Due on:</span>{" "}
                      {test.dueDate}
                    </p>
                  )}
                  {test?.status !== "Not Started" && (
                    <CommonButton
                      text={
                        test.status === "Pending" ? "Check Quiz" : "View Quiz"
                      }
                      onClick={() => handleRedirect(test.id)}
                      className={`!h-8 !w-[10%]  ${
                        test.status === "Not Started" ? "flex-row-reverse" : ""
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentQuizes;
