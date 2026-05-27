"use client";
import CommonButton from "@/components/CommonButton";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import NoDataFound from "@/components/NoDataFound";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import SortButton from "@/components/SortButton";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import { RootState } from "@/redux/store";
import { getAllCoursesApi } from "@/services/collections";
import { getCategoryName } from "@/utils/comman";
import { CategoryEnum } from "@/utils/enums";
import { DataNotFound } from "@/utils/images";
import { courseData } from "@/utils/interface";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const sortOrderOptions = [
  {
    label: "Price: Low to High",
    value: "price_low",
  },
  {
    label: "Price: High to Low",
    value: "price_high",
  },
];

const CategoryCourses = () => {
  const [sortField, setSortField] = useState<string | null>("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<string | null>("");
  const [courses, setCourses] = useState<courseData[]>([]);
  const [loading, setLoading] = useState(false);
  const activeCategory = useSelector(
    (state: RootState) => state?.categories?.activeCategory
  );
  const limit = activeCategory === CategoryEnum?.ALL_Classes ? "6" : "6";
  const categories = useSelector(
    (state: RootState) => state?.categories?.categories
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number>(1);
  const router = useRouter();
  const dispatch = useDispatch();

  const courseRedirect = (value: courseData | undefined) => {
    router.push("/browse/course-details");
    dispatch(setCourseData(value));
  };
  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", limit);
      params.append("page", String(page));
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }
      const catId = activeCategory === CategoryEnum.ALL_Classes
        ? categories?.[0]?.category_id
        : activeCategory;
      if (catId) params.append("category_id", catId);
      if (sortField) params.append("sort_by", sortField);

      const response = await getAllCoursesApi(params);
      if (response?.status === true) {
        setCourses(response?.data?.course_list);
        setTotal(response?.total_courses);
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, categories, limit, page, sortField, organization_id]);

  const handleCategoryChange = () => {
    dispatch(setActiveCategory(categories?.[0]?.category_id));
  };

  useEffect(() => {
    fetchCourseData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeCategory, page, sortField, fetchCourseData]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex justify-between items-center">
        <h1 className="!text-[24px] !font-[700] !leading-[120%]">
          {getCategoryName(categories, activeCategory) ||
            getCategoryName(categories, categories?.[0]?.category_id)}
        </h1>
        <div>
          {activeCategory === CategoryEnum?.ALL_Classes ? (
            <CommonButton
              text={"View All"}
              bgColor="transparent"
              className="border border-[#002333]"
              onClick={handleCategoryChange}
            />
          ) : (
            <div className="flex items-center gap-[12px]">
              <SearchInput
                search={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!max-w-[150px] lg:!max-w-[372px]"
              />
              <SortButton
                sortField={sortField}
                sortOptions={sortOrderOptions}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                setSortField={setSortField}
                allowClear={true}
              />
            </div>
          )}
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
          {[1, 2, 3].map((index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      ) : courses?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
          {courses.map((course) => (
            <CourseCard
              key={course?.course_id}
              data={course}
              bgColor="#ffffff"
              instructorColor="#0E0E0E"
              titleColor="#000"
              footerColor="var(--secondary)"
              onClick={courseRedirect}
            />
          ))}
        </div>
      ) : (
        <NoDataFound icon={DataNotFound} />
      )}

      {activeCategory !== CategoryEnum?.ALL_Classes &&
        total > Number(limit) && (
          <Pagination
            limit={Number(limit)}
            setPage={setPage}
            page={page}
            total={total}
          />
        )}
    </div>
  );
};

export default CategoryCourses;


