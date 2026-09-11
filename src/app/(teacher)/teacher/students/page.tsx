"use client";

import React from "react";
import StudentsManagerView from "@/components/students/StudentsManagerView";
import { RoutePaths } from "@/utils/enums";

const TeacherStudentsPage = () => {
  return (
    <StudentsManagerView
      detailsPathPrefix={RoutePaths.TeacherStudents}
      roleName="Teacher"
    />
  );
};

export default TeacherStudentsPage;
