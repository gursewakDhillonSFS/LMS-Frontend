"use client";

import { Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";

const RedirectToClassroom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    router.replace(`/learn/lesson?${next.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
};

export default function LessonViewRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <RedirectToClassroom />
    </Suspense>
  );
}
