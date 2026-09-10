"use client";

import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import OnboardingSubscription from "@/modules/onboard/OnboardingSubscription";
import { Breadcrumb } from "antd";
import Link from "next/link";
import React from "react";

const SubscriptionWrapper = () => {
  const items = [
    {
      title: <Link href="/" className="text-slate-600 hover:text-indigo-600 font-medium">Home</Link>,
    },
    {
      title: <span className="text-slate-900 font-semibold">Skillora Pro</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb
          separator={<span className="text-slate-400 font-bold">/</span>}
          items={items}
          itemRender={(item) => <BreadcrumbItemRender item={item} />}
          className="mb-8"
        />
        <div className="pb-16">
          <OnboardingSubscription isHome={true} />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionWrapper;
