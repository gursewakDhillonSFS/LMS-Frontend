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
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { StarFilled, MessageOutlined } from "@ant-design/icons";

const ReviewContainer = () => {
  const selectedCourseData = useSelector(
    (state: RootState) => state?.courseData?.course
  );
  const [loading, setLoading] = useState(false);
  const [courseReview, setCourseReview] = useState<CourseReviewsResponse>();
  const [ratingDistribution, setRatingDistribution] = useState<StarCount[]>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<string>("All Stars");

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
          setRatingDistribution(getRatingDistribution(response?.data || []));
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

  const allReviews = useMemo(() => {
    return courseReview?.data || [];
  }, [courseReview]);

  const filteredReviews = useMemo(() => {
    if (selectedStarFilter === "All Stars") return allReviews;
    const starNum = parseInt(selectedStarFilter, 10);
    if (isNaN(starNum)) return allReviews;
    return allReviews.filter((r) => Math.round(r.rating) === starNum);
  }, [allReviews, selectedStarFilter]);

  const totalReviewsCount = courseReview?.review_count ?? allReviews.length;
  const avgRating = courseReview?.average_rating ?? 0;

  return (
    <Skeleton loading={loading} paragraph={{ rows: 8 }}>
      <div className="flex flex-col xl:gap-[24px] gap-[16px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-[700] text-slate-900">Learner Reviews</h2>
          {totalReviewsCount > 0 && (
            <span className="text-sm font-semibold text-slate-500">
              {totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>

        {totalReviewsCount === 0 ? (
          /* Clean Empty State when no reviews in DB */
          <div className="bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-1">
              <MessageOutlined />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Reviews Yet</h3>
            <p className="text-xs text-slate-500 max-w-md">
              Enrolled students will be able to share their feedback and rating upon progressing through course modules.
            </p>
          </div>
        ) : (
          <div className="rounded-[20px] flex flex-col lg:flex-row lg:gap-[30px] gap-[20px] justify-between">
            {/* Left Rating Overview & Breakdown */}
            <div className="flex w-full lg:w-1/3 gap-[24px] flex-col">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    {avgRating.toFixed(1)}
                  </span>
                  <Rate
                    allowHalf
                    disabled
                    value={avgRating}
                    className="!text-amber-400 text-sm"
                  />
                </div>
                <div className="text-xs text-slate-500">
                  Course rating based on {formatLargeNumber(totalReviewsCount)} genuine student reviews
                </div>
              </div>

              {/* Star Distribution Bars */}
              <div className="flex flex-col gap-2">
                {ratingDistribution?.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 justify-between items-center text-xs text-slate-600"
                  >
                    <span className="w-12 text-slate-700 font-medium">{item.rating}</span>
                    <div className="bg-slate-200 rounded-full h-2 flex-1 relative overflow-hidden">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.count}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[11px] text-slate-400">
                      {item.count}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block border-l border-slate-200"></div>

            {/* Right: Reviews List with Filter */}
            <div className="flex flex-col gap-4 w-full lg:w-2/3">
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500">
                  Showing {Math.min(filteredReviews.length, isExpanded ? filteredReviews.length : 4)} of{" "}
                  {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"}
                </div>
                <div className="w-fit">
                  <Select
                    value={selectedStarFilter}
                    onChange={(val) => setSelectedStarFilter(val)}
                    style={{ minWidth: 120 }}
                    className="h-[36px]"
                    suffixIcon={<SelectIcon />}
                    options={[
                      { value: "All Stars", label: "All Stars" },
                      { value: "5 Star", label: "5 Stars" },
                      { value: "4 Star", label: "4 Stars" },
                      { value: "3 Star", label: "3 Stars" },
                      { value: "2 Star", label: "2 Stars" },
                      { value: "1 Star", label: "1 Star" },
                    ]}
                  />
                </div>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  No reviews match the selected filter.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {(isExpanded ? filteredReviews : filteredReviews.slice(0, 4)).map(
                    (item, index) => {
                      const reviewerName = item?.user_name || "Enrolled Student";
                      const firstLetter = reviewerName.charAt(0).toUpperCase();

                      return (
                        <div
                          key={index}
                          className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isValidUrl(item?.user_avatar || "") ? (
                              <Avatar size={38} src={item.user_avatar} />
                            ) : (
                              <Avatar
                                size={38}
                                style={{
                                  backgroundColor: getRandomBgColor(),
                                  fontWeight: "bold",
                                  verticalAlign: "middle",
                                }}
                              >
                                {firstLetter}
                              </Avatar>
                            )}

                            <div className="flex flex-col justify-center">
                              <div className="text-sm font-bold text-slate-900 leading-tight">
                                {reviewerName}
                              </div>
                              <div className="flex text-xs items-center gap-2 mt-0.5">
                                <Rate
                                  allowHalf
                                  disabled
                                  value={item.rating}
                                  className="!text-amber-400 !text-xs"
                                />
                                <span className="text-slate-400 text-[11px]">
                                  {item?.created_at
                                    ? new Date(item.created_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "Recent review"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed pl-0.5">
                            {item?.review}
                          </p>
                        </div>
                      );
                    }
                  )}

                  {filteredReviews.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded((prev) => !prev)}
                      className="text-blue-600 text-xs text-start cursor-pointer font-semibold hover:underline pt-1"
                    >
                      {isExpanded
                        ? "Show fewer reviews"
                        : `View all ${filteredReviews.length} reviews`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Skeleton>
  );
};

export default ReviewContainer;
