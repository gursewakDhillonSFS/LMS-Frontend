"use client";
import React, { useState } from "react";
import Link from "next/link";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useTranslation } from "@/context/I18nContext";
import { translations } from "@/locales";

interface FAQItem {
  question: string;
  answer: string;
}

const faqsLeft: FAQItem[] = [
  {
    question: "How do I enroll in a course?",
    answer:
      "Simply browse our course catalog, choose your preferred course, and click 'Enroll Now'. If you don't have an account yet, you'll be prompted to create one in seconds.",
  },
  {
    question: "Can I get a refund for a course purchase?",
    answer:
      "Yes! We offer a full 2-day money-back guarantee on course purchases if you're not completely satisfied with your learning experience.",
  },
  {
    question: "Do you provide certificates?",
    answer:
      "Yes! Upon successfully completing any course or specialization track, you will receive a verified, shareable digital certificate for your portfolio and LinkedIn profile.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and localized bank transfer options.",
  },
];

const faqsRight: FAQItem[] = [
  {
    question: "How do course purchases and batches work?",
    answer:
      "When you buy a course, you get lifetime access to all learning materials, recorded lessons, and resources. You can also join live batches for interactive sessions with expert teachers.",
  },
  {
    question: "Can I access courses on mobile?",
    answer:
      "Yes, Skillora is fully responsive on all devices, and you can download our native iOS or Android mobile apps for offline learning.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Our dedicated support team is available 24/7 via live chat, email at support@skillora.com, or through our community help forum.",
  },
  {
    question: "Are the courses self-paced?",
    answer:
      "Yes, all courses are 100% self-paced. You can start anytime, learn on your own schedule, and retain lifetime access to course materials.",
  },
];

export default function FrequentlyQuestions() {
  const { locale, t } = useTranslation();
  const [openLeft, setOpenLeft] = useState<number | null>(null);
  const [openRight, setOpenRight] = useState<number | null>(null);

  const currentFaqItems: FAQItem[] =
    (translations[locale]?.home?.faq as any)?.items ||
    (translations.en.home.faq as any)?.items ||
    faqsLeft.concat(faqsRight);

  const half = Math.ceil(currentFaqItems.length / 2);
  const currentFaqsLeft = currentFaqItems.slice(0, half);
  const currentFaqsRight = currentFaqItems.slice(half);

  const toggleLeft = (index: number) => {
    setOpenLeft(openLeft === index ? null : index);
  };

  const toggleRight = (index: number) => {
    setOpenRight(openRight === index ? null : index);
  };

  return (
    <section className="py-20 px-6 sm:px-8 lg:px-16 xl:px-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#4F46E5] uppercase mb-2">
              <span className="text-sm">✦</span> {t("home.faq.badge")}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {t("home.faq.title")}
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-xl">
              {t("home.faq.subtitle")}
            </p>
          </div>
        </div>

        {/* 2-Column FAQ Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* Left Column */}
          <div className="flex flex-col gap-3.5">
            {currentFaqsLeft.map((faq, idx) => {
              const isOpen = openLeft === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-xl transition-all duration-200 bg-white ${
                    isOpen
                      ? "border-[#4F46E5]/40 shadow-[0_4px_16px_rgba(79,70,229,0.06)]"
                      : "border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300"
                  }`}
                >
                  <button
                    onClick={() => toggleLeft(idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer gap-4"
                  >
                    <span className="text-sm sm:text-[15px] font-semibold text-[#0F172A]">
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                        isOpen
                          ? "bg-[#EEF2FF] text-[#4F46E5]"
                          : "text-slate-400 bg-slate-50"
                      }`}
                    >
                      {isOpen ? <MinusOutlined /> : <PlusOutlined />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-3.5">
            {currentFaqsRight.map((faq, idx) => {
              const isOpen = openRight === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-xl transition-all duration-200 bg-white ${
                    isOpen
                      ? "border-[#4F46E5]/40 shadow-[0_4px_16px_rgba(79,70,229,0.06)]"
                      : "border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300"
                  }`}
                >
                  <button
                    onClick={() => toggleRight(idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer gap-4"
                  >
                    <span className="text-sm sm:text-[15px] font-semibold text-[#0F172A]">
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                        isOpen
                          ? "bg-[#EEF2FF] text-[#4F46E5]"
                          : "text-slate-400 bg-slate-50"
                      }`}
                    >
                      {isOpen ? <MinusOutlined /> : <PlusOutlined />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
