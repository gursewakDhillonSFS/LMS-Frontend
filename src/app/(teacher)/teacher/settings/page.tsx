"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserOutlined,
  DollarCircleOutlined,
  BellOutlined,
  ArrowRightOutlined,
  BankOutlined,
} from "@ant-design/icons";

import SettingsLayout, { SettingsTabItem } from "@/components/settings/SettingsLayout";
import Profile from "@/modules/userSetting/Profile";
import NotificationSettings from "@/modules/userSetting/NotificationSettings";

const TEACHER_SETTINGS_TABS: SettingsTabItem[] = [
  {
    key: "profile",
    label: "My Profile",
    description: "Account credentials & details",
    icon: <UserOutlined />,
  },
  {
    key: "notifications",
    label: "Notification Settings",
    description: "Email & assignment alerts",
    icon: <BellOutlined />,
  },
  {
    key: "earnings",
    label: "Earnings & Payouts",
    description: "Manage bank account & payout receipts",
    icon: <DollarCircleOutlined />,
  },
];

export default function TeacherSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <SettingsLayout
      role="teacher"
      tabs={TEACHER_SETTINGS_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "profile" && <Profile />}
      {activeTab === "notifications" && <NotificationSettings />}
      {activeTab === "earnings" && (
        <div className="space-y-6">
          <div className="pb-3 border-b border-[#F2F4F7]">
            <h3 className="text-lg font-bold text-[#101828]">Teaching Earnings & Payouts</h3>
            <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
              Manage your direct Stripe payout account and view batch revenue shares.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#315CFF]/10 text-[#315CFF] flex items-center justify-center text-xl shrink-0">
                <BankOutlined />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#101828]">
                  Dedicated Teaching Earnings Dashboard
                </h4>
                <p className="text-xs sm:text-sm text-[#667085] max-w-lg">
                  Access your full revenue reports, bank transfer history, and Stripe Express account settings in the dedicated Earnings portal.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/teacher/earnings")}
              className="px-5 py-2.5 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-sm font-semibold flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
            >
              <span>Go to Earnings</span>
              <ArrowRightOutlined className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
