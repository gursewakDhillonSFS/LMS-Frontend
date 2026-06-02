import React, { useState } from "react";
import { Collapse, Checkbox, Input, Typography, message } from "antd";
import {
  FilePdfOutlined,
  CloseCircleFilled,
  RightOutlined,
} from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";
import { LockIcon, Uploadicon } from "@/utils/icons";
import BadgeComponent from "./BadgeComponent";
import { Form } from "antd";
import CommonButton from "./CommonButton";
import QuillEditor from "@/components/QuillEditor";
const { TextArea } = Input;
const { Text } = Typography;

type Milestone = {
  step: string;
  title: string;
  status: "Not Started" | "In Progress" | "Completed";
  tasks: string[];
};

export enum CourseStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

const milestones: Milestone[] = [
  {
    step: "1",
    title: "Understanding Light and Its Properties",
    status: CourseStatus.IN_PROGRESS,
    tasks: [
      "Read the lesson on light theory and behavior",
      "Watch the introductory video",
      "Complete the multiple-choice quiz",
    ],
  },
  {
    step: "2",
    title: "Real-World Applications of Light",
    status: CourseStatus.NOT_STARTED,
    tasks: [
      "Explore the use of light in daily technology",
      "Submit your written insights (500 words)",
      "Upload a relevant diagram or illustration (PDF)",
    ],
  },
  {
    step: "3",
    title: "Scientific Proof and Experiments",
    status: CourseStatus.NOT_STARTED,
    tasks: [
      "Watch the experiment demonstration",
      "List down key observations",
      "Submit a video or document proving the concept",
    ],
  },
  {
    step: "4",
    title: "Peer Review and Discussion",
    status: CourseStatus.NOT_STARTED,
    tasks: [
      "Review peer submissions",
      "Comment on at least 2 projects",
      "Join the group discussion session",
    ],
  },
  {
    step: "5",
    title: "Final Submission and Reflection",
    status: CourseStatus.NOT_STARTED,
    tasks: [
      "Upload your final report (Max 25MB, PDF format)",
      "Submit a 2-minute summary pitch",
      "Mark this project as complete",
    ],
  },
];

