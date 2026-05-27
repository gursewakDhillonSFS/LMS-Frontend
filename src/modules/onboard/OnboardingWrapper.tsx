"use client";
import React, { useState } from "react";
import OnboardingForm from "./OnboardingForm";
import OnBoardingHeader from "./OnBoardingHeader";
import OnboardingSubscription from "./OnboardingSubscription";

const OnboardingWrapper = () => {
  // const onBoardingStep = Cookies.get("user_onboarding");
  // const subscription_status = Cookies.get("subscription_status");
  const [subscription, setSubscription] = useState(false);

  // useEffect(() => {
  //   if (onBoardingStep === "undefined" && subscription_status === "false") {
  //     setSubscription(true);
  //   }
  // }, []);
  return (
    <div>
      <OnBoardingHeader />
      {subscription ? (
        <OnboardingSubscription />
      ) : (
        <OnboardingForm setSubscription={() => setSubscription(true)} />
      )}
    </div>
  );
};

export default OnboardingWrapper;
