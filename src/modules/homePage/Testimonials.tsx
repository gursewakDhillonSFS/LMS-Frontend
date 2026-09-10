"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarFilled } from "@ant-design/icons";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import { useTranslation } from "@/context/I18nContext";

interface TestimonialItem {
  name: string;
  role: string;
  avatar: string;
  feedback: string;
  rating: number;
}

const testimonials: TestimonialItem[] = [
  {
    name: "Priya Sharma",
    role: "Data Science Learner",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    feedback:
      "The courses are well-structured and easy to follow. I gained practical skills that helped me land my dream job!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Web Development Learner",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    feedback:
      "Amazing platform! The instructors explain concepts clearly and the projects are really helpful.",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    role: "UI/UX Design Learner",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    feedback:
      "Skillora gave me the confidence to switch my career. Great content and supportive community!",
    rating: 5,
  },
  {
    name: "Aman Gupta",
    role: "Full Stack Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    feedback:
      "The hands-on projects and mentorship elevated my coding abilities significantly. Highly recommended!",
    rating: 5,
  },
];

export default function Testimonials() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Visible items in 3-card window
  const visibleItems = [
    testimonials[activeIndex % testimonials.length],
    testimonials[(activeIndex + 1) % testimonials.length],
    testimonials[(activeIndex + 2) % testimonials.length],
  ];

  return (
    <section className="py-20 px-6 sm:px-8 lg:px-16 xl:px-24 bg-[#F8FAFC]/60 border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#4F46E5] uppercase mb-2">
              <span className="text-sm">✦</span> {t("home.testimonials.badge")}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {t("home.testimonials.title")}
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-xl">
              {t("home.testimonials.subtitle")}
            </p>
          </div>

          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors group"
          >
            <span>{t("home.testimonials.viewAll")}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.08)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Author Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-[#EEF2FF]">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F172A] text-base leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#64748B] font-medium">
                        {item.role}
                      </p>
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <p className="text-sm text-[#334155] leading-relaxed mb-6 font-normal">
                    &ldquo;{item.feedback}&rdquo;
                  </p>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-[#F59E0B] text-sm">
                  {[...Array(item.rating)].map((_, i) => (
                    <StarFilled key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Next Navigation Arrow (Right Floating) */}
          <button
            onClick={nextSlide}
            aria-label="Next testimonials"
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg items-center justify-center text-[#4F46E5] hover:bg-[#EEF2FF] hover:scale-105 transition-all z-10 cursor-pointer"
          >
            <RightOutlined className="text-xs" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? "w-7 bg-[#4F46E5]"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
