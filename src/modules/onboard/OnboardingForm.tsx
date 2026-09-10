"use client";
import React, { useEffect, useState } from "react";
import { Form, Radio } from "antd";
import Cookies from "js-cookie";
import CommonButton from "@/components/CommonButton";
import Image from "next/image";
import { toast } from "@/utils/toast";
import {
  onboardingStep1,
  onboardingStep2,
  onboardingStep3,
} from "@/services/collections";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { educationOptions, goalOptions } from "@/utils/constant";
import { OnboardingFormValues } from "@/utils/interface";
import useCategories from "@/hooks/useCategories";

const OnboardingForm: React.FC<{ setSubscription: () => void }> = ({
  setSubscription,
}) => {
  const [form] = Form.useForm<OnboardingFormValues>();
  const [step, setStep] = useState<number>(0);
  const [selected, setSelected] = useState<string>("");
  const userData = useSelector((state: RootState) => state?.userdata);
  const { data } = useCategories();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<
    string | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const onBoardingStep = Cookies.get("user_onboarding");

  const handleSelect = (edu: string) => {
    const newValue = selectedEducation === edu ? undefined : edu;
    setSelectedEducation(newValue);
    form.setFieldsValue({ education: newValue });
  };

  const handleCategory = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((topic) => topic !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    try {
      await form.validateFields();

      const value = form.getFieldsValue(true);

      setLoading(true);

      if (step === 0 && userData?.user_id) {
        const response = await onboardingStep1({
          user_id: userData.user_id,
          career: value.goal,
        });
        if (response?.status) {
          Cookies.set("user_onboarding", "2");
        }
      } else if (step === 1 && userData?.user_id) {
        const response = await onboardingStep2({
          user_id: userData.user_id,
          topic: value.topics,
        });
        if (response?.status) {
          Cookies.set("user_onboarding", "3");
        }
      } else if (step === 2 && userData?.user_id) {
        const response = await onboardingStep3({
          user_id: userData.user_id,
          education_level: value.education,
        });
        if (response?.status) {
          Cookies.set("user_onboarding", "undefined");
        }
      }

      if (step === 2) {
        toast.success("Form submitted successfully!");
        setSubscription();
      } else {
        setStep((prev) => prev + 1);
      }
    } catch (error) {
      console.warn("Validation failed:", error);
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

    setSelected(career);
    setSelectedTopics(topics || []);
    setSelectedEducation(education_level);
    if (onBoardingStep !== undefined) {
      setStep(Number(onBoardingStep) - 1);
    }
  }, [form,onBoardingStep,userData]);

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[calc(100vh_-_82px)] py-[40px] px-[40px] xl:px-[239px]">
      <div className="w-full flex gap-[5px] justify-between mb-6">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-full h-[4px] bg-[#D8D8D8] rounded-full overflow-hidden"
          >
            <div
              className={`
          h-full
          rounded-full
          transition-all duration-500 ease-in-out
          ${step >= index ? "bg-secondary" : "bg-transparent"}
        `}
              style={{
                width: step > index ? "100%" : step === index ? "100%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <Form form={form} layout="vertical">
        {step === 0 && (
          <div className="text-center flex flex-col gap-[32px]">
            <div className="flex flex-col gap-4">
              <h1 className="text-[32px] font-[700] leading-[120%]">
                Hello Tanya Hill! What’s your goal?
              </h1>
              <div className="text-[20px] text-[#6B6B6B] font-[400] leading-[120%]">
                Tell me a little about yourself so I can make the best <br />
                recommendations. First, what&apos;s your goal?
              </div>
            </div>
            <Form.Item
              name="goal"
              rules={[{ required: true, message: "Please select a goal" }]}
            >
              <Radio.Group
                className="!grid !grid-cols-4 !gap-[16px] "
                onChange={(e) => setSelected(e.target.value)}
              >
                {goalOptions.map((option) => (
                  <Radio.Button
                    prefixCls="custom-radio"
                    key={option?.text}
                    value={option?.text}
                    className={`!rounded-[15px] !h-[276px] !p-[16px] !border-2 ${
                      selected === option?.text
                        ? "!border-secondary"
                        : "!border-[#B9B9B9]"
                    }`}
                  >
                    <div className="flex flex-col gap-[16px]">
                      <Image
                        alt={option?.text}
                        className="!w-full !h-[180px] rounded-[12px]"
                        src={option?.image}
                      />
                      <div className="text-black text-[16px] font-[400] leading-[150%]">
                        {option?.text}
                      </div>
                    </div>
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </div>
        )}

        {step === 1 && (
          <div className="text-center flex flex-col gap-[32px]">
            <div className="flex flex-col gap-4">
              <h1 className="text-[32px] font-[700] leading-[120%]">
                Great! Select the topic of learning
              </h1>
              <div className="text-[20px] text-[#6B6B6B] font-[400] leading-[120%]">
                Select the topics you&apos;re interested in pursuing for your career
                <br />
                and explore new things to learn.
              </div>
            </div>
            <Form.Item
              name="topics"
              rules={[
                {
                  required: true,
                  type: "array",
                  min: 1,
                  message: "Please select at least one topic",
                },
              ]}
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                {data?.map((topic) => (
                  <button
                    key={topic.category_id}
                    type="button"
                    onClick={() => {
                      handleCategory(topic.category_name);
                      const updatedTopics = selectedTopics.includes(
                        topic.category_name
                      )
                        ? selectedTopics.filter(
                            (id) => id !== topic.category_name
                          )
                        : [...selectedTopics, topic.category_name];
                      form.setFieldsValue({ topics: updatedTopics });
                    }}
                    className={`px-[24px] h-[40px] cursor-pointer rounded-[24px] transition-all duration-300 ease-in-out border ${
                      selectedTopics.includes(topic.category_name)
                        ? "bg-secondary text-white"
                        : "border-gray-600 hover:bg-gray-200 hover:!text-black"
                    }`}
                  >
                    {topic.category_name}
                  </button>
                ))}
              </div>
            </Form.Item>
          </div>
        )}

        {step === 2 && (
          <div className="text-center flex flex-col gap-[32px]">
            <h1 className="text-[32px] font-[700] leading-[120%]">
              Got it! What&apos;s your highest level of education?
            </h1>
            <Form.Item
              name="education"
              rules={[
                {
                  required: true,
                  message: "Please select your education level",
                },
              ]}
            >
              <div className="grid grid-cols-1 gap-3">
                {educationOptions.map((edu) => (
                  <button
                    key={edu}
                    onClick={() => handleSelect(edu)}
                    className={`px-6 py-3 h-[48px] border cursor-pointer rounded-[24px] text-left transition-all duration-300 ${
                      selectedEducation === edu
                        ? "bg-secondary text-white"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {edu}
                  </button>
                ))}
              </div>
            </Form.Item>
          </div>
        )}
      </Form>
      <div className="flex items-center gap-3 justify-center">
        {step > 0 ? (
          <CommonButton
            text={"Back"}
            onClick={handleBack}
            className="h-10 w-[150px] !bg-transparent border"
          />
        ) : (
          <span />
        )}

        <CommonButton
          text={step === 2 ? "Finish" : "Next"}
          onClick={handleNext}
          loading={loading}
          className="h-10 w-[150px] border-none"
        />
      </div>
    </div>
  );
};

export default OnboardingForm;
