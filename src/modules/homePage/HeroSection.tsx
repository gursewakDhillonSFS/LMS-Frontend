"use client";
import CommonButton from "@/components/CommonButton";
import { setSignup } from "@/redux/slices/AuthModalSlice";
import { RoutePaths } from "@/utils/enums";
import { HomeHeroStudent } from "@/utils/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { FC } from "react";
import { useDispatch } from "react-redux";

const HeroSection: FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSignup = () => {
    dispatch(setSignup(true));
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 md:pt-12 md:pb-16 px-6 md:px-12 xl:px-20 2xl:px-24">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content Column */}
        <div className="flex flex-col items-start gap-6 max-w-xl z-10">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-[#EEF4FF] border border-[#D5E3FC] px-3.5 py-1.5 rounded-full text-[#315CFF] text-[12px] font-semibold shadow-xs">
            <span>⚡</span>
            <span>Learn Without Limits</span>
          </div>

          {/* Headline */}
          <h1 className="text-[36px] sm:text-[46px] lg:text-[54px] font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.12]">
            Build Your Skills, <br />
            <span className="text-[var(--primary)] bg-gradient-to-r from-[#315CFF] to-[#6366F1] bg-clip-text text-transparent">
              Shape Your Future
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-relaxed">
            Access world-class courses, expert instructors and hands-on learning.
            Gain new skills, earn certificates and achieve your goals — all in one
            place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <CommonButton
              text="Start Learning Free →"
              onClick={handleSignup}
              className="!h-[44px] !px-6 !text-[14px]"
            />

            <button
              type="button"
              onClick={() => router.push(RoutePaths?.Browse)}
              className="h-[44px] px-5 bg-white border border-[var(--border)] rounded-[8px] text-[var(--text-primary)] font-medium text-[14px] flex items-center gap-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[var(--surface-subtle)] hover:border-[var(--border-strong)] transition-all hover:-translate-y-px active:translate-y-0"
            >
              <span className="w-5 h-5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--primary)]">
                ▶
              </span>
              <span>Watch Video</span>
            </button>
          </div>

          {/* Social Proof Stats Row */}
          <div className="flex flex-wrap items-center gap-6 pt-3 text-[13px] font-medium text-[var(--text-secondary)]">
            <span className="flex items-center gap-2">
              <span className="text-[16px]">🎓</span>
              <span>1000+ Courses</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[16px]">👥</span>
              <span>Expert Instructors</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[16px]">📜</span>
              <span>Certificates</span>
            </span>
          </div>
        </div>

        {/* Right Hero Visual with Floating 3D Badges & Annotation */}
        <div className="relative w-full lg:w-[500px] xl:w-[560px] flex items-center justify-center">
          {/* Cursive Annotation Top Right */}
          <div className="absolute -top-6 right-2 sm:right-6 text-right z-20 pointer-events-none hidden sm:block">
            <span className="text-[15px] font-medium italic text-slate-500 font-serif">
              Learn · Grow · Succeed
            </span>
            <svg
              width="40"
              height="30"
              viewBox="0 0 40 30"
              fill="none"
              stroke="#64748B"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="ml-auto mt-1 rotate-12"
            >
              <path d="M5 5 C 20 15, 25 25, 35 25" />
              <polyline points="28 22 35 25 32 18" />
            </svg>
          </div>

          {/* Main Hero Student Image */}
          <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] rounded-[24px] overflow-hidden border border-white/80 shadow-[0_12px_36px_rgba(49,92,255,0.12)] bg-gradient-to-b from-blue-50/50 to-indigo-50/30">
            <Image
              src={HomeHeroStudent}
              alt="Skillora student mastering in-demand skills online"
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>

          {/* Floating Translucent 3D Badges */}
          {/* 1. Bar Chart Badge (Top Left) */}
          <div className="absolute -top-3 left-4 sm:-left-3 bg-white/95 backdrop-blur-md p-3 rounded-[14px] shadow-[0_8px_20px_rgba(16,24,40,0.1)] border border-[#E0EAFF] flex items-center justify-center z-20 animate-pulse duration-1000">
            <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              📊
            </div>
          </div>

          {/* 2. Code Badge (Left Center) */}
          <div className="absolute top-1/3 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-[12px] shadow-[0_8px_20px_rgba(16,24,40,0.1)] border border-[#E0EAFF] flex items-center gap-2 z-20">
            <div className="w-7 h-7 rounded-[7px] bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs">
              &lt;/&gt;
            </div>
          </div>

          {/* 3. Graduation Badge (Bottom Right) */}
          <div className="absolute -bottom-3 right-4 sm:-right-2 bg-white/95 backdrop-blur-md p-3.5 rounded-[16px] shadow-[0_10px_24px_rgba(16,24,40,0.12)] border border-[#E0EAFF] flex items-center justify-center z-20">
            <div className="w-9 h-9 rounded-[10px] bg-[var(--primary)] text-white flex items-center justify-center font-bold text-base shadow-xs">
              🎓
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
