"use client";
import CommonLink from "@/components/CommonLink";
import Membership from "@/modules/userSetting/Membership";
import NotificationSettings from "@/modules/userSetting/NotificationSettings";
import Profile from "@/modules/userSetting/Profile";
import { SettingProfileTabEnum } from "@/utils/enums";
import { BellIcon, CrownIcon, ProfileIcon } from "@/utils/icons";
import { EditOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Image, Upload, Spin } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateUser } from "@/redux/slices/UserDataSlice";
import { updateUserProfileApi } from "@/services/collections";
import { toast } from "@/utils/toast";

const MySetting = () => {
  const [activeTab, setActiveTab] = useState<string>(
    SettingProfileTabEnum.PROFILE
  );
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.userdata);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("firstName", userData?.first_name || userData?.full_name?.split(" ")[0] || "");
      formData.append("lastName", userData?.last_name || userData?.full_name?.split(" ").slice(1).join(" ") || "");

      const res = await updateUserProfileApi(formData);
      if (res?.status) {
        dispatch(updateUser(res.data));
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(res?.message || "Failed to update profile picture");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while uploading profile picture");
    } finally {
      setUploading(false);
    }
  };

  const currentProfileImg = userData?.profile_img ?? 
    "https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740";

  const menuItems = [
    {
      key: SettingProfileTabEnum.PROFILE,
      icon: <ProfileIcon />,
      label: "My Profile",
    },
    {
      key: SettingProfileTabEnum.NOTIFICATIONS,
      icon: <BellIcon />,
      label: "Notification Settings",
    },
    {
      key: SettingProfileTabEnum.MEMBERSHIP,
      icon: <CrownIcon />,
      label: "Membership & Courses",
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        Settings
      </h1>

      <div className="w-full flex-col lg:flex-row flex gap-6">
        <div className="lg:w-[280px] shrink-0 h-fit bg-white rounded-[10px] border border-[var(--border)] shadow-xs p-6">
          <div className="w-full text-center flex flex-col gap-5">
            <div className="flex flex-col gap-3 items-center justify-center">
              <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--border)] shadow-2xs">
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-full">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: "#fff" }} spin />} />
                  </div>
                )}
                <Image
                  width={128}
                  height={128}
                  src={currentProfileImg}
                  alt="Profile"
                  preview={false}
                  className="rounded-full object-cover w-32 h-32"
                />
              </div>

              <Upload
                showUploadList={false}
                maxCount={1}
                accept="image/*"
                beforeUpload={(file) => {
                  handleUpload(file);
                  return false;
                }}
              >
                <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 mt-1">
                  <span className="text-xs font-semibold text-[var(--primary)] hover:underline">
                    Change Photo
                  </span>
                  <EditOutlined className="!text-[var(--primary)] text-xs" />
                </div>
              </Upload>
            </div>

            <div className="border-t border-[var(--border)] w-full" />

            <div className="flex lg:flex-col gap-1.5 overflow-auto scrollbar-hide">
              {menuItems.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <Button
                    key={item.key}
                    type="text"
                    icon={item.icon}
                    className={`w-full !h-10 !px-3.5 !flex !justify-start !text-sm !items-center !rounded-[8px] transition-all duration-150 ${
                      isActive
                        ? "!bg-[var(--primary)] !text-white font-semibold shadow-xs"
                        : "!text-[var(--text-secondary)] hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-subtle)] font-medium"
                    }`}
                    onClick={() => setActiveTab(item.key)}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 h-fit rounded-[10px] bg-white border border-[var(--border)] shadow-xs p-6">
          {SettingProfileTabEnum?.PROFILE === activeTab && <Profile />}
          {SettingProfileTabEnum?.NOTIFICATIONS === activeTab && (
            <NotificationSettings />
          )}
          {SettingProfileTabEnum?.MEMBERSHIP === activeTab && <Membership />}
        </div>
      </div>
    </div>
  );
};

export default MySetting;
