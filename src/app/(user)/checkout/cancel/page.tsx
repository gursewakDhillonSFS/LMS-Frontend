"use client";
import CommonButton from "@/components/CommonButton";
import { RoutePaths } from "@/utils/enums";
import { useRouter } from "next/navigation";
import React from "react";

export default function CheckoutCancelPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh] p-8">
      <h1 className="text-2xl font-bold">Checkout Cancelled</h1>
      <p className="text-slate-600">
        Your payment was cancelled. You can try again from your cart.
      </p>
      <CommonButton
        text="Back to Checkout"
        onClick={() => router.push(RoutePaths.Checkout)}
      />
    </div>
  );
}
