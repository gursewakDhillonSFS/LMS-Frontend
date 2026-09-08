"use client";
import CommonButton from "@/components/CommonButton";
import CommonInput from "@/components/CommonInput";
import OnboardingSubscription from "@/modules/onboard/OnboardingSubscription";
import { RootState } from "@/redux/store";
import { cartList, createCheckoutSessionApi } from "@/services/collections";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { Fallback } from "@/utils/images";
import { Batch, courseData } from "@/utils/interface";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

interface DataProp {
  course_items: courseData[];
  discount_total: number;
  grand_total: number;
  subtotal: number;
  tax_total: number;
}

const CheckOut = () => {
  const [referral, setReferral] = useState("");
  const [imgError, setImgError] = useState(false);
  const [teacherImgError, setTeacherImgError] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [data, setData] = useState<DataProp>();
  const [coursesData, setCoursesData] = useState<courseData[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<
    Record<string, string>
  >({});
  const selectedCourseData = useSelector(
    (state: RootState) => state.courseData.course
  );
  const router = useRouter();
  const charges = [
    { label: "Course Price", amount: coursesData?.[0]?.total },
    { label: "Tax", amount: data?.tax_total },
    { label: "Discount", amount: data?.discount_total },
    { label: "Total", amount: data?.grand_total },
  ];

  const courseImageUrl = getImageUrl(coursesData?.[0]?.course_url);
  const teacherImageUrl = getImageUrl(coursesData?.[0]?.instructor_image_url);

  const getCourseData = useCallback(async () => {
    try {
      const response = await cartList();
      if (response.status) {
        let items: courseData[] = response?.data?.course_items || [];
        if (selectedCourseData?.course_id) {
          items = items.filter(
            (item) => item.course_id === selectedCourseData.course_id
          );
        }
        setData(response.data);
        setCoursesData(items);
        const initial: Record<string, string> = {};
        items.forEach((item) => {
          if (item.batches && item.batches.length > 0) {
            initial[item.course_id] = item.batches[0]._id;
          }
        });
        setSelectedBatches(initial);
      }
    } catch (error) {
      console.log(error);
      toast.warning("Something went wrong");
    }
  }, [selectedCourseData?.course_id]);

  const handleCheckout = async () => {
    const courseId = coursesData?.[0]?.course_id;
    if (!courseId) {
      toast.warning("No course selected");
      return;
    }
    const batchId = selectedBatches[courseId];
    if (!batchId && coursesData?.[0]?.batches?.length) {
      toast.warning("Please select a batch");
      return;
    }
    setCourseLoading(true);
    try {
      const payload: {
        course_ids: string[];
        batch_ids?: string[];
      } = {
        course_ids: [courseId],
      };
      if (batchId) {
        payload.batch_ids = [batchId];
      }
      const response = await createCheckoutSessionApi(payload);
      if (response.status) {
        if (response.data?.enrolled) {
          toast.success(response.message || "Enrolled successfully");
          router.push(RoutePaths?.Dashboard);
        } else if (response.data?.url) {
          window.location.href = response.data.url;
        } else {
          toast.warning("Unable to start checkout");
          setCourseLoading(false);
        }
      } else {
        toast.warning(response.message);
        setCourseLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.warning("Something went wrong");
      setCourseLoading(false);
    }
  };

  useEffect(() => {
    getCourseData();
  }, [getCourseData]);

  return (
    <div className={`w-full flex gap-[16px] px-[40px]`}>
      <div className="w-2/3 flex flex-col gap-5">
        <div className="p-4 rounded-[15px] bg-white">
          <div className="flex gap-3">
            <div className="w-20 h-20 relative">
              <Image
                className="rounded-xl"
                src={
                  isValidUrl(courseImageUrl) && !imgError
                    ? courseImageUrl
                    : Fallback
                }
                alt="image"
                fill
                onError={() => setImgError(true)}
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center gap-2 w-full">
              <div>
                <div
                  className={`font-[700] text-[18px] leading-[150%] text-black`}
                >
                  {coursesData?.[0]?.course_name}
                </div>

                <div className="flex items-center gap-[4px]">
                  <div className="w-[24px] h-[24px] relative">
                    <Image
                      src={
                        isValidUrl(teacherImageUrl) && !teacherImgError
                          ? teacherImageUrl
                          : Fallback
                      }
                      alt={"avtar"}
                      unoptimized
                      fill
                      onError={() => setTeacherImgError(true)}
                      className="rounded-[12px]"
                    />
                  </div>
                  <p className="text-[12px] leading-[150%]">
                    by {coursesData?.[0]?.head_teacher}
                  </p>
                </div>
                {coursesData?.[0]?.batches &&
                  coursesData[0].batches.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold">
                        Batch:
                      </span>
                      <select
                        value={
                          selectedBatches[coursesData[0].course_id] || ""
                        }
                        onChange={(e) =>
                          setSelectedBatches((prev) => ({
                            ...prev,
                            [coursesData[0].course_id]: e.target.value,
                          }))
                        }
                        className="text-xs p-1 rounded-md border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none max-w-[180px]"
                      >
                        {coursesData[0].batches.map((b: Batch) => (
                          <option key={b._id} value={b._id}>
                            {b.batchName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
              </div>
              <div className="flex items-center justify-between w-full">
                <div className={`font-[700]`}>${coursesData?.[0]?.total}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center w-full">
          <div className="border-b-1 border-[#E0E0E0] w-[50%]"></div>
          <div className="w-[48px] text-center text-[14px] text-[500]">Or</div>
          <div className="border-b-1 border-[#E0E0E0] w-[50%]"></div>
        </div>

        <OnboardingSubscription isExplore={true} />
      </div>
      <div className="w-1/3 bg-white rounded-xl h-fit p-3 flex flex-col gap-3">
        <div className={`font-[700] text-[18px] leading-[120%] text-black`}>
          Order Summary
        </div>
        <CommonInput
          label="+ Add a referral code"
          value={referral}
          onChange={(e) => setReferral(e.target.value)}
        />
        <div className="bg-white flex flex-col gap-1">
          {charges.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between ${
                index === charges.length - 1
                  ? "text-secondary font-bold text-[18px]"
                  : ""
              }`}
            >
              <span>{item.label}</span>
              <span>{item.amount}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <CommonButton
            text={"Checkout Now"}
            onClick={handleCheckout}
            loading={courseLoading}
            className="!w-full "
          />
          <div className="text-center text-[#7B7B7B] plus-jakarta-sans">
            Secure payment processing
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
