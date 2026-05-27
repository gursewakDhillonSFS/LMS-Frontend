"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Input, Button } from "antd";
import { resetPasswordApi } from "@/services/collections";
import { toast } from "react-toastify";
import { LockOutlined } from "@ant-design/icons";
import { RoutePaths } from "@/utils/enums";
import Cookies from "js-cookie";

const PasswordSetupContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    Cookies.remove("token");
    Cookies.remove("role_name");
    Cookies.remove("user_onboarding");
    Cookies.remove("instructor_onboarding");
  }, []);

  interface PasswordSetupValues {
  password?: string;
  confirmPassword?: string;
}

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  if (!token || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-2xl text-center border border-gray-100">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Invalid or Expired Link</h2>
          <p className="text-[#7B7B7B] mb-6">This password setup link appears to be invalid or has expired. Please request a new invitation from your administrator.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-[#007BFF] text-white rounded-lg font-semibold hover:bg-[#0056b3] transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values: PasswordSetupValues) => {
    setSubmitting(true);
    try {
      const response = await resetPasswordApi({
        token,
        user_id: userId,
        new_password: values.password || "",
        re_enter_new_password: values.confirmPassword || "",
      });

      if (response?.success === true) {
        toast.success(response?.message || "Password configured successfully! Redirecting to login...");
        router.push(RoutePaths.Homepage);
      } else {
        toast.error(response?.message || "Failed to update password.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-gray-50 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EBF5FF] text-[#007BFF] mb-4">
            <LockOutlined className="text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Secure Your Account</h1>
          <p className="mt-2 text-sm text-[#7B7B7B]">
            Please set your password to complete activation and access your teacher dashboard.
          </p>
        </div>

        <Form
          name="setup-password"
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="space-y-4"
        >
          <Form.Item
            label={<span className="text-sm font-medium text-[#333333]">New Password</span>}
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-1" />}
              placeholder="Enter your new password"
              className="py-3 px-3 rounded-xl border border-gray-200 text-[#1A1A1A] hover:border-[#007BFF] focus:border-[#007BFF] transition-all"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-medium text-[#333333]">Confirm Password</span>}
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-1" />}
              placeholder="Verify your new password"
              className="py-3 px-3 rounded-xl border border-gray-200 text-[#1A1A1A] hover:border-[#007BFF] focus:border-[#007BFF] transition-all"
            />
          </Form.Item>

          <Form.Item className="pt-2 mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="w-full !h-12 !rounded-xl !bg-[#007BFF] !hover:bg-[#0069D9] !text-white !font-semibold !text-base !border-none shadow-[0px_4px_12px_rgba(0,123,255,0.15)] hover:shadow-[0px_6px_16px_rgba(0,123,255,0.25)] transition-all"
            >
              Finalize Registration
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-8 h-8 border-4 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PasswordSetupContent />
    </Suspense>
  );
}
