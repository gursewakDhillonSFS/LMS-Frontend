"use client";

import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import { VideoCameraFilled, CloseOutlined, LinkOutlined, PlaySquareOutlined } from "@ant-design/icons";
import CommonButton from "../CommonButton";

interface AddRecordingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (recordingUrl: string, recordingName: string) => Promise<void>;
  initialUrl?: string;
  initialName?: string;
  sessionTitle?: string;
  loading?: boolean;
}

const AddRecordingModal: React.FC<AddRecordingModalProps> = ({
  open,
  onClose,
  onSave,
  initialUrl = "",
  initialName = "",
  sessionTitle = "",
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        recordingUrl: initialUrl || "",
        recordingName: initialName || (sessionTitle ? `${sessionTitle} - Recording` : ""),
      });
    }
  }, [open, initialUrl, initialName, sessionTitle, form]);

  const handleFinish = async (values: { recordingUrl: string; recordingName?: string }) => {
    await onSave(values.recordingUrl, values.recordingName || "Class Recording");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={false}
      closable={false}
      width={480}
      centered
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100/60 flex items-center justify-center text-purple-600">
              <VideoCameraFilled className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {initialUrl ? "Update Class Recording" : "Attach Class Recording"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {sessionTitle ? `For: ${sessionTitle}` : "Provide meeting recording link for students to review"}
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
          onFinish={handleFinish}
          className="w-full flex flex-col gap-3"
        >
          <Form.Item
            name="recordingName"
            label={<span className="text-xs font-bold text-gray-700">Recording Title / Label</span>}
            rules={[{ required: true, message: "Please provide a recording title" }]}
          >
            <Input
              prefix={<PlaySquareOutlined className="text-gray-400 mr-1" />}
              placeholder="e.g. Lecture 4 - Architecture Deep Dive & Q&A"
              className="!py-2 !rounded-xl text-sm"
            />
          </Form.Item>

          <Form.Item
            name="recordingUrl"
            label={<span className="text-xs font-bold text-gray-700">Recording Link (URL)</span>}
            rules={[
              { required: true, message: "Please enter the recording link" },
              { type: "url", message: "Please enter a valid URL (e.g. https://...)" },
            ]}
          >
            <Input
              prefix={<LinkOutlined className="text-gray-400 mr-1" />}
              placeholder="https://drive.google.com/... or https://youtube.com/..."
              className="!py-2 !rounded-xl text-sm"
            />
          </Form.Item>

          <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 text-xs text-purple-800 leading-relaxed">
            <span className="font-semibold">Student Visibility:</span> Enrolled students will immediately see this recording in their Live Classes tab with a direct playback/watch button.
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              text={initialUrl ? "Update Recording" : "Save & Publish"}
              type="submit"
              loading={loading}
              className="!bg-purple-600 hover:!bg-purple-700 text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddRecordingModal;
