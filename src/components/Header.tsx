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
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";

const Header = () => {
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      console.log(err || "Failed to fetch search data");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const searchRedirect = (item: courseData) => {
    dispatch(setCourseData(item));
    setSearch("");
    if (pathname.includes(RoutePaths?.Browse)) {
      router.push(`${RoutePaths?.Browse}/course-details`);
    } else {
      router.push(`${RoutePaths?.Homepage}/course-details`);
    }
  };

  const handleSignup = () => {
    dispatch(setSignup(true));
    setMobileMenuOpen(false);
  };

  const handleSignin = () => {
    dispatch(setSignin(true));
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (search) fetchSearchData();
  }, [search, fetchSearchData]);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-6 xl:gap-8 shrink-0">
          <Link href="/" className="shrink-0 flex items-center">
            <HeaderLogoIcon />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/browse"
              onClick={() => dispatch(setActiveCategory(CategoryEnum.ALL_Classes))}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                pathname.includes(RoutePaths?.Browse)
                  ? "text-[#4F46E5] font-semibold bg-[#EEF2FF]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              All Courses
            </Link>

            {categories.slice(0, 2).map((cat) => (
              <Link
                key={cat.category_id}
                href="/browse"
                onClick={() => dispatch(setActiveCategory(cat.category_id))}
                className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg whitespace-nowrap transition-colors"
              >
                {cat.category_name}
              </Link>
            ))}

            {categories.length > 2 && (
              <div className="relative group flex items-center">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                >
                  <span>More</span>
                  <DownArrowIcon />
                </button>

                <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-col bg-white border border-slate-200 shadow-xl rounded-xl min-w-[200px] py-1.5 mt-1 animate-in fade-in zoom-in-95">
                  {categories.slice(2).map((cat) => (
                    <Link
                      href="/browse"
                      key={cat.category_id}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer whitespace-nowrap text-[13px] text-slate-700 hover:text-slate-900 transition-colors"
                      onClick={() => dispatch(setActiveCategory(cat.category_id))}
                    >
                      {cat.category_name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Center: Search Input */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
          <SearchInput
            search={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            placeholder="Search courses, topics, instructors..."
          />

          {search && searchData && searchData?.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-72 scrollbar-hide overflow-y-auto">
              {loading ? (
                <div className="px-4 py-4 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-[#4F46E5] border-t-transparent animate-spin" />
                </div>
              ) : searchData.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No results found
                </div>
              ) : (
                <div className="flex flex-col py-1">
                  {searchData.map((item: courseData) => (
                    <div
                      key={item?.course_id}
                      className="hover:bg-slate-50 px-4 py-2.5 cursor-pointer transition-colors"
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

        {/* Right: Language Selector, Auth Buttons & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-slate-600">
            <GlobeIcon />
            <span className="text-xs font-semibold">EN</span>
          </div>

          <div className="hidden sm:block border-l border-slate-200 h-5" />

          <button
            onClick={handleSignin}
            className="hidden sm:inline-flex text-sm font-medium text-slate-700 hover:text-[#4F46E5] transition-colors px-2 py-1 rounded-md cursor-pointer"
          >
            Sign in
          </button>

          <CommonButton
            text="Sign Up"
            onClick={handleSignup}
            className="!h-9 !px-4 !text-xs sm:!text-sm !font-semibold !rounded-lg !bg-[#4F46E5] hover:!bg-[#4338CA] !text-white shadow-xs"
          />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <CloseOutlined className="text-lg" />
            ) : (
              <MenuOutlined className="text-lg" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown / Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-5 py-4 shadow-xl flex flex-col gap-3 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1">
            <Link
              href="/browse"
              onClick={() => {
                dispatch(setActiveCategory(CategoryEnum.ALL_Classes));
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              All Courses
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.category_id}
                href="/browse"
                onClick={() => {
                  dispatch(setActiveCategory(cat.category_id));
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {cat.category_name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
              <GlobeIcon />
              <span>Language: English (EN)</span>
            </div>

            <button
              onClick={handleSignin}
              className="text-sm font-semibold text-[#4F46E5] hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
