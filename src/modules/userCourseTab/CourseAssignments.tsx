"use client";
import BadgeComponent from "@/components/BadgeComponent";
import CommonButton from "@/components/CommonButton";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { AssignmentTab } from "@/utils/constant";
import { AssignmentTabEnum, RoutePaths } from "@/utils/enums";
import { AssignmentIcon, StopWatchIcon } from "@/utils/icons";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import QuillEditor from "@/components/QuillEditor";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  submittedDate?: string;
  score?: string;
}

export const assignments: Assignment[] = [
  {
    id: "1",
    title: "Physics Assignment",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur. Elementum consectetur facilisi et augue facilisi volutpat ",
    dueDate: "20 Dec, 2024",
    status: "Not Started",
    submittedDate: "20 Dec, 2024",
    score: "A+",
  },
  {
    id: "2",
    title: "Chemistry Worksheet",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur. ",
    dueDate: "18 Dec, 2024",
    status: "Completed",
    submittedDate: "18 Dec, 2024",
    score: "B+",
  },
  {
    id: "3",
    title: "Maths Problem Set",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur. Elementum consectetur facilisi et augue facilisi volutpat ",
    dueDate: "15 Dec, 2024",
    status: "Completed",
    submittedDate: "15 Dec, 2024",
    score: "A",
  },
  {
    id: "4",
    title: "Biology Lab Report",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur",
    dueDate: "21 Dec, 2024",
    status: "On Going",
    submittedDate: "15 Dec, 2024",
    score: "A",
  },
  {
    id: "5",
    title: "History Essay",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur. Elementum consectetur facilisi et augue facilisi volutpat ",
    dueDate: "22 Dec, 2024",
    status: "Completed",
    submittedDate: "15 Dec, 2024",
    score: "A",
  },
];

const CourseAssignments = () => {
  const [assignmentTab, setAssignmentTab] = useState("current");
  const router = useRouter();

  const handleRedirect = () => {
    router.push(`${RoutePaths?.MyCourses}/course-details/assignment-details`);
  };
  return (
    <div className="flex flex-col gap-[20px]">
      <CustomTabSwitcher
        activeKey={assignmentTab}
        onChange={setAssignmentTab}
        tabs={AssignmentTab}
        className="rounded-[6px] px-1 pt-2 !shadow-sm"
      />

      {assignmentTab === AssignmentTabEnum?.Current && (
        <div className="flex flex-col gap-[12px]">
          {assignments?.map((assignment) => (
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
                      <BadgeComponent status={assignment?.status} />
                    </div>
                    <div className="text-sm text-[#9A9A9A] line-clamp-2 leading-[120%]">
                      <QuillEditor readOnly value={assignment.description || ""} />
                    </div>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <p className="text-sm font-[500] leading-[150%] text-[#2D2D2D]">
                      <span className="font-semibold">Due on:</span>{" "}
                      {assignment.dueDate}
                    </p>
                    <CommonButton
                      text={
                        assignment.status === "Not Started"
                          ? "Start Assignment"
                          : "View Assignment"
                      }
                      icon={
                        assignment?.status === "Not Started" ? (
                          <StopWatchIcon />
                        ) : undefined
                      }
                      onClick={
                        assignment.status === "Not Started"
                          ? () => {}
                          : handleRedirect
                      }
                      className={`!bg-secondary text-white ${
                        assignment.status === "Not Started"
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {assignmentTab === AssignmentTabEnum?.Past && (
        <div className="flex flex-col gap-[12px]">
          {assignments?.map((assignment) => (
            <div
              key={assignment?.id}
              className="bg-white flex flex-col gap-3 rounded-xl shadow-sm p-4"
            >
              <div className="flex w-full gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-[#002333]">
                  <AssignmentIcon />
                </div>
                <div className="flex flex-col items-center w-full gap-2">
                  <div className="flex flex-col w-full gap-1">
                    <div className="w-full flex flex-col">
                      <h3 className="font-bold text-lg">{assignment.title}</h3>
                      <p className="text-sm font-[600] text-secondary">
                        Submitted by : {assignment?.submittedDate}
                      </p>
                    </div>
                    <div className="text-sm text-[#9A9A9A] line-clamp-2 leading-[120%]">
                      <QuillEditor readOnly value={assignment.description || ""} />
                    </div>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <div className="text-sm font-[500] leading-[150%] text-[#2D2D2D] items-center flex gap-1">
                      <span className="font-semibold">Score:</span>{" "}
                      <TextFormatComponent text={assignment?.score} />
                    </div>
                    <CommonButton
                      text={"view"}
                      onClick={handleRedirect}
                      className={`!bg-secondary text-white !w-[150px]`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseAssignments;
