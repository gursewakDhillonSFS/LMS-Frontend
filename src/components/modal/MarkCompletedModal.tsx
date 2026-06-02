import { CloseIcon, FileDisplayIcon } from "@/utils/icons";
import { Form, Modal, Row, Upload, UploadFile, UploadProps } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useState } from "react";
import CommonButton from "../CommonButton";
import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";

export const addResultFields: CreateCourseStep1Prop[] = [
  {
    key: "result",
    label: "Result",
    type: "select",
    placeholder: "--Select Result--",
    options: [
      { label: "Pass", value: "pass" },
      { label: "Fail", value: "fail" },
    ],
    colSpan: 24,
  },
  {
    key: "remark",
    label: "Result Remark",
    type: "textarea",
    row: 6,
    placeholder: "Enter remarks here...",
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
      onCancel={() => {
        onClose();
        form.resetFields();
        setFileList([]);
      }}
      footer={false}
      closable={false}
      width={700}
      className="!relative !top-10"
    >
      <button
        onClick={() => {
          onClose();
          form.resetFields();
          setFileList([]);
        }}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon color="black" />
      </button>
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-2xl text-center">Mark Completed</h1>
        <Form
          form={form}
          onFinish={handleSubmit}
          className="!w-full !flex !flex-col"
        >
          <Row className="w-full">
            {addResultFields.map((field) => {
              return (
                <React.Fragment key={field?.key}>
                  {renderFormItem(field)}
                </React.Fragment>
              );
            })}
          </Row>
          <div className="grid gap-1 w-full">
            <label className="plus-jakarta-sans text-[16px]">Certificate</label>
            <Upload.Dragger
              {...uploadProps}
              showUploadList={false}
              style={{
                padding: 8,
                backgroundColor: "transparent",
                width: "100%",
              }}
            >
              <div className="flex flex-col items-center justify-center w-full">
                <p className="ant-upload-text !font-bold !text-secondary">
                  Click to Upload Certificate
                </p>
                <p className="ant-upload-hint !font-bold">
                  Max. File size: 25 MB
                </p>
              </div>
            </Upload.Dragger>
            <div className="grid grid-cols-1 gap-2 my-3">
              {fileList.map((file, index) => (
                <div
                  key={index}
                  className="border border-[#ccc] rounded-[8px] p-3 flex items-center justify-between flex-grow"
                >
                  <FileDisplayIcon />
                  <div className="ml-4 flex-1">
                    <div className="text-sm">
                      {file.name.length > 30
                        ? file.name.slice(0, 30) + "..."
                        : file.name}
                    </div>
                    <div className="text-[#9A9A9A] font-xs">
                      PDF • {(file?.size || 0 / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  <div
                    className="bg-[#FB4A49] rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                    onClick={() => removeFile(index)}
                  >
                    <CloseIcon />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end w-full">
            <CommonButton
              loading={loading}
              onClick={() => form.submit()}
              text={"Save"}
              className={`!bg-secondary text-white !w-[30%]`}
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default MarkCompletedModal;
