"use client";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import DashboardCourseCard from "@/components/DashboardCourseCard";
import NoDataFound from "@/components/NoDataFound";
import Pagination from "@/components/Pagination";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import {
  getSavedCourses,
  removeFromFavorite,
} from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { DataNotFound } from "@/utils/images";
import { courseData } from "@/utils/interface";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "@/utils/toast";

const SavedCourses = () => {
  const [loading, setLoading] = useState(false);
  const [limit] = useState(12);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const dispatch = useDispatch();

  const [courses, setCourses] = useState<courseData[]>([]);

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", page + "");
    params.append("limit", limit + "");
    try {
      const response = await getSavedCourses();

      if (response?.status === true) {
        setCourses(response?.data?.course_list);
        setTotal(response?.data?.total_courses);
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [limit, page]);

  const handleRemoveFavorite = async (id: string) => {
    if (id) {
      const param = new URLSearchParams();
      param.append("course_id", id);
      try {
        const res = await removeFromFavorite(param);
        if (res.status) {
          toast.success(res.message);
          setCourses((prev) => prev.filter((item) => item.course_id !== id));
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };



  const handleRedirect = (data: courseData) => {
    dispatch(setCourseData(data));
    router.push(`${RoutePaths.MyExplore}/checkout`);
  };
  const veiwDetail = (data: courseData) => {
    dispatch(setCourseData(data));
    router.push(`${RoutePaths.MyExplore}/course-detail`);
  };

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);
  return (
    <div className="w-full h-fit flex flex-col gap-3">
      <h2 className="text-[32px] font-[700] text-[#0E0E0E]">Saved Courses</h2>
      {loading || courses?.length > 0 ? (
        loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
            {[1, 2, 3, 4].map((index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] w-full anima">
            {courses?.map((course, index) => (
              <DashboardCourseCard
                key={index}
                courseData={course}
                handleRemoveFavorite={handleRemoveFavorite}
                handleRedirect={handleRedirect}
                veiwDetail={veiwDetail}
              />
            ))}
          </div>
        )
      ) : (
        <NoDataFound icon={DataNotFound} />
      )}
      {total > limit && (
        <Pagination page={page} limit={limit} setPage={setPage} total={total} />
      )}
    </div>
  );
};

export default SavedCourses;
