"use client";

import React, { useState } from "react";
import {
  UserOutlined,
  BankOutlined,
  DollarCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";

import SettingsLayout, { SettingsTabItem } from "@/components/settings/SettingsLayout";
import Profile from "@/modules/userSetting/Profile";
import OrganisationProfile from "@/modules/userSetting/OrganisationProfile";
import NotificationSettings from "@/modules/userSetting/NotificationSettings";
import InstructorEarningsView from "@/components/earnings/InstructorEarningsView";

const INSTRUCTOR_SETTINGS_TABS: SettingsTabItem[] = [
  {
    key: "profile",
    label: "My Profile",
    description: "Account credentials & details",
    icon: <UserOutlined />,
  },
  {
    key: "organisation",
    label: "Organization Profile",
    description: "Brand logo & institutional info",
    icon: <BankOutlined />,
  },
  {
    key: "earnings",
    label: "Earnings & Stripe Connect",
    description: "Sales revenue & payouts",
    icon: <DollarCircleOutlined />,
  },
  {
    key: "notifications",
    label: "Notification Settings",
    description: "Email & learning broadcast preferences",
    icon: <BellOutlined />,
  },
];

export default function InstructorSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <SettingsLayout
      role="instructor"
      tabs={INSTRUCTOR_SETTINGS_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "profile" && <Profile />}
      {activeTab === "organisation" && <OrganisationProfile />}
      {activeTab === "earnings" && <InstructorEarningsView />}
      {activeTab === "notifications" && <NotificationSettings />}
    </SettingsLayout>
  );
}
