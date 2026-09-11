"use client";

import React from "react";
import AssignmentsManagerView from "@/components/assignments/AssignmentsManagerView";
import { RoutePaths } from "@/utils/enums";

export default function InstructorAssignmentsPage() {
  return <AssignmentsManagerView basePath={RoutePaths.Assignments} />;
}

