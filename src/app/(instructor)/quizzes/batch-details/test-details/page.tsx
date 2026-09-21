"use client";

import React, { Suspense } from "react";
import { Skeleton } from "antd";
import QuizDetailsView from "@/components/quiz/QuizDetailsView";

function QuizTestDetailsInner() {
  return (
    <QuizDetailsView
      role="instructor"
      baseQuizzesUrl="/quizzes"
    />
  );
}

export default function QuizTestDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 space-y-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      }
    >
      <QuizTestDetailsInner />
    </Suspense>
  );
}
