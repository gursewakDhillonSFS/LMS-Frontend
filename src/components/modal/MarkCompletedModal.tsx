"use client";

import { Form, Modal, Row, Upload, UploadFile, UploadProps } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useState } from "react";
import CommonButton from "../CommonButton";
import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";
import {
  CloseOutlined,
  SafetyCertificateOutlined,
  InboxOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

export const addResultFields: CreateCourseStep1Prop[] = [
  {
    key: "result",
    label: "Completion Status",
    type: "select",
    placeholder: "--Select Status--",
    options: [
      { label: "Passed / Completed", value: "pass" },
      { label: "Failed / Needs Retake", value: "fail" },
    ],
    colSpan: 24,
  },
  {
    key: "remark",
    label: "Final Remarks & Assessment",
    type: "textarea",
    row: 4,
    placeholder: "Enter feedback or evaluation remarks...",
    colSpan: 24,
  },
];

interface MarkCompletedModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

const MarkCompletedModal: React.FC<MarkCompletedModalProps> = ({
  open,
  onClose,
  loading = false,
}) => {
  const [form] = useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    multiple: true,
    fileList,
    onChange(info) {
      setFileList(info.fileList);
    },
    onRemove(file) {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    const updatedValues = {
      ...values,
      certificate: fileList,
    };
    console.log("Form Values:", updatedValues);
  };

  const removeFile = (index: number) => {
    const newList = [...fileList];
    newList.splice(index, 1);
    setFileList(newList);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={false}
      closable={false}
      width={560}
      centered
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <SafetyCertificateOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Mark Completed
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue certificate and grade final completion
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
          className="w-full flex flex-col gap-4"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-4">
            <Row gutter={[16, 0]} className="w-full">
              {addResultFields.map((field) => (
                <React.Fragment key={field?.key}>
                  {renderFormItem(field)}
                </React.Fragment>
              ))}
            </Row>

            {/* Certificate Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">Course Certificate (PDF / Image)</label>
              <Upload.Dragger
                {...uploadProps}
                showUploadList={false}
                className="!border-dashed !border-slate-300 hover:!border-[#315CFF] !bg-slate-50/50 !rounded-xl !p-4"
              >
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315CFF] flex items-center justify-center">
                    <InboxOutlined className="text-xl" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click or drag certificate here to upload
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports PDF, PNG, JPG (Max file size: 25 MB)
                  </p>
                </div>
              </Upload.Dragger>

              {/* Uploaded Certificate Files */}
              {fileList.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {fileList.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#315CFF] flex items-center justify-center shrink-0">
                          <FileTextOutlined className="text-base" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {((file?.size || 0) / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              loading={loading}
              onClick={() => form.submit()}
              text="Save Completion"
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default MarkCompletedModal;
