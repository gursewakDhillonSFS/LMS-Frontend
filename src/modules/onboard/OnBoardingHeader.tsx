import CommonLink from "@/components/CommonLink";
import { resetAllSlices } from "@/redux/resetSlice";
import { HeaderLogoIcon } from "@/utils/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";

const OnBoardingHeader = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = () => {
    dispatch(resetAllSlices());
    router.push("/");
  };
  return (
    <div className="sticky top-0 z-50 bg-white flex items-center justify-between w-full h-[82px] border-b-[1px] border-[#D8D8D8] px-[20px] py-[8px] lg:px-[40px] lg:py-[16px]">
      <Link href={"/"}>
        <HeaderLogoIcon />
      </Link>

      <CommonLink
        text={"Exit"}
        className="text-[16px] font-[700]"
        onClick={handleLogout}
      />
    </div>
  );
};

export default OnBoardingHeader;
