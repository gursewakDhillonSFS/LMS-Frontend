import React, { useState } from "react";
import { Form } from "antd";
import CommonInput from "../CommonInput";
import CommonButton from "../CommonButton";
import CommonLink from "../CommonLink";
import { usePathname } from "next/navigation";
import { RoutePaths } from "@/utils/enums";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import { setSignin } from "@/redux/slices/AuthModalSlice";
import { RootState } from "@/redux/store";

interface ChangePasswordProps {
  onSignin: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onSignin }) => {
  const [form] = Form.useForm();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user_id = useSelector((state: RootState) => state.authmodal.user_id);
  const token = useSelector((state: RootState) => state.authmodal.token);
  const [loading, setLoading] = useState(false);

  const onFinish = async (value: {
    new_password: string;
    re_enter_new_password: string;
  }) => {
    try {
      if (user_id && token) {
        setLoading(true);
        const payload = {
          user_id,
          token,
          ...value,
        };
        const response = await resetPasswordApi(payload);
        if (response?.status) {
          dispatch(setSignin(true));
          toast.success(response?.message ?? "Password updated successfully");
        } else {
          toast.warning(response?.message ?? "Failed to update password");
        }
      }
    } catch (err) {
      console.error("Failed to reset password:", err);
      toast.error("An error occurred while resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-4">
      <div className="flex flex-col gap-4">
        <Form.Item
          name="new_password"
          rules={[
            { required: true, message: "Please enter new password" },
            {
              min: 8,
              message: "Password must be at least 8 characters",
            },
            {
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
              message:
                "Include uppercase, lowercase, number, and special character",
            },
          ]}
          className="!mb-0"
        >
          <CommonInput
            label="New Password"
            isPassword
            value={form.getFieldValue("new_password") || ""}
            onChange={(e) =>
              form.setFieldsValue({ new_password: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item
          name="re_enter_new_password"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
          className="!mb-0"
        >
          <CommonInput
            label="Confirm New Password"
            isPassword
            value={form.getFieldValue("re_enter_new_password") || ""}
            onChange={(e) =>
              form.setFieldsValue({ re_enter_new_password: e.target.value })
            }
          />
        </Form.Item>
      </div>

      <Form.Item className="!mb-0 !mt-5">
        <CommonButton
          text="Update Password"
          loading={loading}
          className="w-full !h-[44px] !text-[15px] font-medium !rounded-[8px]"
        />
      </Form.Item>

      {!pathname.includes(RoutePaths?.BecomeInstructor) && (
        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Back to <CommonLink text="Login" className="font-semibold text-[var(--primary)] hover:underline" onClick={onSignin} />
        </p>
      )}
    </Form>
  );
};

export default ChangePassword;
