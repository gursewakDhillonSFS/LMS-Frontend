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
import { usePathname, useRouter } from "next/navigation";


interface EnrolledCourse {
  courseId: string;
  courseName: string;
  courseImage: string | null;
  batchId: string;
  batchName: string;
  categoryName: string;
  headTeacherName: string;
  headTeacherAvatar: string | null;
  courseProgress: string;
}

interface StudentDetails {
  name?: string;
  email?: string;
  phone?: string;
  joinedDate?: string;
  avatar?: string;
  careerObjective?: string;
  highestEducation?: string;
  enrolledCourses?: EnrolledCourse[];
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
      { label: "Phone", value: details?.phone || "N/A" },
    ],
    right: [
      { label: "Education", value: details?.highestEducation || "N/A" },
      { label: "Career Goal", value: details?.careerObjective || "N/A" },
      { label: "Join Date", value: details?.joinedDate || "N/A" },
    ],
  };

  const pathname = usePathname();
  const router = useRouter();

  const handleAssignmentRedirect = (assignmentId: string) => {
    router.push(`${pathname}/assignment-details?assignment_id=${assignmentId}`);
  };

  const handleQuizRedirect = (quizId: string) => {
    router.push(`${pathname}/quiz-details?quiz_id=${quizId}`);
  };

  const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const todaysAssignments = assignments.filter((a) => a.dueDate === todayStr);
  const todaysQuizzes = quizzes.filter((q) => q.dueDate === todayStr);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-stretch gap-4 w-full">
        <div className="bg-white w-[30%] min-h-[264px] py-6 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-2xs">
          {details?.avatar && details.avatar.startsWith("http") ? (
            <Image
              src={details.avatar}
              alt={details?.name || "Student"}
              width={160}
              height={160}
              className="rounded-full object-cover border-4 border-blue-50 shadow-md"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl font-bold border-4 border-blue-50 shadow-md">
              {(details?.name || "S").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="mt-3 text-sm font-bold text-slate-800">{details?.name || "Student"}</span>
          <span className="text-xs text-slate-400">{details?.email || ""}</span>
        </div>
        <div className="bg-white w-[70%] p-6 rounded-[12px] min-h-[264px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-semibold text-2xl text-gray-800">Personal Info</h1>
            <button className="cursor-pointer">
              <BadgeComponent status="Active" />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_1px_1fr] gap-8 items-start h-full pt-2">
            <div className="flex flex-col gap-5">
              {personalInfo.left.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="text-[#8A8A8A] min-w-[100px] font-medium">
                    {item.label}
                  </span>
                  <span className="font-semibold text-gray-800 break-all">: {item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-200 h-[120px] w-[1px]"></div>

            <div className="flex flex-col gap-5">
              {personalInfo.right.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="text-[#8A8A8A] min-w-[100px] font-medium">
                    {item.label}
                  </span>
                  <span className="font-semibold text-gray-800">: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="font-semibold text-xl text-gray-800">Enrolled Courses</h1>
        {(!details?.enrolledCourses || details.enrolledCourses.length === 0) ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500 border border-gray-100">
            Student is not enrolled in any courses
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {details.enrolledCourses.map((course, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {course.courseImage ? (
                      <img src={course.courseImage} alt={course.courseName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {course.courseName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1" title={course.courseName}>{course.courseName}</h3>
                    <p className="text-xs text-gray-500">{course.categoryName}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Batch:</span>
                    <span className="font-medium">{course.batchName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Teacher:</span>
                    <span className="font-medium flex items-center gap-2">
                      <UserAvatarDisplay user={{ name: course.headTeacherName, image: course.headTeacherAvatar }} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-500">Progress:</span>
                    <span className="font-semibold text-primary">{course.courseProgress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <h1 className="font-[600] text-[20px]">Today's Assignments</h1>
        <div className="flex flex-col gap-[12px]">
          {todaysAssignments.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
              No assignments due today
            </div>
          ) : (
            todaysAssignments.map((assignment: StudentAssignmentItem) => (
              <div
                key={assignment?.id}
                className="bg-white flex flex-col gap-3 rounded-xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex w-full gap-2">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-[#002333]">
                    <AssignmentIcon />
                  </div>
                  <div className="flex flex-col w-full gap-3">
                    <div className="flex flex-col w-full gap-1">
                      <div className="w-full flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-800">{assignment.title}</h3>
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
                              : () => handleAssignmentRedirect(assignment.id)
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
      
      <div className="flex flex-col gap-3 mt-4">
        <h1 className="font-[600] text-[20px]">Today's Quizzes</h1>
        <div className="flex flex-col gap-3">
          {todaysQuizzes.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
              No quizzes due today
            </div>
          ) : (
            todaysQuizzes.map((test: StudentQuizItem) => (
              <div
                key={test.id}
                className="bg-white flex gap-[10px] p-4 rounded-xl w-full border border-gray-100"
              >
                <div className="bg-secondary w-11 h-11 rounded-full flex items-center justify-center">
                  <QuizCardIcon />
                </div>
                <div className="flex-1 flex-col gap-[12px] w-full">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-[20px] leading-[120%] text-gray-800">
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
                  <div className="flex items-center justify-between w-full mt-2">
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
                          test.status === "Not Started" ? () => {} : () => handleQuizRedirect(test.id)
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
