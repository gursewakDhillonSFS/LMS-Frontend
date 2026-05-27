import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { Row } from "antd";
import React from "react";

const quizFormFields: CreateCourseStep1Prop[] = [
  {
    key: "quizName",
    label: "Quiz Name",
    type: "input",
    placeholder: "Enter assignment name",
    colSpan: 24,
  },
  {
    key: "dueDate",
    label: "Due Date",
    type: "date",
    placeholder: "DD/MM/YYYY",
    colSpan: 12,
    disablePastDates: true,
  },
  {
    key: "quizType",
    label: "Type of Quizzes",
    type: "select",
    placeholder: "--Select Option--",
    options: [
      { label: "Essay", value: "essay" },
      { label: "Multiple Choice", value: "mcq" },
    ],
    colSpan: 12,
  },
  {
    key: "overview",
    label: "Overview",
    type: "textarea",
    placeholder: "Enter overview",
    colSpan: 24,
  },
  {
    key: "enableTimer",
    label: "Enable quizzes with a countdown timer",
    type: "checkbox",
    colSpan: 24,
  },
];

const Step1 = ({ enableTime }: { enableTime: boolean }) => {
  return (
    <Row gutter={[16, 0]} className="w-full">
      {quizFormFields.map((field) => {
        return (
          <React.Fragment key={field?.key}>
            {renderFormItem(field)}
          </React.Fragment>
        );
      })}
      {enableTime &&
        renderFormItem({
          key: "timer",
          label: "Timer",
          type: "time",
          placeholder: "HH:MM",
          colSpan: 24,
        })}
    </Row>
  );
};

export default Step1;
