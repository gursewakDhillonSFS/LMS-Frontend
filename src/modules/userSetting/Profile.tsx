"use client";
import React, { useState, useEffect } from "react";
import { Form, Input, Collapse, Divider, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";
import { RootState } from "@/redux/store";
import { updateUser } from "@/redux/slices/UserDataSlice";
import { updateUserProfileApi, changePassword } from "@/services/collections";
import CommonButton from "@/components/CommonButton";
import { LockOutlined, UserOutlined, MailOutlined, GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "@/context/I18nContext";

const Profile = () => {
  const { locale, setLocale, t } = useTranslation();
  const [profileForm] = useForm();
  const [passwordForm] = useForm();
  const user = useSelector((state: RootState) => state.userdata);
  const dispatch = useDispatch();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

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
        toast.success(t("settings.profile.success"));
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

  const handleChangePassword = async () => {
    try {
      setLoadingPassword(true);
      const values = passwordForm.getFieldsValue();

      if (values.new_password !== values.confirm_new_password) {
        toast.error("New passwords do not match!");
        return;
      }

      const payload = {
        current_password: values.current_password,
        new_password: values.new_password,
      };

      const res = await changePassword(payload);
      if (res?.success) {
        toast.success("Password changed successfully!");
        passwordForm.resetFields();
      } else {
        toast.error(
          res?.message || "Failed to change password. Please check your current password."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while changing password");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="w-full h-fit p-6 flex flex-col gap-6 bg-white rounded-xl">
      <div>
        <h2 className="text-[20px] font-bold plus-jakarta-sans pb-3 border-b border-[#C8C8C8]">
          {t("settings.profile.title")}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t("settings.profile.subtitle")}
        </p>
      </div>

      <Form
        form={profileForm}
        requiredMark={false}
        layout="vertical"
        onFinish={handleUpdateProfile}
      >
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="fname" className="plus-jakarta-sans text-sm font-medium text-gray-700">
              {t("settings.profile.firstName")}
            </label>
            <Form.Item
              name="fname"
              rules={[{ required: true, message: t("auth.validation.firstNameRequired") }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                className="!p-3 !border-[#C8C8C8] !rounded-[8px]"
                placeholder={t("settings.profile.firstName")}
              />
            </Form.Item>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="lname" className="plus-jakarta-sans text-sm font-medium text-gray-700">
              {t("settings.profile.lastName")}
            </label>
            <Form.Item
              name="lname"
              rules={[{ required: true, message: t("auth.validation.lastNameRequired") }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                className="!p-3 !border-[#C8C8C8] !rounded-[8px]"
                placeholder={t("settings.profile.lastName")}
              />
            </Form.Item>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="plus-jakarta-sans text-sm font-medium text-gray-700">
              {t("settings.profile.email")}
            </label>
            <Form.Item name="email">
              <Input
                disabled
                prefix={<MailOutlined className="text-gray-400" />}
                type="email"
                className="!p-3 !border-[#C8C8C8] !rounded-[8px] bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder={t("settings.profile.email")}
              />
            </Form.Item>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="preferredLanguage" className="plus-jakarta-sans text-sm font-medium text-gray-700">
              {t("settings.profile.language")}
            </label>
            <Form.Item name="preferredLanguage">
              <Select
                size="large"
                prefix={<GlobalOutlined className="text-gray-400 mr-1" />}
                onChange={(val) => setLocale(val)}
                className="w-full !rounded-[8px]"
                options={[
                  { value: "en", label: "🇬🇧 English" },
                  { value: "pa", label: "🇮🇳 ਪੰਜਾਬੀ (Punjabi)" },
                  { value: "fr", label: "🇫🇷 Français (French)" },
                ]}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item className="!flex !items-center !justify-end !pb-0 mb-0">
          <CommonButton
            text={t("settings.profile.save")}
            loading={loadingProfile}
            disable={loadingProfile}
            type="submit"
            className="!bg-secondary text-white !h-[48px] !px-6 !rounded-lg"
          />
        </Form.Item>
      </Form>

      <Divider className="my-2" />

      {/* Security Section */}
      <Collapse
        ghost
        className="w-full !bg-white"
        expandIconPosition="end"
        items={[
          {
            key: "security",
            label: (
              <span className="text-[18px] font-bold plus-jakarta-sans text-secondary">
                🔑 Security & Password Changes
              </span>
            ),
            children: (
              <Form
                form={passwordForm}
                requiredMark={false}
                layout="vertical"
                onFinish={handleChangePassword}
                className="pt-2"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="plus-jakarta-sans text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <Form.Item
                      name="current_password"
                      rules={[{ required: true, message: "Please enter your current password" }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        className="!p-3 !border-[#C8C8C8] !rounded-[8px]"
                        placeholder="Enter current password"
                      />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="plus-jakarta-sans text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <Form.Item
                        name="new_password"
                        rules={[
                          { required: true, message: "Please enter your new password" },
                          { min: 6, message: "Password must be at least 6 characters" },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          className="!p-3 !border-[#C8C8C8] !rounded-[8px]"
                          placeholder="Enter new password"
                        />
                      </Form.Item>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="plus-jakarta-sans text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <Form.Item
                        name="confirm_new_password"
                        rules={[
                          { required: true, message: "Please confirm your new password" },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          className="!p-3 !border-[#C8C8C8] !rounded-[8px]"
                          placeholder="Confirm new password"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <CommonButton
                    text={"Update Password"}
                    loading={loadingPassword}
                    disable={loadingPassword}
                    type="submit"
                    className="!bg-primary text-black !h-[48px] !px-6 !rounded-lg"
                  />
                </div>
              </Form>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Profile;
