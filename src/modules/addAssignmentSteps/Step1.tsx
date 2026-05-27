import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { Row } from "antd";
import React from "react";

const step1Fields: CreateCourseStep1Prop[] = [
  {
    key: "assignmentName",
    label: "Assignment Name",
    type: "input",
    placeholder: "Enter assignment name",
    colSpan: 24,
  },
  {
    key: "dueDate",
    label: "Due Date",
    type: "date",
    placeholder: "DD/MM/YYYY",
    colSpan: 24,
    disablePastDates: true,
  },
  {
    key: "overview",
    label: "Overview",
    type: "textarea",
    placeholder: "Enter overview",
    colSpan: 24,
  },
];

const Step1 = () => {
  return (
    <div>
      <Row gutter={[16, 0]} className="w-full">
        {step1Fields.map((field) => {
          return (
            <React.Fragment key={field?.key}>
              {renderFormItem(field)}
            </React.Fragment>
          );
        })}
      </Row>
    </div>
  );
};

export default Step1;
