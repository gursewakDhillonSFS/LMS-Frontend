import React, { useState } from "react";
import { Form } from "antd";
import CommonInput from "../CommonInput";
import CommonButton from "../CommonButton";
import CommonLink from "../CommonLink";
import { forgetPasswordApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import { useDispatch } from "react-redux";
import { setEmail } from "@/redux/slices/AuthModalSlice";

interface ForgetPasswordProps {
  onSignin?: () => void;
  onOtp: () => void;
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ onSignin, onOtp }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onFinish = async (value: { email: string }) => {
    try {
      setLoading(true);
      const response = await forgetPasswordApi({
        ...value,
      });
      if (response?.status) {
        dispatch(setEmail(value?.email));
        onOtp();
        toast.success(response?.message ?? "OTP sent to your email");
      } else {
        toast.warning(response?.message ?? "Failed to send reset email");
      }
    } catch (err) {
      console.error("Failed to send reset code:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-4">
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
          className="!mb-0"
        >
          <CommonInput
            label="Email Address"
            type="email"
            value={form.getFieldValue("email") || ""}
            onChange={(e) => form.setFieldsValue({ email: e.target.value })}
          />
        </Form.Item>

        <Form.Item className="!mb-0 !mt-5">
          <CommonButton
            text="Send Verification Code"
            loading={loading}
            className="w-full !h-[44px] !text-[15px] font-medium !rounded-[8px]"
          />
        </Form.Item>
      </Form>
      <div className="text-center border-t border-[var(--border)] pt-4 text-sm text-[var(--text-secondary)] mt-5">
        Remember your password?{" "}
        <CommonLink text="Back to Login" className="font-semibold text-[var(--primary)] hover:underline" onClick={onSignin} />
      </div>
    </div>
  );
};

export default ForgetPassword;
