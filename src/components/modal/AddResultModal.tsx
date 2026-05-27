import { CloseIcon } from "@/utils/icons";
import { Form, Modal, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import React from "react";
import CommonButton from "../CommonButton";
import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";

export const addResultFields: CreateCourseStep1Prop[] = [
  {
    key: "score",
    label: "Score",
    type: "select",
    placeholder: "--Select Grade--",
    options: [
      { label: "A+", value: "A+" },
      { label: "A", value: "A" },
      { label: "B", value: "B" },
      { label: "C", value: "C" },
      { label: "D", value: "D" },
      { label: "F", value: "F" },
    ],
    colSpan: 24,
  },
  {
    key: "remark",
    label: "Result Remark",
    type: "textarea",
    row: 10,
    placeholder: "Enter remarks here...",
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
      width={600}
      className="!relative"
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon color="black" />
      </button>
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-2xl text-center">Add Result</h1>
        <Form
          form={form}
          onFinish={handleSubmit}
          className="!w-full !flex !flex-col !items-center"
        >
          <Row gutter={[16, 0]} className="w-full">
            {addResultFields.map((field) => {
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
              text={"Add"}
              className={`!bg-secondary text-white !w-[30%]`}
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddResultModal;
