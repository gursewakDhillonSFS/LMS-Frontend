import React, { useState } from "react";
import { Form } from "antd";
import CommonInput from "../CommonInput";
import CommonButton from "../CommonButton";
import CommonLink from "../CommonLink";
import { forgetPasswordApi } from "@/services/collections";
import { toast } from "react-toastify";
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
    // const value = form.getFieldsValue();
    try {
      setLoading(true);
      const response = await forgetPasswordApi({
        ...value,
      });
      if (response?.status) {
        dispatch(setEmail(value?.email));
        onOtp();
        toast.success(response?.message ?? "Something Went Wrong");
      } else {
        toast.warning(response?.message ?? "Something Went Wrong");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-6">
        <div className="flex flex-col gap-[6px]">
          <div className="flex flex-col gap-4">
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email" }]}
              className="!mb-0"
            >
              <CommonInput
                label="Email Address"
                type="email"
                value={form.getFieldValue("email") || ""}
                onChange={(e) => form.setFieldsValue({ email: e.target.value })}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item className="!mb-0 ">
          <CommonButton
            text={"Submit"}
            loading={loading}
            className="w-full h-[56px] text-[16px] text-md my-5"
          />
        </Form.Item>
      </Form>
      <div className="text-center border-t-1 border-[#E0E0E0] pt-3 text-[14px] text-[#2D2D2D] mt-3">
        Back to{" "}
        <CommonLink text={"Login"} className="underline" onClick={onSignin} />
      </div>
    </div>
  );
};

export default ForgetPassword;
