"use client";

import React, { useState } from "react";
import {
  UserOutlined,
  BellOutlined,
  BookOutlined,
} from "@ant-design/icons";

import SettingsLayout, { SettingsTabItem } from "@/components/settings/SettingsLayout";
import Profile from "@/modules/userSetting/Profile";
import NotificationSettings from "@/modules/userSetting/NotificationSettings";
import Membership from "@/modules/userSetting/Membership";

const STUDENT_SETTINGS_TABS: SettingsTabItem[] = [
  {
    key: "profile",
    label: "My Profile",
    description: "Personal details & security",
    icon: <UserOutlined />,
  },
  {
    key: "notifications",
    label: "Notification Settings",
    description: "Class & homework alerts",
    icon: <BellOutlined />,
  },
  {
    key: "membership",
    label: "Membership & Courses",
    description: "Enrolled courses & invoices",
    icon: <BookOutlined />,
  },
];

export default function StudentSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <SettingsLayout
      role="student"
      tabs={STUDENT_SETTINGS_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "profile" && <Profile />}
      {activeTab === "notifications" && <NotificationSettings />}
      {activeTab === "membership" && <Membership />}
    </SettingsLayout>
  );
}
