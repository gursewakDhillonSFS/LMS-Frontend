"use client";

import React from "react";
import CommonButton from "@/components/CommonButton";
import { RoutePaths } from "@/utils/enums";
import { useRouter } from "next/navigation";
import { CloseCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4 sm:p-8 bg-[#FAFBFD]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 sm:p-10 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-3xl">
          <CloseCircleOutlined />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Checkout Cancelled
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your payment session was cancelled. No charges were made to your account. You can return to the course and purchase whenever you are ready.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full pt-2">
          <CommonButton
            text="Explore Courses"
            onClick={() => router.push(RoutePaths.MyExplore)}
            className="!w-full !h-11 !rounded-xl !bg-[#4F46E5] hover:!bg-[#4338CA] !text-white !font-bold transition-all shadow-sm"
          />
          <CommonButton
            text="Return to Dashboard"
            onClick={() => router.push(RoutePaths.Dashboard)}
            className="!w-full !h-11 !rounded-xl border !border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50 !font-semibold transition-all"
          />
        </div>
      </div>
    </div>
  );
}
