"use client";

import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { Form, Modal, Row } from "antd";
import React, { useState, useMemo } from "react";
import CommonButton from "../CommonButton";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { createInstrucotor } from "@/services/collections";
import { toast } from "@/utils/toast";
import useCategories from "@/hooks/useCategories";
import { CloseOutlined, UserAddOutlined } from "@ant-design/icons";

interface InviteTeacherModalProps {
  open: boolean;
  onCancel: () => void;
  fetchAllTeacher: () => Promise<void>;
}

export const InviteTeacherModal: React.FC<InviteTeacherModalProps> = ({
  open,
  onCancel,
  fetchAllTeacher,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const user_id = useSelector((state: RootState) => state?.userdata?.user_id);

  const { data, loading: CategoryLoading } = useCategories();

  const categoryOptions = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((item: { category_name?: string; label?: string; name?: string }) => {
        const categoryName =
          item?.category_name || item?.label || item?.name || String(item);
        return {
          label: categoryName,
          value: categoryName,
        };
      });
    }
    return [
      { label: "AI & Innovation", value: "AI & Innovation" },
      { label: "Web Development", value: "Web Development" },
      { label: "UI/UX Design", value: "UI/UX Design" },
      { label: "Data Science", value: "Data Science" },
      { label: "Digital Marketing", value: "Digital Marketing" },
      { label: "Mobile Development", value: "Mobile Development" },
      { label: "Graphic Design", value: "Graphic Design" },
      { label: "Education", value: "Education" },
    ];
  }, [data]);

  const inviteTeacherFields: CreateCourseStep1Prop[] = [
    {
      key: "First_name",
      label: "First Name",
      type: "input",
      placeholder: "Enter first name",
      colSpan: 12,
    },
    {
      key: "Last_name",
      label: "Last Name",
      type: "input",
      placeholder: "Enter last name",
      colSpan: 12,
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      placeholder: "--Select Option--",
      options: [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ],
      colSpan: 8,
    },
    {
      key: "dob",
      label: "D.O.B.",
      type: "date",
      placeholder: "DD/MM/YYYY",
      colSpan: 8,
    },
    {
      key: "marital_status",
      label: "Marital Status",
      type: "select",
      placeholder: "--Select Option--",
      options: [
        { label: "Single", value: "Single" },
        { label: "Married", value: "Married" },
        { label: "Divorced", value: "Divorced" },
      ],
      colSpan: 8,
    },
    {
      key: "email",
      label: "Email Address",
      type: "input",
      placeholder: "Enter email address",
      colSpan: 12,
    },
    {
      key: "phone_number",
      label: "Phone Number",
      type: "phone",
      placeholder: "Enter phone number",
      colSpan: 12,
    },
    {
      key: "qualification",
      label: "Qualification",
      type: "input",
      placeholder: "Enter qualification",
      colSpan: 24,
    },
    {
      key: "expert_in",
      label: "Expert In",
      type: "select",
      mode: "multiple",
      placeholder: "--Select Option--",
      options: categoryOptions,
      loading: CategoryLoading,
      colSpan: 24,
    },
  ];

  const handleClose = () => {
    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const value = form.getFieldsValue();
    value.user_id = user_id;
    if (value?.dob) {
      value.dob = new Date(value.dob).toISOString().split("T")[0];
    }

    try {
      const res = await createInstrucotor(value);
      if (res.status) {
        toast.success(res.message || "Teacher invited successfully!");
        handleClose();
        await fetchAllTeacher();
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      footer={null}
      width={720}
      closable={false}
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <UserAddOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Invite Teacher
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboard a new instructor with their credentials and specializations
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
          className="w-full flex flex-col"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            <Row gutter={[16, 0]} className="w-full">
              {inviteTeacherFields.map((field) => (
                <React.Fragment key={field?.key}>
                  {renderFormItem(field)}
                </React.Fragment>
              ))}
            </Row>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              loading={loading}
              text="Send Invite"
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};
