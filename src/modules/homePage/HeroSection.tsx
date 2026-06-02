"use client";
import CommonButton from "@/components/CommonButton";
import { setSignup } from "@/redux/slices/AuthModalSlice";
import { RoutePaths } from "@/utils/enums";
import { BulbIcon } from "@/utils/icons";
import { HeroImage } from "@/utils/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { useDispatch } from "react-redux";

const HeroSection: FC = () => {
  const dispatch = useDispatch();
  const route = useRouter();
  const handleSignup = () => {
    dispatch(setSignup(true));
  };
  return (
    <section className="flex flex-row justify-between items-center px-[40px] py-[25px] xl:px-[120px] xl:py-[50px] w-full">
      <div className="flex flex-col justify-around items-start gap-[16px] lg:gap-[32px]">
        <div className="flex items-center gap-[8px] lg:gap-[12px] xl:gap-[16px] justify-center">
          <div className="bg-navcolor w-[35px] h-[35px] lg:w-[40px] lg:h-[40px] xl:w-[50px] xl:h-[50px] flex justify-center items-center">
            <BulbIcon />
          </div>
          <div className="text-[13px] xl:text-[16px] text-[#2D2D2D]">
            Biggest Online <br /> Learning Platform
          </div>
        </div>

        <div className="flex flex-col items-start justify-between w-[330px] xl:w-[500px] gap-[12px]">
          <h1
            className={`text-[50px] lg:text-[60px] xl:text-[80px] leading-[120%] fjalla-one-regular `}
          >
            Learn without <br /> limits
          </h1>

          <div className="text-[10px] lg:text-[11px]  xl:text-[16px] text-justify text-[#0E0E0E] leading-[150%]">
            Start, switch, or advance your career with more than 10,000 <br />{" "}
            courses, Professional Certificates, and degrees from world-class{" "}
            <br /> universities and companies.
          </div>
        </div>

        <div className="flex gap-3">
          <CommonButton text={"Sign Up for Free"} onClick={handleSignup} />
          <CommonButton
            text={"Start 7-day Free Trial"}
            onClick={() => route.push(RoutePaths?.Subscription)}
            className="!bg-secondary !text-white"
          />
        </div>
      </div>
      <Image
        src={HeroImage}
        alt="Instructor"
        className="lg:w-[438px] lg:h-[410px] xl:w-[538px] xl:h-[510px] w-[338px] h-[310px]"
      />
    </section>
  );
};

export default HeroSection;