const AssignmentDetailsFormCollapse = () => {
  const [form] = Form.useForm();

  const [formData, setFormData] = useState(milestones);
  const [activeStep, setActiveStep] = useState<string | string[] | null>("1");

  const [fileList, setFileList] = useState<RcFile[]>([]);
  const handleCollapseChange = (key: string | string[]) => {
    console.log(key);
    if (Array.isArray(key) && key.length == 0) {
      setActiveStep(String(0));
      return;
    }
    const selectedStep = Array.isArray(key) ? key[0] : key;
    const foundMilestone = formData.find((m) => m.step === selectedStep);
    if (foundMilestone && foundMilestone.status !== "Not Started") {
      setActiveStep(selectedStep);
    }
  };

  const handleBeforeUpload = (file: RcFile) => {
    const isPdf = file.type === "application/pdf";
    if (!isPdf) {
      message.error("Only PDF files are allowed.");
    }

    const isLt25M = file.size / 1024 / 1024 < 25;
    if (!isLt25M) {
      message.error("File must be smaller than 25MB.");
    }

    return isPdf && isLt25M;
  };

  const handleFileChange = (
    info: UploadChangeParam<UploadFile<{ customTag: string }>>
  ) => {
    const file = info.file.originFileObj;
    if (!file) return;

    if (fileList.length >= 5) {
      message.warning("You can upload up to 5 files only.");
      return;
    }

    const isDuplicate = fileList.some(
      (f) => f.name === file.name && f.size === file.size
    );
    if (isDuplicate) {
      message.warning("This file has already been added.");
      return;
    }

    setFileList((prev) => [...prev, file]);
  };

  const removeFile = (index: number) => {
    const newList = [...fileList];
    newList.splice(index, 1);
    setFileList(newList);
  };

  const handleMarkComplete = async (item: Milestone, index: number) => {
    try {
      const values = await form.validateFields();
      const milestoneData = values.milestones?.[index];

      console.log(milestoneData);

      const updatedFormData = [...formData];

      updatedFormData[index] = {
        ...item,
        status: "Completed",
      };

      if (index + 1 < updatedFormData.length) {
        const nextItem = updatedFormData[index + 1];
        if (nextItem.status === "Not Started") {
          updatedFormData[index + 1] = {
            ...nextItem,
            status: "In Progress",
          };
        }
      }

      setFormData(updatedFormData);

      setActiveStep(String(Number(activeStep) + 1));
      message.success(`Step ${item.step} marked as Completed`);
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col gap-4">
        {formData.map((item, index) => (
          <Collapse
            key={index}
            expandIconPosition="end"
            expandIcon={({ isActive }) =>
              item.status === "In Progress" || item.status === "Completed" ? (
                <RightOutlined
                  style={{
                    transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "0.2s",
                  }}
                />
              ) : (
                <LockIcon />
              )
            }
            accordion
            activeKey={activeStep || undefined}
            onChange={handleCollapseChange}
            className={activeStep == item.step ? "!bg-secondary" : "!bg-white"}
            items={[
              {
                key: item.step,
                label: (
                  <div
                    className={`flex justify-between ${
                      item.status == "Not Started" && "opacity-50"
                    }`}
                  >
                    <div className="flex gap-2">
                      <p
                        className={`rounded-[12px] px-2 py-1 text-xs whitespace-nowrap h-fit ${
                          activeStep !== item.step ? "bg-[#E3E3E3]" : "bg-white"
                        }`}
                      >
                        Project {item.step}
                      </p>
                      <p
                        className={`font-bold ${
                          activeStep == item.step && "text-white"
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                    <div className="flex gap-2 whitespace-nowrap h-fit">
                      {(item.status == "In Progress" ||
                        item.status == "Completed") && (
                        <BadgeComponent status={item.status} />
                      )}
                    </div>
                  </div>
                ),
                children: (
                  <div>
                    <h1 className="font-[700] text-[20px] text-[#0E0E0E] mb-1">
                      Project Details
                    </h1>
                    <div className="text-[16px] text-[#002333] mb-3">
                      <QuillEditor
                        readOnly
                        value={`<p>Pellentesque nibh porta facilisis nunc. Amet vulputate ornare varius ultricies tellus duis fringilla interdum. Dolor cursus suspendisse eget parturient blandit volutpat nulla duis elit. Ut varius malesuada velit lacus fringilla posuere aliquam. Sed eu nunc urna sagittis lacinia. Eget ac amet purus ultrices faucibus tellus commodo. Nec aliquam et sed elit tortor et commodo non facilisi. Et risus sit quisque vel porttitor eu augue nibh sagittis. Condimentum egestas leo viverra iaculis arcu amet</p>`}
                      />
                    </div>
                    <Form.Item
                      className="!mb-0"
                      name={["milestones", index, "tasks"]}
                    >
                      <Checkbox.Group className="w-full">
                        <div className="flex flex-col border border-[#C8C8C8] p-[10px] rounded-[12px] gap-3 w-full">
                          {item.tasks.map((task, i) => (
                            <div key={i} className="flex flex-col gap-3">
                              <Checkbox
                                prefixCls="custom-checkbox"
                                value={task}
                              >
                                {task}
                              </Checkbox>
                              {i !== item.tasks.length - 1 && (
                                <div className="border-b border-[#C8C8C8]"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Checkbox.Group>
                    </Form.Item>

                    <div className="flex justify-between">
                      <p className="text-sm my-2">Note</p>
                      <p className="text-xs my-2 text-[#9F9F9F]">
                        Max 1000 characters{" "}
                      </p>
                    </div>
                    <Form.Item
                      className="!mb-0"
                      name={["milestones", index, "note"]}
                    >
                      <TextArea
                        placeholder="Please write your points..."
                        rows={4}
                        maxLength={1000}
                        draggable={false}
                      />
                    </Form.Item>

                    <p className="text-sm my-2">Documents (max 5)</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <Dragger
                        name="file"
                        multiple={false}
                        showUploadList={false}
                        beforeUpload={handleBeforeUpload}
                        customRequest={({ onSuccess }) =>
                          onSuccess && onSuccess("ok")
                        }
                        onChange={handleFileChange}
                        accept=".pdf"
                        disabled={fileList.length >= 5}
                        className="min-h-[68px]"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center">
                            <Uploadicon />
                          </div>
                          <div>
                            <p className="text-[#956DFF] font-semibold text-sm">
                              Click to Upload Document
                            </p>
                            <p className="ant-upload-hint">
                              Max. File size: 25 MB
                            </p>
                          </div>
                        </div>
                      </Dragger>

                      {fileList.map((file, index) => (
                        <div
                          key={index}
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: 8,
                            padding: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <FilePdfOutlined
                            style={{ fontSize: 18, color: "#5B3EFF" }}
                          />
                          <div className="flex-1 ml-3">
                            <Text strong className="text-xs">
                              {file.name.length > 15
                                ? file.name.slice(0, 12) + "..."
                                : file.name}
                            </Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              PDF • {(file.size / 1024).toFixed(0)} KB
                            </Text>
                          </div>
                          <CloseCircleFilled
                            style={{ color: "red", cursor: "pointer" }}
                            onClick={() => removeFile(index)}
                          />
                        </div>
                      ))}
                    </div>
                    <div
                      className={`justify-end mt-3 ${
                        item.status !== "Completed" ? "flex" : "hidden"
                      }`}
                    >
                      <CommonButton
                        onClick={() => handleMarkComplete(item, index)}
                        text="Submit"
                        className="py-[5px] !rounded-[6px] text-white !bg-secondary w-[10%]"
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        ))}
      </div>
    </Form>
  );
};

export default AssignmentDetailsFormCollapse;
