"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Image, Upload, Spin } from "antd";
import { EditOutlined, LoadingOutlined } from "@ant-design/icons";
import { toast } from "@/utils/toast";

import { RootState } from "@/redux/store";
import { updateUser } from "@/redux/slices/UserDataSlice";
import { updateUserProfileApi } from "@/services/collections";
import CommonLink from "@/components/CommonLink";
import NotificationSettings from "@/modules/userSetting/NotificationSettings";
import OrganisationProfile from "@/modules/userSetting/OrganisationProfile";
import Profile from "@/modules/userSetting/Profile";
import OrganisationPayments from "@/modules/userSetting/OrganisationPayments";
import { InstructorSettingEnum } from "@/utils/enums";
import { BellIcon, OrganisationIcon, ProfileIcon } from "@/utils/icons";
import { DollarCircleOutlined } from "@ant-design/icons";

const Settings = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.userdata);
  
  const [activeTab, setActiveTab] = useState<string>(
    InstructorSettingEnum.PROFILE
  );
  const [uploading, setUploading] = useState(false);

  const menuItems = [
    {
      key: InstructorSettingEnum.PROFILE,
      icon: <ProfileIcon />,
      label: "My Profile",
    },
    {
      key: InstructorSettingEnum.ORGANISATION,
      icon: <OrganisationIcon />,
      label: "Organisation Profile",
    },
    {
      key: InstructorSettingEnum.PAYMENTS,
      icon: <DollarCircleOutlined className="text-lg" />,
      label: "Payments & Stripe Connect",
    },
    {
      key: InstructorSettingEnum.NOTIFICATIONS,
      icon: <BellIcon />,
      label: "Notification Settings",
    },
  ];

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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[32px] font-[700] text-[#0E0E0E]">Settings</h1>

      <div className="w-full flex flex-col lg:flex-row gap-3">
        <div className="lg:w-[25%] h-fit bg-white rounded-[16px] p-6 shadow-sm">
          <div className="w-full text-center flex flex-col gap-5">
            <div className="flex flex-col gap-3 items-center justify-center relative">
              <div className="relative group w-[180px] h-[180px] rounded-full overflow-hidden border-2 border-gray-150">
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-full">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: "#fff" }} spin />} />
                  </div>
                )}
                <Image
                  width={"180px"}
                  height={"180px"}
                  src={currentProfileImg}
                  alt="Profile"
                  preview={false}
                  className="rounded-full object-cover w-[180px] h-[180px]"
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
                <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 mt-2">
                  <CommonLink
                    className="!plus-jakarta-sans !text-[16px] font-[500]"
                    text={"Edit Profile Picture"}
                  />{" "}
                  <EditOutlined className="!text-secondary cursor-pointer" />
                </div>
              </Upload>
            </div>

            <div className="border-t border-[#D8D8D8] w-full" />

            <div className="flex flex-row lg:flex-col gap-2">
              {menuItems.map((item) => (
                <Button
                  key={item.key}
                  type="text"
                  icon={item.icon}
                  className={`w-full !p-5 !flex !justify-start !text-[14px] !font-[500] !items-center !rounded-[8px] transition-colors ${
                    activeTab === item.key
                      ? "!bg-primary text-black"
                      : "text-[#002333] hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(item.key)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:w-[75%] h-fit bg-white rounded-[16px] shadow-sm">
          {InstructorSettingEnum?.PROFILE === activeTab && <Profile />}
          {InstructorSettingEnum?.NOTIFICATIONS === activeTab && (
            <NotificationSettings />
          )}
          {InstructorSettingEnum?.ORGANISATION === activeTab && (
            <OrganisationProfile />
          )}
          {InstructorSettingEnum?.PAYMENTS === activeTab && (
            <OrganisationPayments />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
