"use client";
import BadgeComponent from "@/components/BadgeComponent";
import CommonButton from "@/components/CommonButton";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import QuillEditor from "@/components/QuillEditor";
import {
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Select,
  TimePicker,
} from "antd";
import { Rule } from "antd/es/form";
import { CreateCourseStep1Prop } from "./interface";
import { ClockWheelIcon, DatePickerIcon } from "./icons";
import PhoneInput from "react-phone-input-2";
import React from "react";
import dayjs from "dayjs";

interface StudentTableRow {
  key: string;
  name: string;
  avatar: string;
  email: string;
  batch: string;
  progress: string;
  status: string;
}

export const studentTableColumns = [
  {
    title: "S.NO",
    dataIndex: "key",
    key: "key",
    render: (text: string, record: StudentTableRow, index: number) => index + 1,
  },
  {
    title: "Student Name",
    dataIndex: "name",
    key: "name",
    render: (text: string, record: StudentTableRow) => (
      <UserAvatarDisplay user={{ name: record.name, image: record.avatar }} />
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Batch Name",
    dataIndex: "batch",
    key: "batch",
  },
  {
    title: "Course Progress",
    dataIndex: "progress",
    key: "progress",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => <BadgeComponent status={status} />,
  },
  {
    title: "Action",
    key: "action",
    render: () => (
      <CommonButton
        text="View"
        className="!h-8 !bg-transparent border !border-secondary text-secondary"
      />
    ),
  },
];

export const instructorCourseCollapse = [
  {
    title: "S.NO",
    dataIndex: "key",
    key: "key",
    render: (text: string, record: StudentTableRow, index: number) => index + 1,
  },
  {
    title: "Student Name",
    dataIndex: "name",
    key: "name",
    render: (_: unknown, record: StudentTableRow) => (
      <UserAvatarDisplay user={{ name: record?.name, image: record.avatar }} />
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Course Progress",
    dataIndex: "progress",
    key: "progress",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => <BadgeComponent status={status} />,
  },
  {
    title: "Action",
    key: "action",
    render: () => (
      <CommonButton
        text="View"
        className="!h-8 !bg-transparent border !border-secondary text-secondary"
      />
    ),
  },
];

export const renderFormItem = (field: CreateCourseStep1Prop) => {
  const rules: Rule[] =
    field.required !== false && !field.disabled
      ? [{ required: true, message: `${field.label} is required` }]
      : [];

  let inputNode;
  switch (field.type) {
    case "input":
      inputNode = (
        <Input
          prefix={field.prefix}
          placeholder={field.placeholder}
          className="!h-[48px] !rounded-lg"
          disabled={field.disabled}
        />
      );
      break;
    case "select":
      inputNode = (
        <Select
          mode={field.mode}
          loading={field?.loading}
          placeholder={field.placeholder}
          className="w-full !h-[48px] text-start !rounded-lg"
          options={field.options}
          disabled={field.disabled}
        />
      );
      break;
    case "date":
      inputNode = (
        <DatePicker
          suffixIcon={<DatePickerIcon />}
          placeholder={field.placeholder}
          className="w-full !h-[48px] !rounded-lg"
          format="DD/MM/YYYY"
          disabled={field.disabled}
          disabledDate={
            field.disablePastDates
              ? (current) => current && current < dayjs().startOf("day")
              : undefined
          }
        />
      );
      break;
    case "phone":
      inputNode = (
        <PhoneInput
          country={"in"}
          inputStyle={{
            width: "calc(100% - 60px)",
            height: "48px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
            fontSize: "16px",
            marginLeft: "60px",
          }}
          inputClass="w-full"
          enableSearch={true}
          containerClass="w-full"
          disabled={field.disabled}
        />
      );
      break;

    case "checkbox":
      return (
        <Col key={Math.random()} span={field.colSpan}>
          <Form.Item name={field.key} valuePropName="checked" className="!mb-4">
            <Checkbox className="mt-2" disabled={field.disabled}>{field.label}</Checkbox>
          </Form.Item>
        </Col>
      );

    case "textarea":
      inputNode = (
        <QuillEditor placeholder={field.placeholder} readOnly={field.disabled} />
      );
      break;

    case "time":
      inputNode = (
        <TimePicker
          format="HH:mm"
          suffixIcon={<ClockWheelIcon color="#818B9A" />}
          needConfirm={false}
          placeholder={field.placeholder || "HH:MM"}
          className="w-full !h-[48px] !rounded-lg"
          disabled={field.disabled}
        />
      );
      break;
    default:
      inputNode = null;
  }

  return (
    <Col key={Math.random()} span={field.colSpan}>
      <label className="text-[16px]">{field.label}</label>
      {inputNode ? (
        <Form.Item className="!mb-4" name={field.key} rules={rules}>
          {inputNode}
        </Form.Item>
      ) : null}
    </Col>
  );
};

export const getRootColor = (cssVarName: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarName)
    .trim();
};
