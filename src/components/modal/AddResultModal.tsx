"use client";

import { Form, Modal, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import React from "react";
import CommonButton from "../CommonButton";
import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { CloseOutlined, TrophyOutlined } from "@ant-design/icons";

export const addResultFields: CreateCourseStep1Prop[] = [
  {
    key: "score",
    label: "Score Grade",
    type: "select",
    placeholder: "--Select Grade--",
    options: [
      { label: "A+ (90-100%)", value: "A+" },
      { label: "A (80-89%)", value: "A" },
      { label: "B (70-79%)", value: "B" },
      { label: "C (60-69%)", value: "C" },
      { label: "D (50-59%)", value: "D" },
      { label: "F (Fail)", value: "F" },
    ],
    colSpan: 24,
  },
  {
    key: "remark",
    label: "Result Remarks & Feedback",
    type: "textarea",
    row: 5,
    placeholder: "Provide constructive feedback for the student...",
    colSpan: 24,
  },
];

interface AddResultModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

const AddResultModal: React.FC<AddResultModalProps> = ({
  open,
  onClose,
  loading = false,
}) => {
  const [form] = useForm();
  const handleSubmit = () => {
    const values = form.getFieldsValue();
    console.log("Form Values:", values);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={false}
      closable={false}
      width={500}
      centered
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <TrophyOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Add Student Result
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record score grades and performance feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
              {addResultFields.map((field) => (
                <React.Fragment key={field?.key}>
                  {renderFormItem(field)}
                </React.Fragment>
              ))}
            </Row>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              loading={loading}
              onClick={() => form.submit()}
              text="Save Result"
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddResultModal;
