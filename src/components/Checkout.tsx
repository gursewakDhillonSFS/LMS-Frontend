"use client";

import React, { useState } from "react";
import CommonButton from "@/components/CommonButton";
import { RootState } from "@/redux/store";
import { purchaseCourseApi } from "@/services/collections";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { Fallback } from "@/utils/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "@/utils/toast";
import { Select } from "antd";
import {
  SafetyCertificateOutlined,
  ThunderboltFilled,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const CheckOut = () => {
  const [loading, setLoading] = useState(false);
  const selectedCourseData = useSelector(
    (state: RootState) => state.courseData.course
  );
  const router = useRouter();

  const [selectedBatch, setSelectedBatch] = useState<string | undefined>(
    selectedCourseData?.batches && selectedCourseData.batches.length > 0
      ? selectedCourseData.batches[0]._id
      : undefined
  );

  if (!selectedCourseData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center gap-4">
        <h3 className="text-xl font-bold text-slate-800">No Course Selected</h3>
        <p className="text-sm text-slate-500">
          Please select a course from the catalog to proceed with purchase.
        </p>
        <CommonButton
          text="Browse Courses"
          onClick={() => router.push(RoutePaths.MyExplore)}
          className="!h-11 !px-6 !rounded-xl !bg-[#4F46E5] text-white font-semibold"
        />
      </div>
    );
  }

  const coursePrice = selectedCourseData?.course_price ?? selectedCourseData?.base_price ?? 0;
  const isFree = coursePrice === 0;
  const courseImage = getImageUrl(
    selectedCourseData?.course_image_url || selectedCourseData?.course_url
  );

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await purchaseCourseApi({
        course_id: selectedCourseData.course_id,
        batch_id: selectedBatch,
      });

      if (res?.status) {
        if (res.data?.free_enrolled) {
          toast.success(res.message || "Enrolled successfully!");
          router.push(RoutePaths.MyCourses);
          return;
        }

        if (res.data?.session_url) {
          window.location.href = res.data.session_url;
        } else {
          toast.error("Checkout URL was not returned. Please try again.");
        }
      } else {
        toast.error(res?.message || "Failed to start checkout");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto py-6">
      {/* Left Column: Course Details & Batch */}
      <div className="flex-1 flex flex-col gap-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => router.back()}>
          <ArrowLeftOutlined />
          <span>Back</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Review Course Order
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="w-full sm:w-[140px] h-[90px] relative rounded-lg overflow-hidden bg-slate-200 shrink-0">
            <Image
              src={isValidUrl(courseImage) ? courseImage : Fallback}
              alt={selectedCourseData.course_name || "Course"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {selectedCourseData.course_name}
            </h3>
            {selectedCourseData.head_teacher_name && (
              <p className="text-xs text-slate-600 mt-1">
                Instructor: {selectedCourseData.head_teacher_name}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
              {selectedCourseData.course_duration && (
                <span>⏱ {selectedCourseData.course_duration}</span>
              )}
              {selectedCourseData.course_level && (
                <span className="capitalize">📊 {selectedCourseData.course_level}</span>
              )}
            </div>
          </div>
        </div>

        {/* Batch Selection */}
        {selectedCourseData.batches && selectedCourseData.batches.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-sm font-semibold text-slate-800">
              Select Batch
            </label>
            <Select
              className="w-full h-11"
              value={selectedBatch}
              onChange={(v) => setSelectedBatch(v)}
              options={selectedCourseData.batches.map((b) => ({
                label: `${b.batchName}${b.startDate ? ` (Starts ${new Date(b.startDate).toLocaleDateString()})` : ""}`,
                value: b._id,
              }))}
            />
          </div>
        )}

        {/* Confidence Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/60">
            <SafetyCertificateOutlined className="text-emerald-600 text-lg shrink-0" />
            <span>2-Day 100% Full Money-Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200/60">
            <ThunderboltFilled className="text-blue-600 text-lg shrink-0" />
            <span>Lifetime Access & Certificate</span>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full lg:w-[380px] flex flex-col gap-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs h-fit">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Order Summary
        </h3>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Course Price</span>
            <span className="font-semibold text-slate-900">
              {isFree ? "Free" : `$${coursePrice.toFixed(2)} USD`}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Platform Fee</span>
            <span className="text-emerald-600 font-medium">$0.00 (Included)</span>
          </div>
          <div className="w-full h-[1px] bg-slate-200 my-1" />
          <div className="flex items-center justify-between text-base font-bold text-slate-900">
            <span>Total Amount</span>
            <span className="text-xl text-[#4F46E5]">
              {isFree ? "Free" : `$${coursePrice.toFixed(2)} USD`}
            </span>
          </div>
        </div>

        <CommonButton
          text={
            loading
              ? "Connecting..."
              : isFree
              ? "Enroll for Free"
              : `Pay $${coursePrice.toFixed(2)} USD`
          }
          loading={loading}
          onClick={handleCheckout}
          className="!w-full !h-12 !text-sm !font-bold !rounded-xl !bg-[#4F46E5] hover:!bg-[#4338CA] !text-white shadow-md transition-all"
        />

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
          <LockOutlined />
          <span>Encrypted 256-bit SSL Stripe Checkout</span>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
