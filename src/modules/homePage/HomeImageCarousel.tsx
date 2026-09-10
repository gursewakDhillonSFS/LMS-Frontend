"use client";
import { RoutePaths } from "@/utils/enums";
import { HomeInspiringStudent } from "@/utils/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const HomeImageCarousel = () => {
  const router = useRouter();

  return (
    <section className="py-12 md:py-16 px-6 md:px-12 xl:px-20 2xl:px-24">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Visual Column with Speech Bubble & Play Overlay */}
        <div className="relative w-full lg:w-[480px] xl:w-[540px]">
          {/* Main Photo Card */}
          <div className="relative w-full h-[300px] sm:h-[360px] md:h-[400px] rounded-[24px] overflow-hidden border border-white/80 shadow-[0_12px_36px_rgba(49,92,255,0.08)] bg-gradient-to-b from-blue-50/50 to-indigo-50/30">
            <Image
              src={HomeInspiringStudent}
              alt="Inspiring Online Courses"
              fill
              unoptimized
              className="object-cover"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-[var(--primary)] text-white flex items-center justify-center pl-1 shadow-[0_4px_16px_rgba(49,92,255,0.4)] hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
                <span className="text-[18px]">▶</span>
              </div>
            </div>
          </div>

          {/* Floating Speech Bubble Top Right */}
          <div className="absolute -top-4 right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-[14px] shadow-[0_8px_24px_rgba(16,24,40,0.1)] border border-[#D5E3FC] flex items-center gap-2 max-w-[220px]">
            <span className="text-[12px] font-bold text-[var(--text-primary)] leading-tight italic">
              &ldquo;Learning today, leading tomorrow.&rdquo;
            </span>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="flex flex-col items-start gap-6 max-w-xl">
          <div className="flex flex-col gap-2">
            <span className="text-[var(--primary)] text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-1.5">
              <span>✦</span>
              <span>EXPLORE & GROW</span>
            </span>

            <h2 className="text-[28px] md:text-[38px] font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.18]">
              Inspiring Online Courses <br />
              for a Brighter Future
            </h2>

            <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-relaxed pt-1">
              Discover a wide range of courses designed to build your skills,
              boost your career, and unlock new opportunities. With expert
              instructors and flexible learning, you&apos;re always in control.
            </p>
          </div>

          {/* 3 Checkmark Bullet Points */}
          <div className="flex flex-col gap-3 text-[14px] font-medium text-[var(--text-primary)]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#EEF4FF] text-[var(--primary)] flex items-center justify-center shrink-0">
                <CheckIcon />
              </div>
              <span>Learn at your own pace</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#EEF4FF] text-[var(--primary)] flex items-center justify-center shrink-0">
                <CheckIcon />
              </div>
              <span>Get certified, build your resume</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#EEF4FF] text-[var(--primary)] flex items-center justify-center shrink-0">
                <CheckIcon />
              </div>
              <span>Access on any device, anywhere</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => router.push(RoutePaths?.Browse)}
            className="h-[44px] px-6 bg-[var(--primary)] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#254CD9] shadow-[0_2px_8px_rgba(49,92,255,0.3)] transition-all hover:-translate-y-px active:translate-y-0"
          >
            Explore All Courses →
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomeImageCarousel;
