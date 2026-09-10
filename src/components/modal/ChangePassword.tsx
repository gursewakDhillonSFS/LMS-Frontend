"use client";

import { changePasswordProp, ChangePasswordProps } from "@/utils/interface";
import { Form, Modal } from "antd";
import React, { useState } from "react";
import CommonButton from "../CommonButton";
import { useForm } from "antd/es/form/Form";
import CommonInput from "../CommonInput";
import { changePassword } from "@/services/collections";
import { toast } from "@/utils/toast";
import { useDispatch } from "react-redux";
import { resetAllSlices } from "@/redux/resetSlice";
import { useRouter } from "next/navigation";

const ChangePassword: React.FC<ChangePasswordProps> = ({ open, onCancel }) => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const handleSubmit = async (value: changePasswordProp) => {
    setLoading(true);
    try {
      const res = await changePassword(value);
      if (res.status) {
        toast.success(res.message);
        onCancel();
        dispatch(resetAllSlices());
        router.push("/");
      } else {
        toast.warning(res.message);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      footer={null}
      width={450}
      closable={false}
      prefixCls="confirmation-modal"
    >
      <div className="w-full px-4 flex flex-col items-center justify-center gap-[16px]">
        <h1 className="text-[32px] font-bold">Change Password</h1>
        <Form
          form={form}
          onFinish={handleSubmit}
          className="!w-full !flex !flex-col !gap-3"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="old_password" className="plus-jakarta-sans">
              Old Password
            </label>
            <Form.Item
              name="old_password"
              rules={[
                { required: true, message: "Please enter your old password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
              className="!mb-0"
            >
              <CommonInput
                label="Old Password"
                isPassword
                value={form.getFieldValue("old_password") || ""}
                onChange={(e) =>
                  form.setFieldsValue({ old_password: e.target.value })
                }
              />
            </Form.Item>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new_password" className="plus-jakarta-sans">
              New Password
            </label>
            <Form.Item
              name="new_password"
              rules={[
                { required: true, message: "Please enter your new password" },
                { min: 8, message: "Password must be at least 8 characters" },
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
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="re_enter_new_password"
              className="plus-jakarta-sans"
            >
              Re-enter New Password
            </label>
            <Form.Item
              name="re_enter_new_password"
              dependencies={["new_password"]}
              rules={[
                {
                  required: true,
                  message: "Please re-enter new password",
                },
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
                label="Re-enter New Password"
                isPassword
                value={form.getFieldValue("re_enter_new_password") || ""}
                onChange={(e) =>
                  form.setFieldsValue({ re_enter_new_password: e.target.value })
                }
              />
            </Form.Item>
          </div>

          <div className="flex gap-3 w-full">
            <CommonButton
              text={"No"}
              type="button"
              onClick={onCancel}
              className="border border-black !bg-transparent !w-full"
            />
            <CommonButton
              loading={loading}
              text={"Yes"}
              className={`!bg-primary text-white !w-full`}
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ChangePassword;
