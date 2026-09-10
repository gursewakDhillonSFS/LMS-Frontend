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
    <section className="flex flex-col lg:flex-row justify-between items-center px-[24px] py-[32px] xl:px-[80px] 2xl:px-[120px] xl:py-[48px] w-full gap-[40px]">
      <div className="flex flex-col justify-around items-start gap-[24px] lg:gap-[32px] max-w-[560px]">
        <div className="flex items-center gap-[10px]">
          <div className="bg-[var(--primary-light)] w-[40px] h-[40px] rounded-[10px] flex justify-center items-center">
            <BulbIcon />
          </div>
          <div className="text-[13px] text-[var(--text-secondary)] font-[500]">
            Online Learning Platform
          </div>
        </div>

        <div className="flex flex-col items-start gap-[16px]">
          <h1 className="text-[40px] lg:text-[48px] xl:text-[56px] leading-[110%] font-[700] text-[var(--text-primary)] tracking-[-0.02em]">
            Learn without{" "}
            <span className="text-[var(--primary)]">limits</span>
          </h1>

          <p className="text-[15px] xl:text-[16px] text-[var(--text-secondary)] leading-[160%] max-w-[480px]">
            Start, switch, or advance your career with more than 10,000
            courses, Professional Certificates, and degrees from world-class
            universities and companies.
          </p>
        </div>

        <div className="flex gap-[12px]">
          <CommonButton
            text={"Sign Up for Free"}
            onClick={handleSignup}
            className="!h-[44px] !px-[24px] !text-[14px]"
          />
          <CommonButton
            text={"Start 7-day Free Trial"}
            onClick={() => route.push(RoutePaths?.Subscription)}
            className="!h-[44px] !px-[24px] !text-[14px] !bg-white !text-[var(--text-primary)] !border !border-[var(--border)] hover:!border-[var(--border-strong)]"
          />
        </div>

        <div className="flex items-center gap-[24px] text-[13px] text-[var(--text-muted)]">
          <span className="flex items-center gap-[6px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--success)]"></span>
            10,000+ Courses
          </span>
          <span className="flex items-center gap-[6px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--primary)]"></span>
            Expert Instructors
          </span>
          <span className="flex items-center gap-[6px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--warning)]"></span>
            Certificates
          </span>
        </div>
      </div>
      <div className="relative">
        <Image
          src={HeroImage}
          alt="Professional learning"
          className="lg:w-[380px] lg:h-[360px] xl:w-[460px] xl:h-[440px] w-[320px] h-[300px] object-contain"
        />
      </div>
    </section>
  );
};

export default HeroSection;
