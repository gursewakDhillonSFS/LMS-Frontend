"use client";
import { DownArrowIcon, GlobeIcon, HeaderLogoIcon } from "@/utils/icons";
import React, { useCallback, useEffect, useState } from "react";
import CommonButton from "./CommonButton";
import SearchInput from "./SearchInput";
import Link from "next/link";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { CategoryEnum, RoutePaths } from "@/utils/enums";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { setSignin, setSignup } from "@/redux/slices/AuthModalSlice";
import { getSearchApi } from "@/services/collections";
import { courseData } from "@/utils/interface";
import UserAvatarDisplay from "./UserAvatarDisplay";
import { setCourseData } from "@/redux/slices/CourseDataSlice";

const Header = () => {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const pathname = usePathname();
  const router = useRouter();
  const categories = useSelector(
    (state: RootState) => state?.categories?.categories
  );

  const fetchSearchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("query", search);
      params.append("page", "1");
      params.append("per_page", "10");
      params.append("sort_by", "newest");

      const response = await getSearchApi(params);
      if (response?.status === true) {
        setSearchData(response?.data);
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [search]);
  const searchRedirect = (item: courseData) => {
    dispatch(setCourseData(item));

    if (pathname.includes(RoutePaths?.Browse)) {
      setSearch("");
      router.push(`${RoutePaths?.Browse}/course-details`);
    } else if (pathname.includes(RoutePaths?.Homepage)) {
      setSearch("");
      router.push(`${RoutePaths?.Homepage}/course-details`);
    }
  };
  const handleSignup = () => {
    dispatch(setSignup(true));
  };
  useEffect(() => {
    if (search) fetchSearchData();
  }, [search, fetchSearchData]);
  return (
    <div className="sticky top-0 z-50 bg-white flex items-center justify-between w-full h-[82px] border-b-[1px] border-[#D8D8D8] px-[20px] py-[8px] xl:px-[40px] xl:py-[16px]">
      <div className="flex items-center gap-[12px]">
        <Link href={"/"}>
          <HeaderLogoIcon />
        </Link>
        {!pathname.includes(RoutePaths?.Browse) && (
          <div className="relative group flex flex-col gap-2">
            <div className="flex cursor-pointer items-center !h-[40px] !gap-[6px] !text-secondary !border !border-secondary !font-[400] !text-[14px] !rounded-[10px] !p-[10px]">
              <Link
                href={"/browse"}
                onClick={() =>
                  dispatch(setActiveCategory(CategoryEnum.ALL_Classes))
                }
                className="flex items-center gap-[6px]"
              >
                <span>Browse</span>
                <DownArrowIcon />
              </Link>
            </div>

            <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-col bg-white border border-[#D8D8D8] shadow-lg rounded-[8px] min-w-[140px]">
              {categories.map((cat) => (
                <Link
                  href={"/browse"}
                  key={cat.category_id}
                  className="text-left px-4 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap text-sm text-black"
                  onClick={() => {
                    dispatch(setActiveCategory(cat.category_id));
                  }}
                >
                  {cat.category_name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="relative w-full">
          <SearchInput
            search={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!min-w-[150px] lg:!min-w-[472px]"
          />
          {search && searchData && searchData?.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-[250px] scrollbar-hide overflow-y-auto">
              {loading ? (
                <div className="px-4 py-2 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-y-2 border-primary animate-spin"></div>
                </div>
              ) : searchData.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No results found.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {searchData.map((item: courseData) => (
                    <div
                      key={item?.course_id}
                      className="hover:bg-gray-300 p-3 cursor-pointer"
                      onClick={() => searchRedirect(item)}
                    >
                      <UserAvatarDisplay
                        user={{
                          name: item?.course_name,
                          image: item?.course_image_url,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-[12px]">
        <span className="flex items-center gap-[3px] justify-between">
          <GlobeIcon /> <span className="text-[14px] font-[500]">EN</span>
        </span>

        <div className="border border-[#C8C8C8] h-[23px]"></div>

        <button
          className={`font-[500] text-[14px] whitespace-nowrap cursor-pointer`}
          onClick={() => dispatch(setSignin(true))}
        >
          Sign in
        </button>

        <CommonButton text={"Sign Up"} onClick={handleSignup} />
      </div>
    </div>
  );
};

export default Header;
