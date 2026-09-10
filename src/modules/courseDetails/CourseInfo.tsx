"use client";

import AvtarInfo from "@/components/AvtarInfo";
import CommonButton from "@/components/CommonButton";
import CourseCard from "@/components/CourseCard";
import CourseBatchModal from "@/components/modal/CourseBatchModal";
import ReviewContainer from "@/components/ReviewContainer";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import { setSignin } from "@/redux/slices/AuthModalSlice";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import { RootState } from "@/redux/store";
import {
  addToFavorite,
  getCourseInfoApi,
  removeFromFavorite,
  getCoursePurchaseData,
} from "@/services/collections";
import { formatLabel, getImageUrl, isValidUrl } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { CheckIcon, StarIcon } from "@/utils/icons";
import { Card1, Fallback } from "@/utils/images";
import { courseData, CourseInfoDataProp } from "@/utils/interface";
import { HeartFilled } from "@ant-design/icons";
import { Carousel, Skeleton } from "antd";
import Image from "next/image";
import QuillEditor from "@/components/QuillEditor";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";

interface CourseInfoProp {
  isExplore?: boolean;
  handleCheckoutRedirect?: () => void;
}

const CourseInfo: React.FC<CourseInfoProp> = ({
  isExplore = false,
  handleCheckoutRedirect,
}) => {
  const cardRef = useRef<HTMLImageElement>(null);
  const [isMount, setIsMount] = useState(false);
  const [cardWidth, setcardWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isExpandedTeacher, setIsExpandedTeacher] = useState(false);
  const [coursesInfo, setCoursesInfo] = useState<CourseInfoDataProp>();
  const Subscribed = coursesInfo?.enrolled_status || false;
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedCourseData = useSelector(
    (state: RootState) => state?.courseData?.course
  );
  const courseRedirect = (value: courseData | undefined) => {
    router.push(`${RoutePaths?.Browse}/course-details`);
    dispatch(setCourseData(value));
  };
  const courseImageUrl = getImageUrl(selectedCourseData?.course_image_url);

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 4,
    initialSlide: 0,
    autoplay: true,
    draggable: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1230,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  const details = [
    {
      label: `${formatLabel(coursesInfo?.course_level)} Level`,
      description: "No prior experience required",
    },
    {
      label: `${formatLabel(coursesInfo?.course_duration) || "0 Year"}`,
      description: "Duration of the course",
    },
    {
      label: formatLabel(coursesInfo?.course_schedule),
      description: `Approx. 1 hour`,
    },
  ];

  const fetchCourseInfo = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedCourseData?.course_id) {
        const response = await getCourseInfoApi(selectedCourseData?.course_id);

        if (response) {
          setCoursesInfo(response?.data);
        }
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [selectedCourseData?.course_id]);

  const handleAddFavorite = async () => {
    if (selectedCourseData?.course_id) {
      const payload = {
        course_id: selectedCourseData?.course_id,
        favorite: true,
      };
      try {
        const res = await addToFavorite(payload);
        if (res.status) {
          toast.success(res.message);
          setCoursesInfo((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              favorite: true,
            };
          });
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleRemoveFavorite = async () => {
    if (selectedCourseData?.course_id) {
      const param = new URLSearchParams();
      param.append("course_id", selectedCourseData?.course_id);
      try {
        const res = await removeFromFavorite(param);
        if (res.status) {
          toast.success(res.message);
          setCoursesInfo((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              favorite: false,
            };
          });
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    setIsMount(true);
    fetchCourseInfo();
  }, [fetchCourseInfo, selectedCourseData]);

  useEffect(() => {
    if (cardRef.current && isMount) {
      setcardWidth(cardRef.current.offsetWidth);
    }
  }, [isMount]);

  const handleStartFree = async (batchId?: string) => {
    if (!isExplore) {
      dispatch(setSignin(true));
      return;
    }
    
    // If we have batches but haven't selected one yet
    if (!batchId && coursesInfo?.batch && coursesInfo.batch.length > 0) {
      setBatch(true);
      return;
    }

    try {
      const payload: any = { course_ids: [coursesInfo?.course_id] };
      if (batchId) {
        payload.batch_ids = [batchId];
      }
      const res: any = await getCoursePurchaseData(payload);
      if (res?.status) {
        toast.success(res?.message || "Successfully enrolled in the free course!");
        setBatch(false);
        router.push(RoutePaths.MyCourses);
      } else {
        toast.error(res?.message || "Enrollment failed.");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <CourseBatchModal
        open={batch}
        onClose={() => setBatch(false)}
        centered={true}
        batches={coursesInfo?.batch}
        onSubmit={(batchId) => {
          if (coursesInfo?.course_price === 0 || coursesInfo?.course_type === "Free") {
            handleStartFree(batchId);
          }
        }}
      />
      <div
        className={`relative ${
          isExplore
            ? "px-[20px] bg-transparent"
            : "px-[20px] xl:px-[120px] bg-[#F2F6FD]"
        }`}
      >
        <div
          className="flex items-start gap-[60px] pt-[30px] pb-[120px] px-[40px]"
          ref={cardRef}
        >
          {loading ? (
            <Skeleton.Image
              active
              className="!w-[291px] !h-[259px] lg:!w-[321px] lg:!h-[319px] xl:!w-[391px] xl:!h-[359px] rounded-md"
            />
          ) : (
            <Image
              src={
                isValidUrl(courseImageUrl) && !imgError
                  ? courseImageUrl
                  : Fallback
              }
              alt="Course Thumbnail"
              unoptimized
              width={391}
              height={359}
              onError={() => setImgError(true)}
              className="rounded-md object-cover !max-w-[291px] !h-[259px] lg:!max-w-[321px] lg:!max-h-[319px] xl:!min-w-[391px] xl:!min-h-[359px]"
            />
          )}

          <div className="my-auto flex gap-[12px] xl:gap-[32px] flex-col w-full max-w-[600px]">
            {isExplore && (
              <div className="flex items-center justify-end">
                <button
                  onClick={
                    coursesInfo?.favorite
                      ? handleRemoveFavorite
                      : handleAddFavorite
                  }
                  className={`flex gap-1 items-center ${
                    coursesInfo?.favorite ? "text-[#FB4A49]" : "text-gray-400"
                  }`}
                >
                  <HeartFilled />
                  {coursesInfo?.favorite ? "Saved" : "Save Course"}
                </button>
              </div>
            )}
            {loading ? (
              <Skeleton.Avatar active size="default" />
            ) : (
              <UserAvatarDisplay
                user={{
                  name: `by ${coursesInfo?.head_teacher_name}`,
                  image: Card1,
                }}
              />
            )}

            {loading ? (
              <div className="space-y-2">
                <Skeleton.Input active className="!w-full !h-[48px]" />
                <Skeleton paragraph={{ rows: 2 }} active />
              </div>
            ) : (
              <div className="flex flex-col gap-[6px]">
                <h1 className="text-[20px] lg:text-[24px] xl:text-[40px] font-[700] leading-[120%] text-[#0E0E0E]">
                  {coursesInfo?.course_name}
                </h1>
                <div className="text-[14px] xl:text-[16px] text-[#0E0E0E]">
                  <QuillEditor readOnly value={coursesInfo?.description || ''} />
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                <Skeleton.Button
                  active
                  className="!w-[124px] !h-[36px] lg:!w-[204px] lg:!h-[56px]"
                />
                <Skeleton.Input active className="!w-[70%]" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  {coursesInfo?.course_price === 0 || coursesInfo?.course_type === "Free" ? (
                    <CommonButton
                      text={Subscribed ? "Start Course" : "Start for Free"}
                      className="!w-[124px] !h-[36px] lg:!w-[204px] lg:!h-[56px]"
                      onClick={
                        Subscribed
                          ? () => router.push(RoutePaths.MyCourses)
                          : () => handleStartFree()
                      }
                    />
                  ) : (
                    <>
                      <CommonButton
                        text={
                          Subscribed
                            ? "Start Course"
                            : `Buy at $${coursesInfo?.course_price}`
                        }
                        className="!w-[124px] !h-[36px] lg:!w-[204px] lg:!h-[56px]"
                        onClick={
                          Subscribed
                            ? () => router.push(RoutePaths.MyCourses)
                            : () => {
                                if (isExplore) handleCheckoutRedirect?.();
                                else dispatch(setSignin(true));
                              }
                        }
                      />
                      {!Subscribed && (
                        <CommonButton
                          text={"Start 7-day Free Trial"}
                          onClick={() => router.push(RoutePaths?.Subscription)}
                          className="!bg-secondary !text-white !min-w-[124px] !h-[36px] lg:!w-[204px] lg:!h-[56px]"
                        />
                      )}
                    </>
                  )}
                </div>
                <span className="text-[16px] text-[#0E0E0E]">
                  <span className="font-[700]">
                    {coursesInfo?.enrolled_user_count}
                  </span>{" "}
                  already enrolled | Included with{" "}
                  <span className="text-secondary font-medium">
                    Learnings+ Pro
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center">
        {cardWidth > 0 && (
          <div
            style={{
              boxShadow: `
      11px 2px 25px 0px #4545451A,
      45px 8px 46px 0px #45454517,
      101px 18px 62px 0px #4545450D,
      180px 32px 73px 0px #45454503,
      281px 50px 80px 0px #45454500
    `,
              width: cardWidth,
            }}
            className={`absolute items-center ${
              isExplore ? "bg-navcolor" : "bg-white"
            } p-2 xl:p-4 rounded-[26px] xl:h-[142px] grid grid-cols-1 sm:grid-cols-4 text-center`}
          >
            {!loading ? (
              <div className="flex flex-col border-r-1 border-[#B9B9B9] h-[80px] xl:h-[100px] justify-center">
                <div
                  className={`${
                    isExplore ? "text-primary" : "text-secondary"
                  } text-lg font-bold flex items-center justify-center gap-[8px]`}
                >
                  <StarIcon
                    color={isExplore ? "var(--primary)" : "var(--secondary)"}
                  />
                  {coursesInfo?.average_rating?.toFixed(1)}
                </div>
                <div
                  className={`text-sm ${
                    isExplore ? "text-white" : "text-gray-500"
                  }`}
                >
                  ({coursesInfo?.review_count} reviews)
                </div>
              </div>
            ) : (
              <Skeleton paragraph={{ rows: 1 }} active />
            )}
            {details?.map((detail, idx) => {
              return !loading ? (
                <div
                  key={idx}
                  className={`flex flex-col h-[80px] xl:h-[100px] justify-center ${
                    idx < details?.length - 1
                      ? "border-r-1 border-[#B9B9B9]"
                      : ""
                  }`}
                >
                  <div
                    className={`font-semibold capitalize ${
                      isExplore ? "text-white" : "text-black"
                    }`}
                  >
                    {detail.label}
                  </div>

                  <div
                    className={`text-sm ${
                      isExplore ? "text-white" : "text-black"
                    }`}
                  >
                    {detail.description}
                  </div>
                </div>
              ) : (
                <Skeleton key={idx} paragraph={{ rows: 1 }} active />
              );
            })}
          </div>
        )}
      </div>
      <div
        className={`flex flex-col gap-[40px] ${
          isExplore ? "px-[60px]" : "px-[40px] xl:px-[180px]"
        } w-full py-[95px] `}
      >
        <div className="border-b-1 border-[#B9B9B9] flex flex-col gap-[24px] pb-[40px]">
          <h2 className="text-[24px] font-[700]">What you&apos;ll learn</h2>
          {!loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              {coursesInfo?.course_learning_points?.map((item, index) => (
                <div key={index} className="flex items-start gap-[6px]">
                  <CheckIcon />
                  <span className="text-[#5C5C5C] text-[16px] ">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <Skeleton active paragraph={{ rows: 3 }} />
          )}
        </div>

        <div className="border-b-1 border-[#B9B9B9] flex flex-col gap-[24px] pb-[40px]">
          <h2 className="text-[24px] font-[700]">About this class</h2>
          {!loading ? (
            <div className="flex flex-col gap-[16px]">
              <div className={`text-[#002333] text-[16px] overflow-hidden transition-all ${isExpanded ? '' : 'max-h-[100px]'}`}>
                <QuillEditor readOnly value={coursesInfo?.about_course || ''} />
              </div>
              {coursesInfo?.about_course &&
                coursesInfo?.about_course?.length > 200 && (
                  <button
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="!text-secondary text-start cursor-pointer font-[600] hover:underline"
                  >
                    {isExpanded ? "See Less" : "See More"}
                  </button>
                )}
            </div>
          ) : (
            <Skeleton active paragraph={{ rows: 3 }} />
          )}
        </div>

        <div className="border-b-1 border-[#B9B9B9] flex flex-col gap-[24px] pb-[40px]">
          <h2 className="text-[24px] font-[700]">Meet your teacher</h2>
          {!loading ? (
            <div className="flex flex-col gap-[16px]">
              <AvtarInfo
                // imageUrl="https://randomuser.me/api/portraits/men/32.jpg"
                name={coursesInfo?.course_instructor ?? ""}
                organization="Organization name"
              />
              <div className={`text-gray-700 mb-2 overflow-hidden transition-all ${isExpandedTeacher ? '' : 'max-h-[100px]'}`}>
                <QuillEditor readOnly value={coursesInfo?.meet_your_teacher || ''} />
              </div>
              {coursesInfo?.meet_your_teacher &&
                coursesInfo?.meet_your_teacher?.length > 200 && (
                  <button
                    onClick={() => setIsExpandedTeacher((prev) => !prev)}
                    className="!text-secondary text-start cursor-pointer font-[600] hover:underline"
                  >
                    {isExpandedTeacher ? "See Less" : "See More"}
                  </button>
                )}
            </div>
          ) : (
            <Skeleton active paragraph={{ rows: 3 }} />
          )}
        </div>

        <div className="border-b-1 border-[#B9B9B9] flex flex-col gap-[24px] pb-[40px]">
          <h2 className="text-[24px] font-[700]">Skills you&apos;ll gain</h2>
          <div className="flex flex-wrap gap-2">
            {!loading ? (
              coursesInfo?.skills_you_gain?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 border border-[#002333] text-[12px] text-[#002333] rounded-[6px]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <div className="flex flex-wrap gap-2">
                <Skeleton.Button active size="default" shape="default" />
                <Skeleton.Button active size="default" shape="default" />
                <Skeleton.Button active size="default" shape="default" />
              </div>
            )}
          </div>
        </div>

        <ReviewContainer />

        {!isExplore && (
          <div className="flex flex-col gap-[40px] justify-center items-center">
            <h1 className={`text-[48px] fjalla-one-regular `}>
              Other Related Course
            </h1>

            <div className="w-full">
              <Carousel prefixCls="custom-card-carousel" {...settings}>
                {coursesInfo?.related_courses?.map((course) => (
                  <div key={course?.course_id} className="pl-3">
                    <CourseCard
                      data={course}
                      bgColor="#ffffff"
                      instructorColor="#0E0E0E"
                      titleColor="#000"
                      footerColor="var(--secondary)"
                      onClick={courseRedirect}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseInfo;
