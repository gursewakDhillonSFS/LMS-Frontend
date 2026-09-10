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
    <div className="sticky top-[84px] flex flex-col gap-4 w-[220px] shrink-0">
      <h2 className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight">
        Categories
      </h2>
      <ul className="flex flex-col gap-1">
        <li>
          <button
            onClick={() =>
              dispatch(setActiveCategory(CategoryEnum?.ALL_Classes))
            }
            className={`w-full text-left px-3.5 py-2 text-sm rounded-[8px] cursor-pointer transition-all duration-150 ${
              activeCategory === CategoryEnum?.ALL_Classes
                ? "bg-[var(--surface-subtle)] text-[var(--primary)] font-semibold border-l-2 border-[var(--primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] font-medium"
            }`}
          >
            All Classes
          </button>
        </li>
        {categories?.map((category) => {
          const isActive = activeCategory === category?.category_id;
          return (
            <li key={category?.category_id}>
              <button
                onClick={() => dispatch(setActiveCategory(category?.category_id))}
                className={`w-full text-left px-3.5 py-2 text-sm rounded-[8px] cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-[var(--surface-subtle)] text-[var(--primary)] font-semibold border-l-2 border-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] font-medium"
                }`}
              >
                {category?.category_name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoriesSideBar;
