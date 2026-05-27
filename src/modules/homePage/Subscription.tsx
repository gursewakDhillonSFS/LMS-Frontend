"use client";
import CommonButton from "@/components/CommonButton";
import CommonLink from "@/components/CommonLink";
import { setSignin } from "@/redux/slices/AuthModalSlice";
import { HeaderLogoIcon } from "@/utils/icons";
import React from "react";
import { useDispatch } from "react-redux";

const Subscription = () => {
  const dispatch = useDispatch();
  return (
    <div className="bg-secondary flex flex-col items-center justify-center py-[80px] gap-6">
      <div className="flex items-center justify-center gap-[9px]">
        <HeaderLogoIcon iconColor="white" textColor="white" />
        <span className="py-1 px-2 bg-white text-secondary font-bold">Pro</span>
      </div>
      <p className="text-white font-[500] text-xl">
        Advance your career with world-class courses and certificate programs
      </p>
      <div className="flex gap-3">
        <CommonButton
          text={"View Details"}
          onClick={() => {
            dispatch(setSignin(true));
          }}
          className="!bg-transparent !text-white !border !w-[186px] !border-white"
        />
        <CommonButton
          text={"Start 7-day Free Trial"}
          className="!bg-white !text-secondary !w-[186px]"
        />
      </div>
      <CommonLink
        text={"$15/month, cancel anytime"}
        className="text-white font-[500] "
      />
    </div>
  );
};

export default Subscription;
