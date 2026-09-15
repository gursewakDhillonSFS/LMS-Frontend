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
    <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 leading-tight">
          Basic Course Information
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure the course title, instructor, schedule, and pricing model
        </p>
      </div>

      <Row gutter={[16, 0]} className="w-full">
        {step1Fields.map((field) => {
          return (
            <React.Fragment key={field?.key}>
              {renderFormItem(field)}
            </React.Fragment>
          );
        })}

        <Col span={24}>
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Batches & Assigned Teachers
                </h3>
                <p className="text-xs text-slate-500">
                  Assign batches and optional instructors to manage student cohorts
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {batch.length} {batch.length === 1 ? "Batch" : "Batches"}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {batch.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2 w-full sm:flex-1">
                    <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      #{index + 1}
                    </span>
                    <Input
                      placeholder="e.g. Batch A - Morning Cohort"
                      value={item.batchName}
                      onChange={(e) =>
                        handleBatchNameChange(e.target.value, index)
                      }
                      onKeyDown={handleKeyDown}
                      className="!h-11 rounded-lg text-sm bg-white"
                    />
                  </div>

                  <div className="flex gap-2 items-center w-full sm:w-[320px]">
                    <Select
                      placeholder="-- Select Batch Teacher --"
                      loading={instructorLoading}
                      value={item.teacher}
                      onChange={(value) => handleTeacherChange(value, index)}
                      onKeyDown={handleKeyDown}
                      className="w-full !h-[44px] text-start !rounded-lg"
                      options={instructor}
                    />
                    {batch.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBatch(index)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Remove Batch"
                      >
                        <DeleteIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                onClick={handleAddBatch}
                className="w-full !h-11 flex items-center justify-center text-sm font-semibold !border-dashed !border-secondary !text-secondary hover:!bg-secondary/5 rounded-xl mt-1"
              >
                + Add Another Batch
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
