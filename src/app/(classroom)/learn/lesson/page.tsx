"use client";

import { LessonViewContent } from "@/modules/classroom/LessonPlayer";
import { Spin } from "antd";
import React, { Suspense } from "react";

export default function LearnLessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <Spin size="large" />
        </div>
      }
    >
      <LessonViewContent />
    </Suspense>
  );
}
