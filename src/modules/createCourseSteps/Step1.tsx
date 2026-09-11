"use client";
import useCategories from "@/hooks/useCategories";
import useInstructor from "@/hooks/useInstructor";
import { renderFormItem } from "@/utils/commonFunctions";
import { DeleteIcon, DollarIcon } from "@/utils/icons";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { Button, Col, Form, Input, Row, Select } from "antd";
import React, { Dispatch, SetStateAction } from "react";

interface Step1Prop {
  batch: { batchName: string; teacher: string | null }[];
  setBatch: Dispatch<
    SetStateAction<{ batchName: string; teacher: string | null }[]>
  >;
}

export const Step1: React.FC<Step1Prop> = ({ batch, setBatch }) => {
  const { data: category, loading: categoryLoading } = useCategories();
  const { data: instructor, loading: instructorLoading } = useInstructor();
  const liveClassesValue = Form.useWatch("live_classes");
  const courseTypeValue = Form.useWatch("course_type");

  // const formattedCategories =
  //   category?.map((cat: Category) => ({
  //     label: cat.category_name,
  //     value: cat.category_id,
  //   })) || [];

  // const formattedInstructors =
  //   instructor?.map((inst: { name: string; instructor_id: string }) => ({
  //     label: inst.name,
  //     value: inst.instructor_id,
  //   })) || [];

  const step1Fields: CreateCourseStep1Prop[] = [
    {
      key: "course_name",
      label: "Course Name",
      type: "input",
      placeholder: "Enter organization name",
      colSpan: 24,
    },
    {
      key: "head_teacher",
      label: "Head Teacher",
      type: "select",
      placeholder: "--Select Option--",
      options: instructor,
      loading: instructorLoading,
      colSpan: 12,
    },
    {
      key: "duration",
      label: "Duration",
      type: "select",
      placeholder: "--Select Option--",
      options: [
        { label: "1 Week", value: "1_week" },
        { label: "2 Weeks", value: "2_weeks" },
        { label: "1 Month", value: "1_month" },
        { label: "3 Months", value: "3_months" },
      ],
      colSpan: 12,
    },
    {
      key: "course_type",
      label: "Course Type",
      type: "select",
      placeholder: "--Select Option--",
      options: [
        { label: "Free", value: "free" },
        { label: "Paid", value: "paid" },
      ],
      colSpan: 12,
    },
    {
      key: "course_price",
      label: "Price",
      type: "input",
      prefix: <DollarIcon />,
      placeholder: "Enter price",
      colSpan: courseTypeValue === "paid" ? 6 : 12,
      disabled: courseTypeValue === "free",
    },
    ...(courseTypeValue === "paid"
      ? [
          {
            key: "teacher_revenue_percent",
            label: "Teacher Share / Compensation (%)",
            type: "input",
            prefix: "%",
            placeholder: "20",
            colSpan: 6,
          },
        ]
      : []),
    {
      key: "demo_class",
      label: "Would you like to offer a demo class for this course?",
      type: "checkbox",
      colSpan: 24,
    },
    {
      key: "category_id",
      label: "Course Categories",
      type: "select",
      placeholder: "--Select Option--",
      options: category,
      loading: categoryLoading,
      colSpan: 8,
    },
    {
      key: "course_schedule",
      label: "Schedule",
      type: "select",
      placeholder: "--Select Option--",
      options: [
        { label: "Morning", value: "morning" },
        { label: "Evening", value: "evening" },
      ],
      colSpan: 8,
    },
    {
      key: "live_classes",
      label: "Live Classes",
      type: "select",
      placeholder: "--Select Option--",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
      colSpan: 8,
    },
  ];

  const handleAddBatch = () => {
    setBatch((prev) => [...prev, { batchName: "", teacher: null }]);
  };

  const handleRemoveBatch = (index: number) => {
    const updatedLinks = batch.filter((_, i) => i !== index);
    setBatch(updatedLinks);
  };

  const handleBatchNameChange = (value: string, index: number) => {
    const updatedLinks = [...batch];
    updatedLinks[index].batchName = value;
    setBatch(updatedLinks);
  };

  const handleTeacherChange = (value: string, index: number) => {
    const updatedLinks = [...batch];
    updatedLinks[index].teacher = value;
    setBatch(updatedLinks);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <div className="rounded-xl p-6 bg-white">
      <Row gutter={[16, 0]} className="w-full">
        {step1Fields.map((field) => {
          return (
            <React.Fragment key={field?.key}>
              {renderFormItem(field)}
            </React.Fragment>
          );
        })}
        <Col span={24}>
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-xl">Batch</h1>
              <div className="flex flex-col gap-3">
                {batch.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 w-full"
                  >
                    <Input
                      placeholder="Add Point"
                      value={item.batchName}
                      onChange={(e) =>
                        handleBatchNameChange(e.target.value, index)
                      }
                      onKeyDown={handleKeyDown}
                      className="h-12 rounded-radius-10 text-sm"
                    />
                    <div className="flex gap-1 items-center !min-w-[30%]">
                      <Select
                        placeholder="--Select Teacher--"
                        loading={instructorLoading}
                        value={item.teacher}
                        onChange={(value) => handleTeacherChange(value, index)}
                        onKeyDown={handleKeyDown}
                        className="!w-full !h-[48px] text-start !rounded-lg"
                        options={instructor}
                      />
                      {index > 0 && (
                        <div
                          className="cursor-pointer"
                          onClick={() => handleRemoveBatch(index)}
                        >
                          <DeleteIcon />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  onClick={handleAddBatch}
                  className="flex items-center justify-center text-base !border !border-secondary !text-secondary "
                >
                  Add Batch
                </Button>
              </div>
            </div>
          </Col>

      </Row>
    </div>
  );
};
