"use client";
import React from "react";
import CoursesManagerView from "@/components/courses/CoursesManagerView";
import { RoutePaths } from "@/utils/enums";

const CoursesPage: React.FC = () => {
  return (
    <CoursesManagerView
      rolePrefix=""
      createCoursePath={`${RoutePaths.Courses}/create-course`}
      detailsPath={`${RoutePaths.Courses}/course-details`}
    />
  );
};

export default CoursesPage;
