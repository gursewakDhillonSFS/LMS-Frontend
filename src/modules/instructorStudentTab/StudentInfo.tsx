import BadgeComponent from "@/components/BadgeComponent";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import { Image } from "antd";
import React from "react";
import { Assignment } from "../userCourseTab/CourseAssignments";
import { AssignmentIcon, QuizCardIcon, QuizeStopWatch } from "@/utils/icons";
import CommonButton from "@/components/CommonButton";
import TextFormatComponent from "@/components/TextFormatComponent";
import { Quiz } from "@/utils/interface";
import { TagColors } from "@/utils/constant";


interface StudentDetails {
  name?: string;
  email?: string;
  courseName?: string;
  batchName?: string;
  courseProgress?: string;
  headTeacherName?: string;
  headTeacherAvatar?: string | null;
  joinedDate?: string;
  avatar?: string;
}

interface StudentAssignmentItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  submittedDate?: string;
  score?: string;
  dueDate?: string;
}

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

interface StudentInfoProps {
  details?: StudentDetails;
  assignments?: StudentAssignmentItem[];
  quizzes?: StudentQuizItem[];
}

const StudentInfo: React.FC<StudentInfoProps> = ({ details, assignments = [], quizzes = [] }) => {
  const personalInfo = {
    left: [
      { label: "Name", value: details?.name || "N/A" },
      { label: "Email", value: details?.email || "N/A", isLink: true },
      { label: "Course Name", value: details?.courseName || "N/A" },
      { label: "Batch Name", value: details?.batchName || "N/A" },
    ],
    right: [
      { label: "Course Progress", value: details?.courseProgress || "0%" },
      {
        label: "Teacher",
        value: details?.headTeacherName || "N/A",
        avatar: details?.headTeacherAvatar || null,
      },
      { label: "Join Date", value: details?.joinedDate || "N/A" },
    ],
  };

  const handleRedirect = () => {};

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 justify-between w-full">
        <div className="bg-white w-[30%] h-[264px] py-10 rounded-[12px] flex items-center justify-center">
          <Image
            src={details?.avatar || "https://randomuser.me/api/portraits/men/22.jpg"}
            alt="student"
            width={200}
            height={200}
            className="rounded-full object-cover"
          />
        </div>
        <div className="bg-white w-[70%] p-4 rounded-[12px] h-[264px]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-semibold text-2xl">Personal Info</h1>
            <button className="cursor-pointer">
              <BadgeComponent status="Active" />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_1px_1fr] gap-6 items-start min-h-[160px]">
            <div className="flex flex-col gap-4">
              {personalInfo.left.map((item) => (
                <div key={item.label} className="flex items-center gap-8">
                  <span className="text-[#8A8A8A] min-w-[120px]">
                    {item.label}
                  </span>
                  <span className="font-semibold">: {item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#E5E7EB] h-full w-[1px]"></div>

            <div className="flex flex-col gap-4">
              {personalInfo.right.map((item) => (
                <div key={item.label} className="flex items-center gap-8">
                  <span className="text-[#8A8A8A] min-w-[120px]">
                    {item.label}
                  </span>
                  <span className="flex items-center gap-2">
                    :{" "}
                    {item?.label === "Teacher" && item.value !== "N/A" ? (
                      <UserAvatarDisplay
                        user={{ name: item?.value, image: item?.avatar }}
                      />
                    ) : (
                      <span className={`font-semibold`}>{item.value}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-[600] text-[20px]">Recent Assignments</h1>
        <div className="flex flex-col gap-[12px]">
          {assignments.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
              No assignments assigned yet
            </div>
          ) : (
            assignments.slice(0, 3).map((assignment: StudentAssignmentItem) => (
              <div
                key={assignment?.id}
                className="bg-white flex flex-col gap-3 rounded-xl shadow-sm p-4"
              >
                <div className="flex w-full gap-2">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-[#002333]">
                    <AssignmentIcon />
                  </div>
                  <div className="flex flex-col w-full gap-3">
                    <div className="flex flex-col w-full gap-1">
                      <div className="w-full flex items-center justify-between">
                        <h3 className="font-bold text-lg">{assignment.title}</h3>
                        {assignment?.status === "Not Started" && (
                          <BadgeComponent
                            className="!mx-0"
                            status={assignment?.status}
                          />
                        )}
                      </div>
                      {assignment?.submittedDate && (
                        <p className="text-sm font-medium leading-[150%] text-secondary">
                          Submitted on: {assignment?.submittedDate}
                        </p>
                      )}
                      <p className="text-sm text-[#9A9A9A] leading-[120%]">
                        {assignment.description}
                      </p>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      {assignment.score || assignment?.status === "Pending" ? (
                        <div className="text-sm mt-1 text-gray-700 flex gap-2 items-center justify-center">
                          <strong>Score:</strong>{" "}
                          <TextFormatComponent
                            text={assignment?.score ?? assignment?.status}
                          />
                        </div>
                      ) : (
                        <p className="text-sm font-[500] leading-[150%] text-[#2D2D2D]">
                          <span className="font-semibold">Due on:</span>{" "}
                          {assignment.dueDate}
                        </p>
                      )}
                      {assignment?.status !== "Not Started" && (
                        <CommonButton
                          text={
                            assignment.status === "Pending" ? "Check" : "View"
                          }
                          onClick={
                            assignment.status === "Not Started"
                              ? () => {}
                              : handleRedirect
                          }
                          className={`!bg-secondary !h-8 !w-[10%] text-white ${
                            assignment.status === "Not Started"
                              ? "flex-row-reverse"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="font-[600] text-[20px]">Recent Quizzes</h1>
        <div className="flex flex-col gap-3">
          {quizzes.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
              No quizzes assigned yet
            </div>
          ) : (
            quizzes.slice(0, 3).map((test: StudentQuizItem) => (
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
                  <p className="text-sm text-gray-500 mt-2">{test.description}</p>
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
                        onClick={
                          test.status === "Not Started" ? () => {} : handleRedirect
                        }
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
    </div>
  );
};

export default StudentInfo;
