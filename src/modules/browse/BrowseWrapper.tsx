"use client";
import React from "react";
import CategoriesSideBar from "./CategoriesSideBar";
import BrowseContent from "./BrowseContent";

const BrowseWrapper = () => {
  
  return (
    <div className="px-[20px] py-[20px] xl:px-[120px] xl:py-[40px] bg-white flex flex-row gap-[20px] xl:gap-[100px] justify-between">
      <div>
        <CategoriesSideBar />
      </div>
      <BrowseContent />
    </div>
  );
};

export default BrowseWrapper;
