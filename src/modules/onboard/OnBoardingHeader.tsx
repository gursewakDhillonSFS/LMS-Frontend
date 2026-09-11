"use client";

import { resetAllSlices } from "@/redux/resetSlice";
import { HeaderLogoIcon } from "@/utils/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";
import { LogoutOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";

interface OnBoardingHeaderProps {
  title?: string;
}

const OnBoardingHeader: React.FC<OnBoardingHeaderProps> = ({
  title = "Student Setup",
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role_name", { path: "/" });
    Cookies.remove("user_onboarding", { path: "/" });
    Cookies.remove("instructor_onboarding", { path: "/" });
    Cookies.remove("profileStatus", { path: "/" });
    dispatch(resetAllSlices());
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-[72px] px-4 sm:px-8 lg:px-12 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center">
          <HeaderLogoIcon />
        </Link>
        <span className="hidden sm:inline-block w-[1px] h-5 bg-slate-200" />
        <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
          {title}
        </span>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
      >
        <LogoutOutlined className="text-slate-400" />
        <span>Exit Setup</span>
      </button>
    </header>
  );
};

export default OnBoardingHeader;
