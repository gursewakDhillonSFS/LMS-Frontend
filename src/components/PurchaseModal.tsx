"use client";

import React, { useState } from "react";
import { Modal, Select } from "antd";
import Image from "next/image";
import CommonButton from "./CommonButton";
import { getImageUrl, isValidUrl, formatDuration, formatLabel } from "@/utils/comman";
import { Fallback } from "@/utils/images";
import { purchaseCourseApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import {
  SafetyCertificateOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
  LockOutlined,
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
      startDate?: string;
      endDate?: string;
    }>;
  } | null;
  initialBatchId?: string;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  open,
  onClose,
  course,
  initialBatchId,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<string | undefined>(
    initialBatchId || (course?.batches && course.batches.length > 0 ? course.batches[0]._id : undefined)
  );
  const [loading, setLoading] = useState(false);

  if (!course) return null;

  const price = course.course_price || 0;
  const isFree = price === 0;
  const courseImage = getImageUrl(course.course_image_url);

  // Synchronize batch if initialBatchId changes
  React.useEffect(() => {
    if (initialBatchId) {
      setSelectedBatch(initialBatchId);
    } else if (course.batches && course.batches.length > 0) {
      setSelectedBatch(course.batches[0]._id);
    }
  }, [initialBatchId, course]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await purchaseCourseApi({
        course_id: course.course_id,
        batch_id: selectedBatch,
      });

      if (res?.status) {
        if (res.data?.free_enrolled) {
          toast.success(res.message || "Enrolled successfully!");
          onClose();
          window.location.reload();
          return;
        }

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
      toast.error(error?.response?.data?.message || "Error starting checkout session");
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
      <div className="flex flex-col gap-5 pt-2 pb-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#315CFF] bg-[#315CFF]/10 px-2.5 py-1 rounded-full">
              Direct Course Purchase
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
        <div className="flex gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-[100px] h-[72px] relative rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 border border-slate-200/60">
            <Image
              src={isValidUrl(courseImage) ? courseImage : Fallback}
              alt={course.course_name || "Course"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <h4 className="text-[15px] font-bold text-slate-900 truncate">
              {course.course_name}
            </h4>
            {course.head_teacher_name && (
              <p className="text-[12px] text-slate-600 mt-0.5 font-medium truncate">
                Instructor: {course.head_teacher_name}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-medium">
              {course.course_duration && (
                <span>⏱ {formatDuration(course.course_duration)}</span>
              )}
              {course.course_level && (
                <span>📊 {formatLabel(course.course_level)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Batch Selection (if batches exist) */}
        {course.batches && course.batches.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-slate-800">
              Select Batch
            </label>
            <Select
              className="w-full h-[42px]"
              value={selectedBatch}
              onChange={(value) => setSelectedBatch(value)}
              placeholder="Choose a batch"
              options={course.batches.map((b) => ({
                label: `${b.batchName}${b.startDate ? ` (Starts ${new Date(b.startDate).toLocaleDateString()})` : ""}`,
                value: b._id,
              }))}
            />
          </div>
        )}

        {/* Price Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600 font-medium">Course Price</span>
            <span className="font-bold text-slate-900">
              {isFree ? "Free" : `$${price.toFixed(2)} USD`}
            </span>
          </div>
          <div className="w-full h-[1px] bg-slate-200/80 my-0.5" />
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-slate-900">Total Due Today</span>
            <span className="text-[20px] font-extrabold text-[#315CFF]">
              {isFree ? "Free" : `$${price.toFixed(2)} USD`}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 text-right -mt-1 font-normal">
            * Tax included, if any
          </div>
        </div>

        {/* Guarantee & Confidence Badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70">
            <SafetyCertificateOutlined className="text-emerald-600 text-[16px] shrink-0" />
            <span className="font-medium leading-tight">2-Day 100% Money-Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/70">
            <ThunderboltFilled className="text-blue-600 text-[16px] shrink-0" />
            <span className="font-medium leading-tight">Instant Lifetime Access Included</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <CommonButton
            text="Cancel"
            onClick={onClose}
            disabled={loading}
            className="!w-1/3 !h-[44px] !bg-white border !border-slate-200 !text-slate-700 hover:!bg-slate-50 hover:!text-slate-900 font-medium rounded-xl"
          />
          <CommonButton
            text={
              loading
                ? "Connecting Stripe..."
                : isFree
                ? "Enroll for Free"
                : `Pay $${price.toFixed(2)} USD`
            }
            loading={loading}
            onClick={handleCheckout}
            className="!w-2/3 !h-[44px] !text-[15px] font-bold !bg-[#315CFF] hover:!bg-[#274BD1] !text-white shadow-sm rounded-xl"
          />
        </div>

        <p className="text-[11px] text-center text-slate-500 -mt-1 flex items-center justify-center gap-1">
          <LockOutlined />
          Encrypted 256-bit SSL connection powered by Stripe Checkout.
        </p>
      </div>
    </Modal>
  );
};

export default PurchaseModal;
