"use client";

import React from "react";
import QuizzesManagerView from "@/components/quizzes/QuizzesManagerView";
import { RoutePaths } from "@/utils/enums";

export default function InstructorQuizzesPage() {
  return <QuizzesManagerView basePath={RoutePaths.Quizzes} />;
}

