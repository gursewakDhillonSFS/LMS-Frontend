"use client";
import React from "react";
import CategoriesSideBar from "./CategoriesSideBar";
import BrowseContent from "./BrowseContent";

const BrowseWrapper = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-6 md:px-8 xl:px-10 2xl:px-14 flex flex-col lg:flex-row gap-6 xl:gap-8 justify-between">
      <div className="w-full lg:w-[210px] shrink-0">
        <CategoriesSideBar />
      </div>
      <div className="flex-1 min-w-0">
        <BrowseContent />
      </div>
    </div>
  );
};

export default BrowseWrapper;
