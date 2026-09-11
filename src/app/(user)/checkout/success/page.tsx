"use client";

import React, { Suspense, useEffect, useState } from "react";
import CommonButton from "@/components/CommonButton";
import { confirmCheckoutSessionApi } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/utils/toast";
import { CheckCircleFilled, BookOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from "@ant-design/icons";

function CheckoutSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setLoading(false);
      setTimeout(() => router.push(RoutePaths.Dashboard), 2000);
      return;
    }

    (async () => {
      try {
        const res = await confirmCheckoutSessionApi(sessionId);
        if (res?.status) {
          setConfirmed(true);
          setPurchaseData(res?.data);
          toast.success("Payment confirmed! Your enrollment is complete.");
        } else {
          setConfirmed(false);
          toast.info("Payment received. Access will be unlocked shortly.");
        }
      } catch (err) {
        console.error("Confirmation error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [params, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#EEF4FF]/50 via-white to-[#FAFBFD]">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 sm:p-10 flex flex-col items-center text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <h3 className="text-xl font-bold text-slate-800">Verifying Your Purchase...</h3>
            <p className="text-sm text-slate-500">Communicating with Stripe to confirm your payment.</p>
          </div>
        ) : confirmed ? (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-4xl shadow-inner animate-bounce-short">
              <CheckCircleFilled />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full self-center">
                Payment Successful
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                You're Enrolled!
              </h2>
              <p className="text-sm text-slate-600 max-w-sm">
                Thank you for your purchase. You have lifetime access to your new course and materials.
              </p>
            </div>

            {purchaseData?.course && (
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                  <BookOutlined />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {purchaseData.course.course_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {purchaseData.course.head_teacher_name ? `Instructor: ${purchaseData.course.head_teacher_name}` : "Ready to start"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
              <SafetyCertificateOutlined className="text-emerald-600 text-base" />
              <span>Full 2-day refund policy applies from date of purchase</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <CommonButton
                text="Start Learning"
                onClick={() => router.push(RoutePaths.MyCourses)}
                className="!w-full !h-12 !text-sm !font-bold !rounded-xl !bg-[#4F46E5] hover:!bg-[#4338CA] !text-white shadow-md transition-all flex items-center justify-center gap-2"
              />
              <CommonButton
                text="View Dashboard"
                onClick={() => router.push(RoutePaths.Dashboard)}
                className="!w-full !h-12 !text-sm !font-semibold !rounded-xl border !border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50 transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-3xl">
              <CheckCircleFilled />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Payment Processing</h3>
            <p className="text-sm text-slate-600">
              Your transaction has been submitted. Your course will show in your courses list in a few moments.
            </p>
            <CommonButton
              text="Go to My Courses"
              onClick={() => router.push(RoutePaths.MyCourses)}
              className="!w-full !h-11 !rounded-xl !bg-[#4F46E5] text-white font-semibold"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]" />
        </div>
      }
    >
      <CheckoutSuccessInner />
    </Suspense>
  );
}
