"use client";
import { renderFormItem } from "@/utils/commonFunctions";
import { CloseIcon } from "@/utils/icons";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { Form, Modal, Row } from "antd";
import React, { useState, useMemo } from "react";
import CommonButton from "../CommonButton";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { createInstrucotor } from "@/services/collections";
import { toast } from "@/utils/toast";
import useCategories from "@/hooks/useCategories";

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
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const user_id = useSelector((state: RootState) => state?.userdata?.user_id);

  const { data, loading: CategoryLoading } = useCategories();

  const categoryOptions = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((item: any) => {
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
        fetchAllTeacher();
        const rawLink = res.setupLink || res.data?.setupLink;
        if (rawLink) {
          let finalLink = rawLink;
          if (typeof window !== "undefined") {
            try {
              const parsed = new URL(rawLink);
              finalLink = `${window.location.origin}${parsed.pathname}${parsed.search}`;
            } catch {
              if (rawLink.startsWith("/")) {
                finalLink = `${window.location.origin}${rawLink}`;
              }
            }
          }
          setGeneratedLink(finalLink);
          toast.success("Teacher invited! Setup link generated.");
        } else {
          toast.success(res.message);
          form.resetFields();
          onCancel();
        }
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setGeneratedLink(null);
    setCopied(false);
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      footer={null}
      width={700}
      closable={false}
      className="relative"
      prefixCls="confirmation-modal"
    >
      <button
        onClick={handleClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon color="black" />
      </button>

      {generatedLink ? (
        <div className="w-full px-6 py-4 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Profile Created!</h1>
          <p className="text-sm text-gray-600 max-w-md">
            The teacher has been added to your organisation. You can share or click the direct setup link below to create their password and test the teacher login flow immediately:
          </p>
          <div className="w-full flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg p-2.5">
            <input
              type="text"
              readOnly
              value={generatedLink}
              className="w-full bg-transparent text-xs text-gray-700 outline-none truncate font-mono"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                setCopied(true);
                toast.success("Setup link copied to clipboard!");
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:opacity-90 whitespace-nowrap cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <a
              href={generatedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-primary text-primary font-medium text-sm rounded-lg hover:bg-blue-50 transition flex items-center gap-1.5"
            >
              Open Setup Page ↗
            </a>
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 bg-primary text-white font-medium text-sm rounded-lg hover:opacity-90 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full px-4 flex flex-col items-center justify-center gap-[16px]">
          <h1 className="text-[24px] font-bold">Invite Teacher</h1>
          <Form
            form={form}
            onFinish={handleSubmit}
            className="!w-full !flex !flex-col !items-center"
          >
            <Row gutter={[16, 0]} className="w-full">
              {inviteTeacherFields.map((field) => {
                return (
                  <React.Fragment key={field?.key}>
                    {renderFormItem(field)}
                  </React.Fragment>
                );
              })}
            </Row>
            <div className="flex items-center justify-end w-full">
              <CommonButton
                loading={loading}
                text={"Invite"}
                className={`!bg-secondary text-white !w-[20%]`}
              />
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
};
