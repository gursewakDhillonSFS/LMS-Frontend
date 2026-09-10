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
    <section className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] text-white flex flex-col items-center justify-center py-20 px-6 text-center gap-5">
      <div className="flex items-center justify-center gap-2.5">
        <HeaderLogoIcon iconColor="white" textColor="white" />
        <span className="py-0.5 px-2 bg-[var(--primary)] text-white text-xs font-bold rounded-md uppercase tracking-wider">
          Pro
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight max-w-2xl">
        Advance your career with world-class courses and certificate programs
      </h2>
      <p className="text-slate-300 text-sm md:text-base max-w-xl">
        Get unlimited access to top courses, guided projects, and recognized credentials taught by industry leaders.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <CommonButton
          text="View Details"
          onClick={() => {
            dispatch(setSignin(true));
          }}
          className="!bg-transparent !text-white !border !border-slate-600 hover:!border-white !w-[180px]"
        />
        <CommonButton
          text="Start Free Trial"
          className="!bg-[var(--primary)] !text-white hover:!bg-[var(--primary-hover)] !border-none !w-[180px] shadow-xs"
        />
      </div>
      <span className="text-xs text-slate-400 font-medium">
        $15/month billed annually • Cancel anytime
      </span>
    </section>
  );
};

export default Subscription;
