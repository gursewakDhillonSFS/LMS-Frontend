import { CloseIcon } from "@/utils/icons";
import { Form, Modal, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import React from "react";
import CommonButton from "../CommonButton";
import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";

export const announcementFields: CreateCourseStep1Prop[] = [
  {
    key: "course",
    label: "Course",
    type: "select",
    placeholder: "--Select Option--",
    options: [
      { label: "Finance & Quantitative Modeling", value: "finance" },
      { label: "Data Analytics", value: "analytics" },
    ],
    colSpan: 24,
  },
  {
    key: "batch",
    label: "Batch",
    type: "select",
    placeholder: "--Select Option--",
    options: [
      { label: "Batch A", value: "batch_a" },
      { label: "Batch B", value: "batch_b" },
    ],
    colSpan: 24,
  },
  {
    key: "date",
    label: "Date",
    type: "date",
    placeholder: "DD/MM/YYYY",
    colSpan: 24,
  },
];

interface ScheduleLiveClassModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

const ScheduleLiveClassModal: React.FC<ScheduleLiveClassModalProps> = ({
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
      width={400}
      className="!relative"
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-black rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon />
      </button>
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-2xl text-center">Schedule Live Class</h1>
        <Form
          form={form}
          onFinish={handleSubmit}
          className="!w-full !flex !flex-col !items-center"
        >
          <Row gutter={[16, 0]} className="w-full">
            {announcementFields.map((field) => {
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
              onClick={() => form.submit()}
              text={"Schedule"}
              className={`!bg-secondary text-white !w-[30%]`}
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ScheduleLiveClassModal;
