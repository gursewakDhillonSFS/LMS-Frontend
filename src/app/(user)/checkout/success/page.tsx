"use client";
import CommonButton from "@/components/CommonButton";
import { confirmCheckoutSessionApi } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { toast } from "@/utils/toast";

function CheckoutSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState("Confirming payment...");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("Missing session. Redirecting...");
      setTimeout(() => router.push(RoutePaths.Dashboard), 1500);
      return;
    }
    (async () => {
      try {
        const res = await confirmCheckoutSessionApi(sessionId);
        if (res?.status) {
          setStatus("Payment confirmed. Enrollment complete!");
          toast.success("Enrollment successful");
        } else {
          setStatus("Payment received. Enrollment may take a moment.");
        }
      } catch {
        setStatus("Could not confirm yet. Check My Courses shortly.");
      }
    })();
  }, [params, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh] p-8">
      <h1 className="text-2xl font-bold">Checkout Success</h1>
      <p className="text-slate-600">{status}</p>
      <CommonButton
        text="Go to Dashboard"
        onClick={() => router.push(RoutePaths.Dashboard)}
      />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}
