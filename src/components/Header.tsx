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
    <div className="sticky top-0 z-50 bg-white flex items-center justify-between w-full h-[64px] border-b border-[var(--border)] px-[20px] py-[8px] xl:px-[48px]">
      <div className="flex items-center gap-[16px]">
        <Link href={"/"}>
          <HeaderLogoIcon />
        </Link>

        {/* Top Navigation Links — Matching Screenshot */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            href="/"
            className={`px-3 py-1.5 text-[13px] rounded-[8px] transition-colors ${
              pathname === "/" || pathname === "/homepage"
                ? "text-[var(--primary)] font-semibold bg-[#EEF4FF]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            }`}
          >
            Home
          </Link>

          <Link
            href="/browse"
            onClick={() => dispatch(setActiveCategory(CategoryEnum.ALL_Classes))}
            className={`px-3 py-1.5 text-[13px] rounded-[8px] transition-colors ${
              pathname.includes(RoutePaths?.Browse)
                ? "text-[var(--primary)] font-semibold bg-[#EEF4FF]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            }`}
          >
            All Courses
          </Link>

          {categories.slice(0, 2).map((cat) => (
            <Link
              key={cat.category_id}
              href="/browse"
              onClick={() => dispatch(setActiveCategory(cat.category_id))}
              className="px-3 py-1.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium whitespace-nowrap"
            >
              {cat.category_name}
            </Link>
          ))}

          {categories.length > 2 && (
            <div className="relative group flex items-center">
              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                <span>More</span>
                <DownArrowIcon />
              </button>

              <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-col bg-white border border-[var(--border)] shadow-[var(--shadow-dropdown)] rounded-[10px] min-w-[180px] py-1 mt-1">
                {categories.slice(2).map((cat) => (
                  <Link
                    href="/browse"
                    key={cat.category_id}
                    className="text-left px-4 py-2 hover:bg-[var(--surface-subtle)] cursor-pointer whitespace-nowrap text-[13px] text-[var(--text-primary)] transition-colors"
                    onClick={() => dispatch(setActiveCategory(cat.category_id))}
                  >
                    {cat.category_name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="relative w-full">
          <SearchInput
            search={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!min-w-[150px] lg:!min-w-[400px]"
            placeholder="Search courses, topics, instructors..."
          />
          {search && searchData && searchData?.length > 0 && (
            <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[var(--border)] rounded-[10px] shadow-[var(--shadow-lg)] z-50 max-h-[280px] scrollbar-hide overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin"></div>
                </div>
              ) : searchData.length === 0 ? (
                <div className="p-4 text-center text-[var(--text-muted)] text-[14px]">
                  No results found
                </div>
              ) : (
                <div className="flex flex-col py-[4px]">
                  {searchData.map((item: courseData) => (
                    <div
                      key={item?.course_id}
                      className="hover:bg-[var(--surface-subtle)] px-[16px] py-[10px] cursor-pointer transition-colors duration-[150ms]"
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
        <span className="hidden sm:flex items-center gap-[4px]">
          <GlobeIcon /> <span className="text-[13px] font-[500] text-[var(--text-secondary)]">EN</span>
        </span>

        <div className="hidden sm:block border-l border-[var(--border)] h-[20px]"></div>

        <button
          className="font-[500] text-[14px] whitespace-nowrap cursor-pointer text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors duration-[150ms] px-[8px] py-[4px] rounded-[6px]"
          onClick={() => dispatch(setSignin(true))}
        >
          Sign in
        </button>

        <CommonButton
          text={"Sign Up"}
          onClick={handleSignup}
          className="!h-[36px] !text-[13px]"
        />
      </div>
    </div>
  );
};

export default Header;
