"use client";

import React, { useEffect, useState } from "react";
import { Form } from "antd";
import Cookies from "js-cookie";
import CommonButton from "@/components/CommonButton";
import Image from "next/image";
import { toast } from "@/utils/toast";
import {
  onboardingStep1,
  onboardingStep2,
  onboardingStep3,
} from "@/services/collections";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/redux/slices/UserDataSlice";
import { RootState } from "@/redux/store";
import { educationOptions, goalOptions, categories as fallbackCategories } from "@/utils/constant";
import { OnboardingFormValues } from "@/utils/interface";
import useCategories from "@/hooks/useCategories";
import { useRouter } from "next/navigation";
import { RoutePaths } from "@/utils/enums";
import {
  CheckCircleFilled,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CompassOutlined,
  BookOutlined,
  ReadOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const goalDescriptions: Record<string, string> = {
  "Start my career": "Land your first job and build a verified portfolio",
  "Change my career": "Pivot into high-growth fields with in-demand skills",
  "Grow in my current role": "Earn promotions and master advanced tools & leadership",
  "Explore topics outside of work": "Pursue creative passions, hobbies, and new interests",
};

const OnboardingForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm<OnboardingFormValues>();
  const [step, setStep] = useState<number>(0);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const userData = useSelector((state: RootState) => state?.userdata);
  const { data: categoriesData } = useCategories();
  const availableTopics =
    categoriesData && categoriesData.length > 0 ? categoriesData : fallbackCategories;
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const onBoardingStep = Cookies.get("user_onboarding");

  const userName =
    userData?.first_name ||
    (userData?.full_name ? userData.full_name.split(" ")[0] : "Learner");

  const handleGoalSelect = (goalText: string) => {
    setSelectedGoal(goalText);
    form.setFieldsValue({ goal: goalText });
  };

  const handleEducationSelect = (edu: string) => {
    const newValue = selectedEducation === edu ? undefined : edu;
    setSelectedEducation(newValue);
    form.setFieldsValue({ education: newValue });
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedTopics((prev) => {
      const updated = prev.includes(categoryName)
        ? prev.filter((topic) => topic !== categoryName)
        : [...prev, categoryName];
      form.setFieldsValue({ topics: updated });
      return updated;
    });
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      const value = form.getFieldsValue(true);

      setLoading(true);

      const effectiveUserId =
        userData?.user_id ||
        (() => {
          const t = Cookies.get("token");
          if (!t) return null;
          try {
            const p = JSON.parse(atob(t.split(".")[1]));
            return p?.sub || p?.user_id || p?.userId || null;
          } catch {
            return null;
          }
        })();

      if (step === 0 && effectiveUserId) {
        const response = await onboardingStep1({
          user_id: effectiveUserId,
          career: value.goal,
        });
        if (response?.status) {
          dispatch(updateUser({ career: value.goal }));
          Cookies.set("user_onboarding", "2", { path: "/" });
        }
      } else if (step === 1 && effectiveUserId) {
        const response = await onboardingStep2({
          user_id: effectiveUserId,
          topic: value.topics,
        });
        if (response?.status) {
          dispatch(updateUser({ topics: value.topics }));
          Cookies.set("user_onboarding", "3", { path: "/" });
        }
      } else if (step === 2) {
        if (effectiveUserId) {
          try {
            const response = await onboardingStep3({
              user_id: effectiveUserId,
              education_level: value.education,
            });
            if (response?.status) {
              dispatch(updateUser({ education_level: value.education }));
            }
          } catch (apiErr) {
            console.warn("Onboarding step 3 API warning:", apiErr);
          }
        }
        Cookies.set("user_onboarding", "completed", { path: "/" });
        toast.success("Profile setup complete! Welcome to Skillora.");
        window.location.href = RoutePaths?.Dashboard || "/dashboard";
        return;
      }

      setStep((prev) => prev + 1);
    } catch (error: any) {
      console.warn("Validation failed or submission error:", error);
      const msg = error?.errorFields?.[0]?.errors?.[0] || error?.message;
      if (msg) {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  useEffect(() => {
    if (!userData) return;
    const { career, topics, education_level } = userData;

    form.setFieldsValue({
      goal: career,
      topics,
      education: education_level,
    });

    if (career) setSelectedGoal(career);
    if (topics) setSelectedTopics(topics);
    if (education_level) setSelectedEducation(education_level);

    if (onBoardingStep !== undefined && onBoardingStep !== "undefined") {
      const stepNum = Number(onBoardingStep) - 1;
      if (!isNaN(stepNum) && stepNum >= 0 && stepNum <= 2) {
        setStep(stepNum);
      }
    }
  }, [form, onBoardingStep, userData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("step");
      if (s !== null) {
        const parsed = Number(s);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 2) {
          setStep(parsed);
        }
      }
    }
  }, []);

  const stepTitles = [
    { title: "Career Goals", desc: "Your primary learning objective", icon: <CompassOutlined /> },
    { title: "Learning Topics", desc: "Skills & domains you want to explore", icon: <BookOutlined /> },
    { title: "Education Level", desc: "Background for course matching", icon: <ReadOutlined /> },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-72px)] bg-[#F1F5F9] relative overflow-hidden py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Ambient background glows for depth */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07)] p-6 sm:p-10 flex flex-col gap-6 relative z-10">
        {/* Stepper Header */}
        <div className="flex flex-col gap-3.5 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3B66FF] bg-[#EEF2FF] px-3 py-1 rounded-full border border-[#3B66FF]/20">
                Step {step + 1} of 3 · {stepTitles[step].title}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {Math.round(((step + 1) / 3) * 100)}% Complete
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-2 rounded-full overflow-hidden bg-slate-100 border border-slate-200/60"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    step >= idx
                      ? "bg-gradient-to-r from-[#3B66FF] to-[#264DE4]"
                      : "bg-transparent"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <Form form={form} layout="vertical" className="w-full">
          {/* STEP 0: Career Goal */}
          {step === 0 && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div className="text-center max-w-xl mx-auto flex flex-col gap-1.5">
                <div className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#3B66FF] mb-1">
                  <span>⚡</span>
                  <span>Personalized Learning Experience</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome, {userName}! What&apos;s your goal?
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tell us what you want to achieve so we can tailor course recommendations, learning paths, and certificates for you.
                </p>
              </div>

              <Form.Item
                name="goal"
                rules={[{ required: true, message: "Please select a goal to proceed" }]}
                className="!mb-0"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  {goalOptions.map((option) => {
                    const isSelected = selectedGoal === option.text;
                    return (
                      <div
                        key={option.text}
                        onClick={() => handleGoalSelect(option.text)}
                        className={`group relative flex flex-col rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 bg-white ${
                          isSelected
                            ? "border-[#3B66FF] bg-[#EEF4FF]/40 shadow-md ring-2 ring-[#3B66FF]/20 scale-[1.01]"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
                        }`}
                      >
                        {/* Checkmark Badge */}
                        <div
                          className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#3B66FF] text-white text-xs shadow-xs"
                              : "border border-slate-300 bg-white opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {isSelected ? <CheckOutlined /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                        </div>

                        <div className="w-full h-[130px] relative rounded-xl overflow-hidden bg-slate-100 mb-3">
                          <Image
                            src={option.image}
                            alt={option.text}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <h3 className="font-bold text-slate-900 text-[15px] leading-snug">
                          {option.text}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {goalDescriptions[option.text] || "Advance your learning path with certified courses."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Form.Item>
            </div>
          )}

          {/* STEP 1: Topics of Interest */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div className="text-center max-w-xl mx-auto flex flex-col gap-1.5">
                <div className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#3B66FF] mb-1">
                  <span>✦</span>
                  <span>Curated Course Catalog</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  What topics would you like to explore?
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Select at least one subject. We&apos;ll curate top-rated courses and projects matching these topics.
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {selectedTopics.length} topic{selectedTopics.length === 1 ? "" : "s"} selected
                  </span>
                </div>
              </div>

              <Form.Item
                name="topics"
                rules={[
                  {
                    required: true,
                    type: "array",
                    min: 1,
                    message: "Please select at least one topic to continue",
                  },
                ]}
                className="!mb-0"
              >
                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto pt-1">
                  {availableTopics?.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.category_name);
                    return (
                      <button
                        key={topic.category_id}
                        type="button"
                        onClick={() => handleCategoryToggle(topic.category_name)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#3B66FF] text-white shadow-sm ring-2 ring-[#3B66FF]/30 hover:bg-[#264DE4]"
                            : "bg-white border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 shadow-xs"
                        }`}
                      >
                        {isSelected && <CheckOutlined className="text-xs" />}
                        <span>{topic.category_name}</span>
                      </button>
                    );
                  })}
                </div>
              </Form.Item>
            </div>
          )}

          {/* STEP 2: Education Level */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div className="text-center max-w-xl mx-auto flex flex-col gap-1.5">
                <div className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#3B66FF] mb-1">
                  <span>🎓</span>
                  <span>Academic Alignment</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  What is your highest level of education?
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This helps us match courses with appropriate prerequisites and difficulty levels.
                </p>
              </div>

              <Form.Item
                name="education"
                rules={[{ required: true, message: "Please select your education level" }]}
                className="!mb-0"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto pt-1">
                  {educationOptions.map((edu) => {
                    const isSelected = selectedEducation === edu;
                    return (
                      <div
                        key={edu}
                        onClick={() => handleEducationSelect(edu)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "border-[#3B66FF] bg-[#EEF4FF]/50 text-slate-900 font-semibold ring-2 ring-[#3B66FF]/20 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 pr-2">
                          <ReadOutlined className={`text-base ${isSelected ? "text-[#3B66FF]" : "text-slate-400"}`} />
                          <span className="text-sm">{edu}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-[#3B66FF] bg-[#3B66FF] text-white text-[10px]"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <CheckOutlined />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Form.Item>
            </div>
          )}
        </Form>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-1">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeftOutlined />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#3B66FF] to-[#264DE4] hover:from-[#315CFF] hover:to-[#1D4ED8] text-white font-bold text-sm shadow-[0_2px_8px_rgba(49,92,255,0.25)] hover:shadow-[0_4px_14px_rgba(49,92,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <LoadingOutlined spin />}
              <span>{step === 2 ? "Complete Setup & Browse Courses" : "Continue"}</span>
              {step < 2 && <ArrowRightOutlined />}
            </button>
          </div>
        </div>

        {/* Footer Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100/80">
          <span className="flex items-center gap-1.5">
            <CheckCircleFilled className="text-emerald-500" />
            <span>16,500+ Verified Courses</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircleFilled className="text-emerald-500" />
            <span>Direct Lifetime Access</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircleFilled className="text-emerald-500" />
            <span>Top University & Industry Instructors</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
