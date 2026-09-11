"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form } from "antd";
import CommonButton from "../CommonButton";
import QuillEditor from "@/components/QuillEditor";
import { CloseOutlined, FileTextOutlined } from "@ant-design/icons";

export interface EditOverviewModalProps {
  visible: boolean;
  onCancel: () => void;
  overview: string;
  handleFinish: (value: string) => Promise<void>;
}

const EditOverviewModal: React.FC<EditOverviewModalProps> = ({
  visible,
  onCancel,
  overview,
  handleFinish,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!overview) return;
    form.setFieldsValue({
      overview: overview,
    });
  }, [overview, form, visible]);

  const onFinish = async () => {
    setLoading(true);
    try {
      await handleFinish(form.getFieldValue("overview"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={760}
      footer={false}
      closable={false}
      centered
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <FileTextOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Update Course Overview
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Revise syllabus summary and key course highlights
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
          onFinish={onFinish}
          className="w-full flex flex-col gap-4"
        >
          <Form.Item
            rules={[{ required: true, message: "Course overview is required" }]}
            name="overview"
            className="!mb-0"
          >
            <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[220px]">
              <QuillEditor placeholder="Write a comprehensive overview of this course..." />
            </div>
          </Form.Item>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              loading={loading}
              text="Update Overview"
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default EditOverviewModal;
