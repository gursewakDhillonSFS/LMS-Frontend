"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import { useDispatch, useSelector } from "react-redux";
import {
  UserOutlined,
  MailOutlined,
  GlobalOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

import { toast } from "@/utils/toast";
import { RootState } from "@/redux/store";
import { updateUser } from "@/redux/slices/UserDataSlice";
import { updateUserProfileApi } from "@/services/collections";
import { useTranslation } from "@/context/I18nContext";

const Profile = () => {
  const { locale, setLocale, t } = useTranslation();
  const [profileForm] = useForm();
  const user = useSelector((state: RootState) => state.userdata);
  const dispatch = useDispatch();

  const [loadingProfile, setLoadingProfile] = useState(false);

  // Sync user details to form
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        fname: user.first_name || user.full_name?.split(" ")[0] || "",
        lname: user.last_name || user.full_name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        preferredLanguage:
          (user as any).preferred_language ||
          (user as any).preferredLanguage ||
          locale,
      });
    }
  }, [user, profileForm, locale]);

  const handleUpdateProfile = async () => {
    try {
      setLoadingProfile(true);
      const values = profileForm.getFieldsValue();

      const formData = new FormData();
      formData.append("firstName", values.fname);
      formData.append("lastName", values.lname);
      if (values.preferredLanguage) {
        formData.append("preferredLanguage", values.preferredLanguage);
      }

      const res = await updateUserProfileApi(formData);
      if (res?.status) {
        dispatch(updateUser(res.data));
        toast.success(t("settings.profile.success", { defaultValue: "Profile updated successfully!" }));
        if (values.preferredLanguage && values.preferredLanguage !== locale) {
          await setLocale(values.preferredLanguage);
        }
      } else {
        toast.error(res?.message || "Failed to update profile details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: PERSONAL DETAILS */}
      <div className="space-y-5">
        <div className="pb-3 border-b border-[#F2F4F7]">
          <h3 className="text-lg font-bold text-[#101828]">Personal Information</h3>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            Update your account profile details and application language preferences.
          </p>
        </div>

        <Form
          form={profileForm}
          requiredMark={false}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="fname"
                rules={[{ required: true, message: "First name is required" }]}
                className="mb-0"
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400 mr-1.5" />}
                  placeholder="Enter your first name"
                  className="!py-2.5 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
                />
              </Form.Item>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="lname"
                rules={[{ required: true, message: "Last name is required" }]}
                className="mb-0"
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400 mr-1.5" />}
                  placeholder="Enter your last name"
                  className="!py-2.5 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
                />
              </Form.Item>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">
                Email Address
              </label>
              <Form.Item name="email" className="mb-0">
                <Input
                  disabled
                  prefix={<MailOutlined className="text-slate-400 mr-1.5" />}
                  suffix={
                    <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                      <CheckCircleFilled className="text-[11px]" /> Verified
                    </span>
                  }
                  className="!py-2.5 !px-3.5 !rounded-xl !border-[#E4E7EC] bg-[#F8FAFC] text-[#667085] cursor-not-allowed text-sm"
                />
              </Form.Item>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">
                Preferred Language
              </label>
              <Form.Item name="preferredLanguage" className="mb-0">
                <Select
                  size="large"
                  prefix={<GlobalOutlined className="text-slate-400 mr-1.5" />}
                  onChange={(val) => setLocale(val)}
                  className="w-full !rounded-xl"
                  options={[
                    { value: "en", label: "🇬🇧 English" },
                    { value: "pa", label: "🇮🇳 ਪੰਜਾਬੀ (Punjabi)" },
                    { value: "fr", label: "🇫🇷 Français (French)" },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-end pt-5">
            <button
              type="submit"
              disabled={loadingProfile}
              className="px-5 py-2.5 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProfile ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
