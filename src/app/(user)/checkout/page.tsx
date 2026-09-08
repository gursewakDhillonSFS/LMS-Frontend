"use client";
import CommonButton from "@/components/CommonButton";
import CommonInput from "@/components/CommonInput";
import OnboardingSubscription from "@/modules/onboard/OnboardingSubscription";
import { cartList, createCheckoutSessionApi, removeFromCart } from "@/services/collections";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { CartDeleteIcon } from "@/utils/icons";
import { Fallback } from "@/utils/images";
import { courseData, Batch } from "@/utils/interface";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadingOutlined } from "@ant-design/icons";
import NoDataFound from "@/components/NoDataFound";
import { useDispatch } from "react-redux";
import { setCartCount } from "@/redux/slices/CourseDataSlice";

interface DataProp {
  course_items: courseData[];
  discount_total: number;
  grand_total: number;
  subtotal: number;
  tax_total: number;
}

const CheckOut = () => {
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [data, setData] = useState<DataProp>();
  const [coursesData, setCoursesData] = useState<courseData[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<Record<string, string>>({});
  const router = useRouter();
  const dispatch = useDispatch();
  const charges = [
    { label: "Courses Price", amount: Number(data?.subtotal)?.toFixed(2) },
    { label: "Tax", amount: Number(data?.tax_total)?.toFixed(2) },
    { label: "Discount", amount: Number(data?.discount_total).toFixed(2) },
    { label: "Total", amount: Number(data?.grand_total).toFixed(2) },
  ];

  useEffect(() => {
    if (coursesData?.length > 0) {
      const initial: Record<string, string> = {};
      coursesData.forEach((item) => {
        if (item.batches && item.batches.length > 0) {
          initial[item.course_id] = item.batches[0]._id;
        }
      });
      setSelectedBatches((prev) => ({ ...initial, ...prev }));
    }
  }, [coursesData]);

  const handleBatchChange = (courseId: string, batchId: string) => {
    setSelectedBatches((prev) => ({
      ...prev,
      [courseId]: batchId,
    }));
  };

  const getCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cartList();
      if (response.status) {
        console.log(response);
        setData(response.data);
        setCoursesData(response?.data?.course_items);
      } else {
      }
    } catch (error) {
      console.log(error);
      toast.warning("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCheckout = async () => {
    setCourseLoading(true);

    const payload = {
      course_ids: coursesData?.map((item) => item?.course_id).filter(Boolean) as string[],
      batch_ids: coursesData?.map(
        (item) => selectedBatches[item?.course_id] || ""
      ),
    };
    try {
      const response = await createCheckoutSessionApi(payload);
      if (response.status) {
        if (response.data?.enrolled) {
          toast.success(response.message || "Enrolled successfully");
          dispatch(setCartCount(0));
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

  const handleRemoveFromCart = async (course_id: string) => {
    try {
      const res = await removeFromCart(course_id);
      if (res.status) {
        toast.success(res.message);
        setCoursesData((prev) =>
          prev.filter((item) => item.course_id !== course_id)
        );
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch(setCartCount(coursesData?.length));
  }, [coursesData]);

  useEffect(() => {
    getCourseData();
  }, [getCourseData]);
  return (
    <div className={`w-full flex gap-[16px] px-[120px]`}>
      <div className="w-full flex flex-col gap-5 ">
        <div className="overflow-auto flex flex-col gap-3 scrollbar-hide">
          {loading || coursesData?.length > 0 ? (
            loading ? (
              <div className="flex items-center justify-center gap-3 h-[30vh]">
                <LoadingOutlined className="spin" />
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-auto flex flex-col gap-3 scrollbar-hide">
                {coursesData?.map((item) => (
                  <div
                    key={item?.course_id}
                    className="p-4 rounded-[15px] bg-white"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20">
                        <Image
                          className="rounded-xl"
                          src={
                            isValidUrl(getImageUrl(item?.course_url))
                              ? getImageUrl(item?.course_url)
                              : Fallback
                          }
                          alt="image"
                          width={80}
                          height={80}
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-2 w-full">
                        <div>
                          <div className="font-[700] text-[18px] leading-[150%] text-black">
                            {item?.course_name}
                          </div>

                          <div className="flex items-center gap-[4px]">
                            <div className="w-[24px] h-[24px]">
                              <Image
                                src={
                                  isValidUrl(
                                    getImageUrl(item?.instructor_image_url)
                                  )
                                    ? getImageUrl(item?.instructor_image_url)
                                    : Fallback
                                }
                                alt={"avtar"}
                                unoptimized
                                width={24}
                                height={24}
                                className="rounded-[12px]"
                              />
                            </div>
                            <p className="text-[12px] leading-[150%]">
                              by {item?.head_teacher}
                            </p>
                          </div>
                          {item?.batches && item.batches.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-semibold">Batch:</span>
                              <select
                                value={selectedBatches[item.course_id] || ""}
                                onChange={(e) => handleBatchChange(item.course_id, e.target.value)}
                                className="text-xs p-1 rounded-md border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[180px]"
                              >
                                {item.batches.map((b: Batch) => (
                                  <option key={b._id} value={b._id}>
                                    {b.batchName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <div className={`font-[700]`}>${item?.total}</div>
                          <button
                            onClick={() =>
                              handleRemoveFromCart(item?.course_id)
                            }
                            className="cursor-pointer w-6 h-6 border border-[#FB4A49] rounded-md flex items-center justify-center"
                          >
                            <CartDeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <NoDataFound
              height={"100px"}
              text="Go to Explore"
              handleClick={() => router.push(RoutePaths?.MyExplore)}
            />
          )}
        </div>

        <div className="flex items-center w-full">
          <div className="border-b-1 border-[#E0E0E0] w-[50%]"></div>
          <div className="w-[48px] text-center text-[14px] text-[500]">Or</div>
          <div className="border-b-1 border-[#E0E0E0] w-[50%]"></div>
        </div>

        <OnboardingSubscription isExplore={true} />
      </div>
      {coursesData?.length > 0 && (
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
      )}
    </div>
  );
};

export default CheckOut;
