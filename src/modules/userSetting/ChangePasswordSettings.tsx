"use client";

import React, { useState } from "react";
import { Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import {
  LockOutlined,
  SafetyOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { toast } from "@/utils/toast";
import { changePassword } from "@/services/collections";

const ChangePasswordSettings: React.FC = () => {
  const [passwordForm] = useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);

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
          res?.message || "Failed to change password. Please verify your current password."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="pb-4 border-b border-[#F2F4F7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg shrink-0">
            <SafetyOutlined />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#101828]">Change Password</h3>
            <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
              Update your account password to maintain high security standards.
            </p>
          </div>
        </div>
      </div>

      {/* Security Tip Box */}
      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex items-start gap-3">
        <InfoCircleOutlined className="text-blue-600 mt-0.5 text-base shrink-0" />
        <div className="space-y-1 text-xs text-[#475467]">
          <p className="font-semibold text-[#101828]">Password Requirements:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[#667085]">
            <li>Minimum 6 characters (8+ recommended)</li>
            <li>Combine uppercase & lowercase letters with numbers</li>
            <li>Avoid using personal dates, names, or repetitive characters</li>
          </ul>
        </div>
      </div>

      {/* Change Password Form */}
      <Form
        form={passwordForm}
        requiredMark={false}
        layout="vertical"
        onFinish={handleChangePassword}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-[#344054] mb-1.5">
            Current Password <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name="current_password"
            rules={[{ required: true, message: "Please enter your current password" }]}
            className="mb-0"
          >
            <Input.Password
              prefix={<KeyOutlined className="text-slate-400 mr-2" />}
              placeholder="Enter current password"
              className="!py-2.5 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <Form.Item
              name="new_password"
              rules={[
                { required: true, message: "Please enter new password" },
                { min: 6, message: "Must be at least 6 characters" },
              ]}
              className="mb-0"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-2" />}
                placeholder="New password"
                className="!py-2.5 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
              />
            </Form.Item>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <Form.Item
              name="confirm_new_password"
              dependencies={["new_password"]}
              rules={[
                { required: true, message: "Please confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
              className="mb-0"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-2" />}
                placeholder="Confirm new password"
                className="!py-2.5 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircleOutlined />
            <span>{loading ? "Updating Password..." : "Update Password"}</span>
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ChangePasswordSettings;
