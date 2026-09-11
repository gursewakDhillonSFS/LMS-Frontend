"use client";

import React from "react";
import AssignmentsManagerView from "@/components/assignments/AssignmentsManagerView";
import { RoutePaths } from "@/utils/enums";

export default function TeacherAssignmentsPage() {
  return <AssignmentsManagerView basePath={RoutePaths.TeacherAssignments} />;
}

