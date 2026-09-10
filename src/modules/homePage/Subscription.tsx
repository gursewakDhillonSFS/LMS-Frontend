"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setSignup, setEmail } from "@/redux/slices/AuthModalSlice";
import { CreditCardOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

export default function Subscription() {
  const dispatch = useDispatch();
  const [emailInput, setEmailInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      dispatch(setEmail(emailInput.trim()));
    }
    dispatch(setSignup(true));
  };

  return (
    <section className="px-4 sm:px-8 lg:px-16 xl:px-24 py-12 bg-white">
      <div className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#101D3F] to-[#1C1A4E] text-white py-16 px-6 sm:px-12 lg:px-16 text-center shadow-[0_20px_50px_rgba(11,19,43,0.3)]">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#4F46E5]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3B82F6]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-[#818CF8] mb-6">
            <span className="text-xs">✦</span> Start Learning Today
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Take the First Step Towards <br className="hidden sm:inline" />
            Your Dream Career
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-lg leading-relaxed">
            Join millions of learners worldwide and gain the skills you need to succeed. It&apos;s free to get started!
          </p>

          {/* Input & CTA */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white/95 rounded-2xl sm:rounded-full shadow-lg backdrop-blur-sm"
          >
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address..."
              className="w-full px-5 py-3 text-sm text-[#0F172A] placeholder-slate-400 bg-transparent focus:outline-none rounded-full"
            />
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl sm:rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-semibold text-sm shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Get Started Free</span>
              <span className="text-base leading-none">→</span>
            </button>
          </form>

          {/* Perks */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CreditCardOutlined className="text-sm text-slate-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-sm text-slate-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
