"use client";
import CommonButton from "@/components/CommonButton";
import TextFormatComponent from "@/components/TextFormatComponent";
import { QuizCardIcon, QuizeStopWatch } from "@/utils/icons";
import React, { useState } from "react";
import QuizModal from "./modal/QuizModal";
import { useRouter } from "next/navigation";
import { RoutePaths } from "@/utils/enums";
import { TagColors } from "@/utils/constant";
import QuillEditor from "@/components/QuillEditor";

export const tests = [
  {
    id: 1,
    title: "Generative AI Feature Quizzes",
    tags: ["MCQ", "Time Based"],
    description:
      "Lorem ipsum dolor sit amet consectetur. Elementum consectetur facilisi",
    dueDate: "20 May, 2025",
    status: "start",
  },
  {
    id: 2,
    title: "Generative AI Feature Exam",
    tags: ["Essay", "Time Based"],
    description:
      "Lorem ipsum dolor sit amet consectetur. Elementum consectetur facilisi",
    dueDate: "20 May, 2025",
    status: "start",
  },
  {
    id: 3,
    title: "Generative AI Monthly Test",
    tags: ["Essay"],
    description:
      "Lorem ipsum dolor sit amet consectetur. Elementum consectetur facilisi",
    submittedDate: "20 May, 2024",
    score: "85/100",
    status: "view",
  },
  {
    id: 4,
    title: "Generative AI Monthly Test",
    tags: ["Essay"],
    description:
      "Lorem ipsum dolor sit amet consectetur. Elementum consectetur facilisi",
    submittedDate: "20 May, 2024",
    score: "85/100",
    status: "view",
  },
];

const CourseQuizzes = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 items-center gap-2">
      <QuizModal open={open} onClose={() => setOpen(false)} centered={true} />
      {tests?.map((test) => (
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
              {test.submittedDate && (
                <p className="text-sm font-medium leading-[150%] text-secondary">
                  Submitted on: {test.submittedDate}
                </p>
              )}
              <div className="flex gap-2 mt-2 text-white">
                {test.tags?.map((tag: string, index: number) => (
                  <div key={index}>
                    {tag === "Time Based" ? (
                      <span
                        className={`flex gap-1 text-xs px-2 py-1 rounded-full ${TagColors[tag]}`}
                      >
                        <QuizeStopWatch />
                        {tag}
                      </span>
                    ) : (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${TagColors[tag]}`}
                      >
                        {tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2 line-clamp-2">
              <QuillEditor readOnly value={test.description || ""} />
            </div>
            <div className="flex items-center justify-between w-full mt-2">
              {test.dueDate && (
                <p className="text-sm font-medium">Due on: {test.dueDate}</p>
              )}
              {test.score && (
                <div className="text-sm mt-1 text-gray-700 flex gap-2 items-center justify-center">
                  <strong>Score:</strong>{" "}
                  <TextFormatComponent number={test?.score} />
                </div>
              )}
              <CommonButton
                text={test.status === "start" ? "Start" : "View"}
                onClick={
                  test.status === "start"
                    ? () => setOpen(true)
                    : () =>
                        router.push(
                          `${RoutePaths?.MyCourses}/course-details/quiz-result`
                        )
                }
                icon={test.status === "start" && <QuizeStopWatch />}
                className={`!w-[30%] ${
                  test.status === "start" && "flex-row-reverse"
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseQuizzes;
