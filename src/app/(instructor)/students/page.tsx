"use client";

import React from "react";
import StudentsManagerView from "@/components/students/StudentsManagerView";
import { RoutePaths } from "@/utils/enums";

const InstructorStudentsPage = () => {
  return (
    <StudentsManagerView
      detailsPathPrefix={RoutePaths.Students}
      roleName="Instructor"
    />
  );
};

export default InstructorStudentsPage;
