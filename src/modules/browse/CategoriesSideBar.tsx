"use client";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { RootState } from "@/redux/store";
import { CategoryEnum } from "@/utils/enums";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const CategoriesSideBar = () => {
  const dispatch = useDispatch();
  const activeCategory = useSelector(
    (state: RootState) => state?.categories?.activeCategory
  );
  const categories = useSelector(
    (state: RootState) => state?.categories?.categories
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeCategory]);

  return (
    <div className="sticky top-[122px] flex flex-col gap-[20px] w-[20%]">
      <h2 className="!text-[24px] !font-[700] !leading-[120%]">Categories</h2>
      <ul className="flex !flex-col !gap-[10px]">
        <li>
          <button
            onClick={() =>
              dispatch(setActiveCategory(CategoryEnum?.ALL_Classes))
            }
            className={`cursor-pointer transition-all duration-300 ease-in-out text-[14px] w-[200px] lg:text-[18px] lg:w-[230px] !text-left ${
              activeCategory === CategoryEnum?.ALL_Classes
                ? "!bg-[#002c3f] !text-white !font-[700] !p-[12px] !rounded-[6px]"
                : "!text-[#002c3f]"
            }`}
          >
            All Classes
          </button>
        </li>
        {categories?.map((category) => (
          <li key={category?.category_id}>
            <button
              onClick={() => dispatch(setActiveCategory(category?.category_id))}
              className={`cursor-pointer transition-all duration-300 ease-in-out text-[14px] w-[200px] lg:text-[18px] lg:w-[230px] !text-left ${
                activeCategory === category?.category_id
                  ? "!bg-[#002c3f] !text-white !font-[700] !p-[12px] !rounded-[6px]"
                  : "!text-[#002c3f]"
              }`}
            >
              {category?.category_name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesSideBar;
