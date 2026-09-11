"use client";
import React from "react";
import CoursesManagerView from "@/components/courses/CoursesManagerView";
import { RoutePaths } from "@/utils/enums";

const TeacherCoursesPage: React.FC = () => {
  return (
    <CoursesManagerView
      rolePrefix="/teacher"
      createCoursePath={`${RoutePaths.TeacherCourses}/create-course`}
      detailsPath={`${RoutePaths.TeacherCourses}/course-details`}
    />
  );
};

export default TeacherCoursesPage;
