import { AssignmentIcon, CalendarIcon2 } from "@/utils/icons";
import { DatePicker } from "antd";
import React from "react";
import { Assignment } from "../userCourseTab/CourseAssignments";
import BadgeComponent from "@/components/BadgeComponent";
import CommonButton from "@/components/CommonButton";
import TextFormatComponent from "@/components/TextFormatComponent";
import { usePathname, useRouter } from "next/navigation";
import { RoutePaths } from "@/utils/enums";
import QuillEditor from "@/components/QuillEditor";

interface StudentAssignmentItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  submittedDate?: string;
  score?: string;
  dueDate?: string;
}

interface StudentAssignmentProps {
  assignments?: StudentAssignmentItem[];
}

const StudentAssignment: React.FC<StudentAssignmentProps> = ({ assignments = [] }) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleRedirect = (assignmentId: string) => {
    router.push(`${pathname}/assignment-details?assignment_id=${assignmentId}`);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <DatePicker.RangePicker
          prefixCls="ant-rangepicker"
          allowClear={false}
          format={"YYYY-MM-DD"}
          prefix={<CalendarIcon2 color="var(--secondary)" />}
          suffixIcon={null}
        />
      </div>
      <div className="flex flex-col gap-[12px]">
        {assignments.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
            No assignments assigned yet
          </div>
        ) : (
          assignments.map((assignment: StudentAssignmentItem) => (
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
                    <div className="text-sm text-[#9A9A9A] leading-[120%]">
                      <QuillEditor readOnly value={assignment.description || ""} />
                    </div>
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
                        text={assignment.status === "Pending" ? "Check" : "View"}
                        onClick={() => handleRedirect(assignment.id)}
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
  );
};

export default StudentAssignment;
