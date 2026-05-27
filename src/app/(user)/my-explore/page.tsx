"use client";
import CommonButton from "@/components/CommonButton";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import DashboardCourseCard from "@/components/DashboardCourseCard";
import NoDataFound from "@/components/NoDataFound";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import useCategories from "@/hooks/useCategories";
import { setCartCount, setCourseData } from "@/redux/slices/CourseDataSlice";
import {
  addToCart,
  addToFavorite,
  getAllCoursesApi,
  removeFromCart,
  removeFromFavorite,
} from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { FilterIcon } from "@/utils/icons";
import { DataNotFound } from "@/utils/images";
import { courseData } from "@/utils/interface";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";

const MyExplore = () => {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const { data } = useCategories();
  const [limit] = useState(12);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [courses, setCourses] = useState<courseData[]>([]);
  const [loading, setLoading] = useState(false);

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", limit + "");
      params.append("page", String(page));
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }
      if (activeTag) params.append("category_id", activeTag);

      const response = await getAllCoursesApi(params);

      if (response?.status === true) {
        setCourses(response?.data?.course_list);
        setTotal(response?.data?.total_courses);
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [limit, page, activeTag, organization_id]);

  const handleAddFavorite = async (id: string) => {
    if (id) {
      const payload = {
        course_id: id,
        favorite: true,
      };
      try {
        const res = await addToFavorite(payload);
        if (res.status) {
          toast.success(res.message);
          setCourses((prev) =>
            prev.map((item) =>
              item.course_id === id
                ? { ...item, favorite_status: true, favorite: true }
                : item
            )
          );
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (id) {
      const param = new URLSearchParams();
      param.append("course_id", id);
      try {
        const res = await removeFromFavorite(param);
        if (res.status) {
          toast.success(res.message);
          setCourses((prev) =>
            prev.map((item) =>
              item.course_id === id
                ? { ...item, favorite_status: false, favorite: false }
                : item
            )
          );
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAddCart = async (id: string) => {
    if (id) {
      const payload = {
        course_ids: id,
      };
      try {
        const res = await addToCart(payload);
        if (res.status) {
          toast.success(res.message);
          setCourses((prev) =>
            prev.map((item) =>
              item.course_id === id ? { ...item, cart_status: true } : item
            )
          );
          dispatch(setCartCount(res?.data?.total_courses));
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleRemoveCart = async (id: string) => {
    if (id) {
      try {
        const res = await removeFromCart(id);
        if (res.status) {
          console.log(res);
          toast.success(res.message);
          setCourses((prev) =>
            prev.map((item) =>
              item.course_id === id ? { ...item, cart_status: false } : item
            )
          );
          dispatch(setCartCount(res?.data?.total_courses));
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, fetchCourseData, activeTag]);
  return (
    <div className="flex gap-[32px] flex-col">
      <div className="flex flex-col items-center justify-center gap-[16px] lg:px-[150px]">
        <h1 className="font-bold text-[40px] leading-[120%]">
          Explore Classes
        </h1>
        <div className="text-[16px] plus-jakarta-sans text-center font-[400] px-10">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vel enim
          voluptatem sint. Saepe molestiae quaerat, quam, modi reiciendis iusto,
          a cumque odit veniam animi aliquam!
        </div>
        <div className="bg-white !rounded-[12px] py-1 w-[100%]">
          <SearchInput
            search={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!border-[0px] !pr-1"
            icon={
              <CommonButton
                icon={<SearchOutlined />}
                text={"Search"}
                className="flex-row-reverse !bg-secondary text-white w-48"
                onClick={() => console.log(search)}
              />
            }
          />
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {data?.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTag(item?.category_id)}
              className={`px-[24px] h-[40px] cursor-pointer rounded-[24px] transition-all duration-300 ease-in-out  ${
                item?.category_id === activeTag
                  ? "bg-green-500 text-white"
                  : " hover:bg-gray-200 bg-white hover:!text-black"
              }`}
            >
              {item?.category_name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <h1 className="font-bold text-[32px] leading-[120%]">
            Courses for you
          </h1>
          <CommonButton
            text={"Filter"}
            icon={<FilterIcon />}
            className="flex-row-reverse !bg-white text-black"
          />
        </div>
        {loading || courses?.length > 0 ? (
          loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
              {[1, 2, 3, 4].map((index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-[12px] w-full">
              {courses.map((course) => (
                <DashboardCourseCard
                  key={course.course_id}
                  courseData={course}
                  handleAddFavorite={handleAddFavorite}
                  handleRemoveFavorite={handleRemoveFavorite}
                  handleRedirect={handleRedirect}
                  veiwDetail={veiwDetail}
                  handleAddCart={handleAddCart}
                  handleRemoveCart={handleRemoveCart}
                />
              ))}
            </div>
          )
        ) : (
          <NoDataFound icon={DataNotFound} />
        )}
        {total > limit && (
          <Pagination
            page={page}
            limit={limit}
            setPage={setPage}
            total={total}
          />
        )}
      </div>
    </div>
  );
};

export default MyExplore;


