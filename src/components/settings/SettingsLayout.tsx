"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  CameraOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  UserOutlined,
} from "@ant-design/icons";
import { Upload, Spin } from "antd";

import { RootState } from "@/redux/store";
import { updateUser } from "@/redux/slices/UserDataSlice";
import { updateUserProfileApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import ThemePicker from "@/components/ThemePicker";

export interface SettingsTabItem {
  key: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
}

interface SettingsLayoutProps {
  role: "instructor" | "teacher" | "student";
  tabs: SettingsTabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: React.ReactNode;
}

export default function SettingsLayout({
  role,
  tabs,
  activeTab,
  onTabChange,
  children,
}: SettingsLayoutProps) {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.userdata);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", file);
      formData.append(
        "firstName",
        userData?.first_name || userData?.full_name?.split(" ")[0] || ""
      );
      formData.append(
        "lastName",
        userData?.last_name ||
          userData?.full_name?.split(" ").slice(1).join(" ") ||
          ""
      );

      const res = await updateUserProfileApi(formData);
      if (res?.status) {
        dispatch(updateUser(res.data));
        toast.success("Profile photo updated successfully!");
      } else {
        toast.error(res?.message || "Failed to update profile photo");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while uploading profile photo");
    } finally {
      setUploading(false);
    }
  };

  const displayName =
    userData?.full_name ||
    `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() ||
    "User Profile";

  const avatarName = encodeURIComponent(displayName || "User");
  const currentProfileImg =
    userData?.profile_img ||
    `https://ui-avatars.com/api/?name=${avatarName}&background=315CFF&color=fff`;

  const roleLabel =
    role === "instructor"
      ? "Instructor & Admin"
      : role === "teacher"
      ? "Teacher"
      : "Learner / Student";

  const roleBadgeColor =
    role === "instructor"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : role === "teacher"
      ? "bg-[#315CFF]/10 text-[#315CFF] border-[#315CFF]/20"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: PROFILE CARD & NAVIGATION */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-4">
          {/* USER CARD */}
          <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs p-6 flex flex-col items-center text-center">
            {/* AVATAR WITH PHOTO UPLOAD OVERLAY */}
            <div className="relative mb-3.5 w-24 h-24 group">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#E4E7EC] shadow-sm bg-slate-100">
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 24, color: "#fff" }} spin />
                      }
                    />
                  </div>
                )}
                <Image
                  src={currentProfileImg}
                  alt={displayName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <Upload
                showUploadList={false}
                maxCount={1}
                accept="image/*"
                className="!absolute !bottom-0 !right-0 !z-30 !block !w-8 !h-8 [&_.ant-upload]:!block [&_.ant-upload]:!w-8 [&_.ant-upload]:!h-8"
                beforeUpload={(file) => {
                  handleUpload(file);
                  return false;
                }}
              >
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-primary hover:opacity-90 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer"
                  title="Upload profile picture"
                >
                  <CameraOutlined className="text-xs" />
                </button>
              </Upload>
            </div>

            {/* NAME & EMAIL */}
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-base font-bold text-[#101828] truncate">
                  {displayName}
                </h3>
                <CheckCircleFilled className="text-primary text-xs" />
              </div>
              <p className="text-xs text-[#667085] truncate max-w-[240px] mx-auto">
                {userData?.email || "user@example.com"}
              </p>
            </div>

            {/* ROLE BADGE */}
            <div className="mt-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${roleBadgeColor}`}
              >
                {roleLabel}
              </span>
            </div>
          </div>

          {/* DESKTOP TABS MENU */}
          <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs p-2.5 hidden lg:flex flex-col gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-xs font-semibold"
                      : "text-[#475467] hover:text-[#101828] hover:bg-[#F8FAFC] font-medium"
                  }`}
                >
                  <div
                    className={`text-lg shrink-0 flex items-center ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm truncate">{tab.label}</span>
                    {tab.description && (
                      <span
                        className={`block text-[11px] truncate ${
                          isActive ? "text-white/80" : "text-[#98A2B3]"
                        }`}
                      >
                        {tab.description}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* APPEARANCE THEME SELECTOR CARD */}
          <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs p-4 hidden lg:flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Appearance Theme
              </span>
            </div>
            <ThemePicker variant="header" className="w-full justify-between" />
          </div>

          {/* MOBILE TABS SCROLLER */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#315CFF] text-white shadow-xs"
                      : "bg-white text-[#475467] border border-[#E4E7EC]"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT PANEL */}
        <div className="flex-1 min-w-0 w-full">
          <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs p-5 sm:p-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
