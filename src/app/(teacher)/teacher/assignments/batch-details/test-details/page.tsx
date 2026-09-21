"use client";

import React, { Suspense } from "react";
import { Skeleton } from "antd";
import AssignmentDetailsView from "@/components/assignment/AssignmentDetailsView";

function TestDetailsInner() {
  return (
    <AssignmentDetailsView
      role="teacher"
      baseAssignmentsUrl="/teacher/assignments"
    />
  );
}

export default function TestDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 space-y-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      }
    >
      <TestDetailsInner />
    </Suspense>
  );
}
