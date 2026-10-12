"use client";

import React, { useState, useEffect } from "react";
import { Modal, Select, Radio } from "antd";
import Image from "next/image";
import CommonButton from "./CommonButton";
import { getImageUrl, isValidUrl, formatDuration, formatLabel } from "@/utils/comman";
import { Fallback } from "@/utils/images";
import { purchaseCourseApi, getSavedPaymentMethodApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import {
  SafetyCertificateOutlined,
  ThunderboltFilled,
  LockOutlined,
  CreditCardOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  course: {
    course_id: string;
    course_name?: string;
    course_image_url?: string;
    head_teacher_name?: string;
    course_price?: number;
    course_duration?: string;
    course_level?: string;
    batches?: Array<{
      _id: string;
      batchName: string;
      teacher?: string | null;
    teacher_name?: string | null;
      startDate?: string;
      endDate?: string;
    }>;
    batch?: Array<{
      _id?: string;
      batchName: string;
      teacher?: string | null;
    teacher_name?: string | null;
      startDate?: string;
      endDate?: string;
    }>;
  } | null;
  initialBatchId?: string;
}

interface SavedMethodInfo {
  hasSavedMethod: boolean;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  paymentMethodId?: string;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  open,
  onClose,
  course,
  initialBatchId,
}) => {
  // Normalize batches from either course.batches or course.batch
  const rawBatches = (course?.batches && course.batches.length > 0
    ? course.batches
    : (course as any)?.batch && (course as any).batch.length > 0
    ? (course as any).batch
    : []) as Array<{
    _id: string;
    batchName: string;
    teacher?: string | null;
    teacher_name?: string | null;
    startDate?: string;
    endDate?: string;
  }>;

  const [selectedBatch, setSelectedBatch] = useState<string | undefined>(
    initialBatchId || (rawBatches.length === 1 ? rawBatches[0]._id : undefined)
  );
  const [loading, setLoading] = useState(false);
  const [savedMethod, setSavedMethod] = useState<SavedMethodInfo | null>(null);
  const [savedMethodLoading, setSavedMethodLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"saved" | "new">("saved");

  const price = course?.course_price || 0;
  const isFree = price === 0;
  const courseImage = getImageUrl(course?.course_image_url);

  // Synchronize batch when modal opens or initialBatchId/course changes
  useEffect(() => {
    if (!open) return;

    if (initialBatchId) {
      setSelectedBatch(initialBatchId);
    } else if (rawBatches.length === 1) {
      setSelectedBatch(rawBatches[0]._id);
    } else {
      setSelectedBatch(undefined);
    }
  }, [open, initialBatchId, course]);

  // Fetch saved payment method if user is logged in and course is paid
  useEffect(() => {
    if (!open || isFree) {
      setSavedMethod(null);
      return;
    }

    let isMounted = true;
    setSavedMethodLoading(true);

    getSavedPaymentMethodApi()
      .then((res) => {
        if (isMounted && res?.status && res?.data?.hasSavedMethod) {
          setSavedMethod(res.data);
          setPaymentOption("saved");
        } else if (isMounted) {
          setSavedMethod(null);
          setPaymentOption("new");
        }
      })
      .catch(() => {
        if (isMounted) {
          setSavedMethod(null);
          setPaymentOption("new");
        }
      })
      .finally(() => {
        if (isMounted) setSavedMethodLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, isFree]);

  if (!course) return null;

  const hasMultipleBatches = rawBatches.length > 1;
  const isBatchRequired = rawBatches.length > 0;
  const isBatchMissing = isBatchRequired && !selectedBatch;

  const handleCheckout = async () => {
    // Enforce batch selection
    if (isBatchMissing) {
      toast.error("Please select a batch to enroll in this course.");
      return;
    }

    try {
      setLoading(true);

      const useSavedCard =
        !isFree &&
        paymentOption === "saved" &&
        Boolean(savedMethod?.hasSavedMethod);

      const res = await purchaseCourseApi({
        course_id: course.course_id,
        batch_id: selectedBatch,
        use_saved_payment_method: useSavedCard,
        payment_method_id: useSavedCard ? savedMethod?.paymentMethodId : undefined,
      });

      if (res?.status) {
        // Direct enrollment success (Free course or 1-Click with saved card)
        if (res.data?.free_enrolled || res.data?.directSuccess || res.data?.enrolled) {
          toast.success(
            res.message ||
              (useSavedCard
                ? `Purchased successfully using card ending in ${savedMethod?.last4}!`
                : "Enrolled successfully!")
          );
          onClose();
          window.location.reload();
          return;
        }

        // Stripe Checkout redirect for new card or fallback
        const checkoutUrl = res.data?.session_url || res.data?.url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast.error("Checkout session URL was not returned. Please try again.");
        }
      } else {
        toast.error(res?.message || "Failed to initiate checkout");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error starting checkout session"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onClose}
      centered
      footer={null}
      width={520}
      closable={!loading}
      className="purchase-confirmation-modal"
    >
      <div className="flex flex-col gap-4 pt-2 pb-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#315CFF] bg-[#315CFF]/10 px-2.5 py-1 rounded-full">
              Course Enrollment
            </span>
            <h3 className="text-[20px] font-extrabold text-slate-900 mt-1.5 leading-tight tracking-tight">
              Confirm Your Purchase
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315CFF] flex items-center justify-center text-lg shrink-0">
            <LockOutlined />
          </div>
        </div>

        {/* Course Card Preview */}
        <div className="flex gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-[90px] h-[68px] relative rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 border border-slate-200/60">
            <Image
              src={isValidUrl(courseImage) ? courseImage : Fallback}
              alt={course.course_name || "Course"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <h4 className="text-[14px] font-bold text-slate-900 truncate">
              {course.course_name}
            </h4>
            {course.head_teacher_name && (
              <p className="text-[12px] text-slate-600 mt-0.5 font-medium truncate">
                Instructor: {course.head_teacher_name}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
              {course.course_duration && (
                <span>⏱ {formatDuration(course.course_duration)}</span>
              )}
              {course.course_level && (
                <span>📊 {formatLabel(course.course_level)}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── 1. Batch Selection Requirement ─────────────────────────────────── */}
        {hasMultipleBatches ? (
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
                <ExclamationCircleOutlined className="text-amber-600" />
                <span>Select Your Batch Cohort (Required)</span>
              </label>
              {selectedBatch && (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircleFilled className="text-emerald-600 text-xs" />
                  <span>Batch Selected</span>
                </span>
              )}
            </div>

            <Select
              className="w-full h-[40px]"
              value={selectedBatch}
              onChange={(value) => setSelectedBatch(value)}
              placeholder="-- Select which batch you want to join --"
              status={isBatchMissing ? "warning" : ""}
              options={rawBatches.map((b) => {
                const teacherName =
                  b.teacher_name ||
                  (b.teacher && !/^[a-f\d]{24}$/i.test(b.teacher) ? b.teacher : "");
                return {
                  label: `${b.batchName}${
                    b.startDate
                      ? ` (Starts ${new Date(b.startDate).toLocaleDateString()})`
                      : ""
                  }${teacherName ? ` • ${teacherName}` : ""}`,
                  value: b._id,
                };
              })}
            />

            <p className="text-[10px] text-slate-600 mt-0.5">
              You will be enrolled exclusively in this batch and added to its dedicated cohort chat.
            </p>
          </div>
        ) : rawBatches.length === 1 ? (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Assigned Cohort:</span>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {rawBatches[0].batchName || "Standard Batch"}
            </span>
          </div>
        ) : null}

        {/* ── 2. Payment Method Selector (Saved vs New) ──────────────────────── */}
        {!isFree && savedMethod?.hasSavedMethod && (
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCardOutlined className="text-[#315CFF]" />
                <span>Payment Method</span>
              </span>
              <span className="text-[10px] font-bold text-[#315CFF] uppercase tracking-wider bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                1-Click Checkout
              </span>
            </div>

            <Radio.Group
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value)}
              className="flex flex-col gap-2 w-full"
            >
              {/* Option A: Saved Card */}
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  paymentOption === "saved"
                    ? "bg-white border-[#315CFF] shadow-xs ring-1 ring-[#315CFF]/30"
                    : "bg-white/60 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio value="saved" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                      <span className="uppercase text-xs px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-bold">
                        {savedMethod.brand}
                      </span>
                      <span>•••• •••• •••• {savedMethod.last4}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Expires {savedMethod.expMonth}/{savedMethod.expYear} · Direct payment, no redirect
                    </span>
                  </div>
                </div>
                {paymentOption === "saved" && (
                  <CheckCircleFilled className="text-[#315CFF] text-base" />
                )}
              </label>

              {/* Option B: New Card via Stripe */}
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  paymentOption === "new"
                    ? "bg-white border-[#315CFF] shadow-xs ring-1 ring-[#315CFF]/30"
                    : "bg-white/60 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio value="new" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900">
                      Use a different payment method
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Enter new card details securely via Stripe Checkout
                    </span>
                  </div>
                </div>
              </label>
            </Radio.Group>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600 font-medium">Course Tuition</span>
            <span className="font-bold text-slate-900">
              {isFree ? "Free" : `$${price.toFixed(2)} USD`}
            </span>
          </div>
          <div className="w-full h-[1px] bg-slate-200/80 my-0.5" />
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-slate-900">Total Due Today</span>
            <span className="text-[19px] font-extrabold text-[#315CFF]">
              {isFree ? "Free" : `$${price.toFixed(2)} USD`}
            </span>
          </div>
        </div>

        {/* Guarantee & Confidence Badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70">
            <SafetyCertificateOutlined className="text-emerald-600 text-[15px] shrink-0" />
            <span className="font-medium leading-tight">2-Day 100% Refund Policy</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/70">
            <ThunderboltFilled className="text-blue-600 text-[15px] shrink-0" />
            <span className="font-medium leading-tight">Instant Lifetime Access</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <CommonButton
            text="Cancel"
            onClick={onClose}
            disabled={loading}
            className="!w-1/3 !h-[42px] !bg-white border !border-slate-200 !text-slate-700 hover:!bg-slate-50 hover:!text-slate-900 font-medium rounded-xl"
          />
          <CommonButton
            text={
              loading
                ? "Processing..."
                : isFree
                ? "Enroll for Free"
                : paymentOption === "saved" && savedMethod?.hasSavedMethod
                ? `Pay $${price.toFixed(2)} with Card (${savedMethod.last4})`
                : `Pay $${price.toFixed(2)} USD`
            }
            loading={loading}
            disabled={isBatchMissing}
            onClick={handleCheckout}
            className={`!w-2/3 !h-[42px] !text-[14px] font-bold shadow-sm rounded-xl ${
              isBatchMissing
                ? "!bg-slate-300 !text-slate-500 cursor-not-allowed"
                : "!bg-[#315CFF] hover:!bg-[#274BD1] !text-white cursor-pointer"
            }`}
          />
        </div>

        <p className="text-[10px] text-center text-slate-500 -mt-1 flex items-center justify-center gap-1">
          <LockOutlined />
          Encrypted 256-bit SSL connection powered by Stripe.
        </p>
      </div>
    </Modal>
  );
};

export default PurchaseModal;
