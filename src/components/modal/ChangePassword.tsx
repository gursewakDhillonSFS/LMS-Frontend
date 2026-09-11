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
import { CloseOutlined, LockOutlined } from "@ant-design/icons";

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
      width={460}
      closable={false}
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header with Close */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <LockOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Change Password
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your account password securely
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Form Body */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="w-full flex flex-col gap-4"
        >
          <Form.Item
            name="old_password"
            label={<span className="text-xs font-semibold text-slate-700">Current Password</span>}
            rules={[
              { required: true, message: "Please enter your current password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
            className="!mb-0"
          >
            <CommonInput
              label="Current Password"
              isPassword
              value={form.getFieldValue("old_password") || ""}
              onChange={(e) =>
                form.setFieldsValue({ old_password: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label={<span className="text-xs font-semibold text-slate-700">New Password</span>}
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

          <Form.Item
            name="re_enter_new_password"
            label={<span className="text-xs font-semibold text-slate-700">Confirm New Password</span>}
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
              label="Confirm New Password"
              isPassword
              value={form.getFieldValue("re_enter_new_password") || ""}
              onChange={(e) =>
                form.setFieldsValue({ re_enter_new_password: e.target.value })
              }
            />
          </Form.Item>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              loading={loading}
              text="Update Password"
              className="!bg-[#315CFF] text-white !py-2.5 !px-5 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ChangePassword;
