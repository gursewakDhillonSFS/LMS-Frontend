import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { CloseIcon } from "@/utils/icons";
import CommonButton from "../CommonButton";
import QuillEditor from "@/components/QuillEditor";

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

  useEffect(() => {
    if (!overview) return;

    form.setFieldsValue({
      overview: overview,
    });
  }, [overview, form]);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={false}
      closable={false}
      className={`!relative !top-30`}
    >
      <button
        onClick={() => {
          onCancel();
        }}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-black rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon />
      </button>
      <h1 className="text-center font-bold text-[24px] mb-4">
        Update Course Overview
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={() => handleFinish(form.getFieldValue("overview"))}
      >
        <div className="rounded-xl bg-white flex flex-col gap-4">
          <div className="font-semibold text-xl">Overview</div>
          <Form.Item
            rules={[{ required: true, message: "Overview is required" }]}
            name="overview"
            className="!mb-0"
          >
            <QuillEditor placeholder="Enter text here..." />
          </Form.Item>
          <Form.Item className="!w-full !flex !justify-end">
            <CommonButton
              text={"Update"}
              className="!bg-secondary text-white w-[100px]"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default EditOverviewModal;
