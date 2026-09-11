"use client";

import React, { useState } from "react";
import {
  UserOutlined,
  BankOutlined,
  LockOutlined,
  BellOutlined,
} from "@ant-design/icons";

import SettingsLayout, { SettingsTabItem } from "@/components/settings/SettingsLayout";
import Profile from "@/modules/userSetting/Profile";
import OrganisationProfile from "@/modules/userSetting/OrganisationProfile";
import NotificationSettings from "@/modules/userSetting/NotificationSettings";
import ChangePasswordSettings from "@/modules/userSetting/ChangePasswordSettings";

const INSTRUCTOR_SETTINGS_TABS: SettingsTabItem[] = [
  {
    key: "profile",
    label: "My Profile",
    description: "Account details & preferences",
    icon: <UserOutlined />,
  },
  {
    key: "organisation",
    label: "Organization Profile",
    description: "Brand logo & institutional info",
    icon: <BankOutlined />,
  },
  {
    key: "security",
    label: "Change Password",
    description: "Account credentials & security",
    icon: <LockOutlined />,
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
      {activeTab === "security" && <ChangePasswordSettings />}
      {activeTab === "notifications" && <NotificationSettings />}
    </SettingsLayout>
  );
}
