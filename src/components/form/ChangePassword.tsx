import React, { useState } from "react";
import { Form } from "antd";
import CommonInput from "../CommonInput";
import CommonButton from "../CommonButton";
import CommonLink from "../CommonLink";
import { usePathname } from "next/navigation";
import { RoutePaths } from "@/utils/enums";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordApi } from "@/services/collections";
import { toast } from "react-toastify";
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
    // const value = form.getFieldsValue();
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
          toast.success(response?.message);
        } else {
          toast.warning(response?.message ?? "Something Went Wrong");
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-6">
      <div className="flex flex-col gap-[5px]">
        <div className="flex flex-col gap-4">
          <Form.Item
            name="new_password"
            rules={[
              { required: true, message: "Please enter your password" },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                message:
                  "Password must include uppercase, lowercase, number, and special character",
              },
            ]}
            className="!mb-0"
          >
            <CommonInput
              label="Enter Password"
              isPassword
              value={form.getFieldValue("password") || ""}
              onChange={(e) =>
                form.setFieldsValue({ password: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            name="re_enter_new_password"
            rules={[
              { required: true, message: "Please re-enter your password" },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                message:
                  "Password must include uppercase, lowercase, number, and special character",
              },
            ]}
            className="!mb-0"
          >
            <CommonInput
              label="Re-enter Password"
              isPassword
              value={form.getFieldValue("re_enter_password") || ""}
              onChange={(e) =>
                form.setFieldsValue({ re_enter_password: e.target.value })
              }
            />
          </Form.Item>
        </div>
      </div>

      <Form.Item className="!mb-0">
        <CommonButton
          text={"Submit"}
          loading={loading}
          className="w-full h-[56px] text-[16px] text-md my-5"
        />
      </Form.Item>

      {!pathname.includes(RoutePaths?.BecomeInstructor) && (
        <p className="text-center text-[14px] text-[#2D2D2D] ">
          Back to <CommonLink text={"Login"} onClick={onSignin} />
        </p>
      )}
    </Form>
  );
};

export default ChangePassword;
