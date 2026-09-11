"use client";

import React, { useState } from "react";
import {
  UserOutlined,
  LockOutlined,
  BellOutlined,
} from "@ant-design/icons";

import SettingsLayout, { SettingsTabItem } from "@/components/settings/SettingsLayout";
import Profile from "@/modules/userSetting/Profile";
import NotificationSettings from "@/modules/userSetting/NotificationSettings";
import ChangePasswordSettings from "@/modules/userSetting/ChangePasswordSettings";

const TEACHER_SETTINGS_TABS: SettingsTabItem[] = [
  {
    key: "profile",
    label: "My Profile",
    description: "Account details & preferences",
    icon: <UserOutlined />,
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
    description: "Email & assignment alerts",
    icon: <BellOutlined />,
  },
];

export default function TeacherSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <SettingsLayout
      role="teacher"
      tabs={TEACHER_SETTINGS_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "profile" && <Profile />}
      {activeTab === "security" && <ChangePasswordSettings />}
      {activeTab === "notifications" && <NotificationSettings />}
    </SettingsLayout>
  );
}
