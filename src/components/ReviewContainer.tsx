"use client";
import { RootState } from "@/redux/store";
import { getCourseReviewApi } from "@/services/collections";
import {
  formatLargeNumber,
  getRandomBgColor,
  getRatingDistribution,
  isValidUrl,
} from "@/utils/comman";
import { SelectIcon } from "@/utils/icons";
import { CourseReviewsResponse, StarCount } from "@/utils/interface";
import { Rate, Select, Skeleton } from "antd";
import Avatar from "antd/es/avatar/Avatar";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ReviewContainer = () => {
  const selectedCourseData = useSelector(
    (state: RootState) => state?.courseData?.course
  );
  const [loading, setLoading] = useState(false);
  const [courseReview, setCourseReview] = useState<CourseReviewsResponse>();
  const [ratingDistribution, setRatingDistribution] = useState<StarCount[]>();
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchCourseReview = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedCourseData?.course_id) {
        const payload = {
          courseId: selectedCourseData.course_id, 
        };
        const response = await getCourseReviewApi(payload);
        if (response) {
          setCourseReview(response);
          setRatingDistribution(getRatingDistribution(response?.data));
        }
      }
    } catch (err) {
      console.log(err || "Failed to fetch course reviews");
    } finally {
      setLoading(false);
    }
  }, [selectedCourseData]);
  useEffect(() => {
    fetchCourseReview();
  }, [fetchCourseReview]);
  return (
    <Skeleton loading={loading} paragraph={{ rows: 8 }}>
      <div className="flex flex-col xl:gap-[24px] gap-[10px] ">
        <h2 className="text-[24px] font-[700]">Learner reviews</h2>
        <div className=" rounded-[20px] flex flex-row lg:gap-[30px] gap-[10px] justify-between space-x-[30px]">
          <div className="flex w-1/3 gap-[32px] flex-col">
            <div className="flex  justify-between items-center">
              <div>
                <Rate
                  allowHalf
                  disabled
                  value={courseReview?.average_rating}
                  className="!text-secondary"
                  prefixCls="custom-rating-star"
                />
                <div>{`${courseReview?.average_rating?.toFixed(
                  1
                )} out of 5 (${formatLargeNumber(
                  courseReview?.review_count ?? 0
                )} reviews)`}</div>
              </div>
            </div>

            <div className="flex flex-col md:gap-[24px] gap-[12px]">
              {ratingDistribution?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-[28px] justify-between items-center text-[14px]"
                >
                  <div>{item.rating}</div>
                  <div className="bg-[#E3E3E3] rounded-[12px] h-[10px] flex-1 relative">
                    <div
                      className="bg-secondary h-[10px] rounded-[12px]"
                      style={{ width: `${item.count}%` }}
                    ></div>
                  </div>
                  <div>{item.count}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border !m-0 border-[#0E0E0E] opacity-[20%]"></div>

          <div className="flex flex-col md:gap-[16px] gap-[10px] !m-0 w-2/3 ">
            <div className="flex justify-between items-center ga">
              <div className="text-4 text-[#4C4C4C]">
                Showing 4 of{" "}
                {formatLargeNumber(courseReview?.review_count ?? 0)}
              </div>
              <div className="w-fit ">
                <Select
                  defaultValue={["All Stars"]}
                  style={{ flex: 1 }}
                  className="h-[40px]"
                  prefixCls="antSubFilter"
                  suffixIcon={<SelectIcon />}
                  options={[
                    { value: "All Stars", label: "All Stars" },
                    { value: "1 Star", label: "1 Star" },
                    { value: "2 Star", label: "2 Star" },
                    { value: "3 Star", label: "3 Star" },
                    { value: "4 Star", label: "4 Star" },
                    { value: "5 Star", label: "5 Star" },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-[16px]">
              {(isExpanded
                ? courseReview?.data
                : courseReview?.data?.slice(0, 4)
              )?.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:gap-[24px] gap-[12px] p-[16px] rounded-[12px] border border-[#B9B9B9]"
                >
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-center gap-2">
                      {isValidUrl(item?.user_name ?? "") ? (
                        <Avatar size={40} src={item.user_name} />
                      ) : (
                        <Avatar
                          size={40}
                          style={{
                            backgroundColor: getRandomBgColor(),
                            fontWeight: "bold",
                            verticalAlign: "middle",
                          }}
                        >
                          {(item?.user_name?.charAt(0) || "U").toUpperCase()}
                        </Avatar>
                      )}

                      <div className="flex flex-col justify-center gap-[2px]">
                        <div className="text-[18px] font-[700] text-[#0E0E0E] leading-[120%]">
                          {item?.user_name ?? "John Doe"}
                        </div>
                        <div className="flex text-[12px] items-center gap-[4px]">
                          <Rate
                            allowHalf
                            disabled
                            value={item.rating}
                            className="!text-secondary !text-[12px]"
                          />
                          {item.rating} |{" "}
                          <div className="text-[14px]">
                            Review on {item?.created_at?.split("T")[0]}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[14px]">{item?.review}</div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-secondary text-start cursor-pointer font-[600] hover:underline"
              >
                {isExpanded ? "View less reviews" : "View more reviews"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Skeleton>
  );
};

export default ReviewContainer;
