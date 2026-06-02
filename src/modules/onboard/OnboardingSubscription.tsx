"use client";
import CommonButton from "@/components/CommonButton";
import { RootState } from "@/redux/store";
import { onboardingSubscription } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { CheckIcon, HeaderLogoIcon } from "@/utils/icons";
import { Switch } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSelector } from "react-redux";

interface OnboardingSubscriptionProp {
  isExplore?: boolean;
  isHome?: boolean;
}

const OnboardingSubscription: React.FC<OnboardingSubscriptionProp> = ({
  isExplore = false,
  isHome = false,
}) => {
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [trial, setTrail] = useState(true);
  const user_id = useSelector((state: RootState) => state?.userdata?.user_id);
  const router = useRouter();

  const onFinish = async () => {
    try {
      setLoading(true);
      if (user_id) {
        const response = await onboardingSubscription({
          user_id,
          plan_type: checked ? "annually" : "monthly",
          is_trial: trial,
        });
        if (response?.status) {
          // Cookies.set("subscription_status", "undefined");
          router.push(RoutePaths?.Dashboard);
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className={`w-full flex flex-col items-center justify-between gap-16 ${
        isExplore ? "" : "py-[40px] xl:px-[239px]"
      }`}
    >
      <div className="flex flex-col gap-[40px]">
        <div className="w-full flex flex-col gap-[11px] items-center justify-center">
          <div className="flex items-center justify-center gap-[9px]">
            <HeaderLogoIcon />{" "}
            <span className="py-1 px-2 bg-secondary text-white font-bold">
              Pro
            </span>
          </div>
          {(!isExplore || isHome) && (
            <div className="text-center text-[24px] text-[#0E0E0E] font-[500] leading-[120%]">
              Advance your career with world-class courses <br /> and
              certificate programs
            </div>
          )}
        </div>
        <div className="flex flex-col gap-[32px] max-w-[786px]">
          <div className="flex justify-center items-center gap-[15px]">
            <span
              className={`text-black font-[500] text-[18px] leading-[120%]`}
            >
              Monthly
            </span>
            <Switch
              checked={checked}
              onChange={setChecked}
              className="bg-gray-300"
            />
            <span
              className={`text-black font-[500] text-[18px] leading-[120%]`}
            >
              Annually
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 border border-[#EFF0F6] rounded-[20px] shadow-[0px 2px 12px rgba(20, 20, 43, 0.08)]">
            <div className="p-12 flex flex-col gap-[18px] bg-white rounded-l-[20px]">
              <div className="flex flex-col gap-[42px]">
                <div className="flex flex-col gap-[6px]">
                  <h2 className="text-[24px] font-[700] leading-[120%]">
                    Annually
                  </h2>
                  <span className="text-[16px] leading-[150%] text-[#9A9A9A]">
                    Show social proof notifications to increase leads and sales.
                  </span>
                </div>
                <h1 className="text-4xl font-bold">
                  $99<span className="text-base font-normal">/year</span>
                </h1>
              </div>
              <CommonButton
                text={
                  isExplore
                    ? "Buy Subscription"
                    : isHome
                    ? "Start 7-day free trial"
                    : "Select"
                }
                onClick={() => {
                  setTrail(false);
                  onFinish();
                }}
                className="!text-secondary border !bg-transparent border-secondary hover:opacity-60"
              />
            </div>

            <div className="bg-[#F7F7FC] flex flex-col p-12 gap-[20px] rounded-r-[20px]">
              <h3 className="font-[700] text-[18px]">What’s included</h3>
              <ul className="flex flex-col gap-[16px] text-[16px] leading-[150%]">
                <li className="flex items-center gap-[14px]">
                  <div className="w-[26px] rounded-full h-[26px] bg-secondary">
                    <CheckIcon color="white" />
                  </div>{" "}
                  Unlimited access to 10,000+ courses, projects, and certificate
                  programs
                </li>
                <li className="flex items-center gap-[14px]">
                  <div className="w-[26px] rounded-full h-[26px] bg-secondary">
                    <CheckIcon color="white" />
                  </div>{" "}
                  Premium Gen A1 content and features
                </li>
                <li className="flex items-center gap-[14px]">
                  <div className="w-[26px] rounded-full h-[26px] bg-secondary">
                    <CheckIcon color="white" />
                  </div>{" "}
                  Free for 7 days, then $99/year. Cancel anytime.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {!isExplore && !isHome && (
        <div className="flex items-center gap-3 justify-center">
          <CommonButton
            text={"No thanks"}
            onClick={() => router.push(RoutePaths?.Dashboard)}
            className="h-10 w-[150px] !bg-transparent border"
          />

          <CommonButton
            loading={loading}
            onClick={onFinish}
            text={"Start 7-day free trial"}
            className="h-10 w-[200px] border-none"
          />
        </div>
      )}
    </div>
  );
};

export default OnboardingSubscription;
