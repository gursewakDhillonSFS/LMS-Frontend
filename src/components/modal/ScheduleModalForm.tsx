"use client";
import { CalendarIcon2, ClockWheelIcon, CloseIcon } from "@/utils/icons";
import React, { useState, useEffect } from "react";
import { DatePicker, Form, Input, Modal, TimePicker, Select } from "antd";
import CommonButton from "../CommonButton";
import { useForm } from "antd/es/form/Form";
import { getAllCoursesApi, createScheduleApi, updateScheduleApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

interface CourseItem {
  _id: string;
  course_name: string;
  batch?: BatchItem[];
}

interface BatchItem {
  _id: string;
  batchName: string;
}

export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  courseId?: {
    _id: string;
    course_name: string;
  };
  batchId?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  centered?: boolean;
  editData?: ScheduleEvent | null;
}

const ScheduleModalForm: React.FC<ScheduleModalProps> = ({
  open,
  onClose,
  onSuccess,
  centered = false,
  editData = null,
}) => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);

  // Load courses list on mount
  useEffect(() => {
    if (open) {
      getAllCoursesApi()
        .then((res) => {
          if (res?.status) {
            const courseList = (res.data?.course_list || []) as { course_id: string; course_name: string; batch?: BatchItem[] }[];
            setCourses(courseList.map((c) => ({
              _id: c.course_id,
              course_name: c.course_name,
              batch: c.batch,
            })));
          }
        })
        .catch((err) => {
          console.error("Error loading courses:", err);
        });
    }
  }, [open]);

  // Handle editData and courses population
  useEffect(() => {
    if (open) {
      if (editData) {
        form.setFieldsValue({
          title: editData.title,
          description: editData.description,
          date: editData.date ? dayjs(editData.date) : null,
          startTime: editData.startTime ? dayjs(editData.startTime, "HH:mm") : null,
          endTime: editData.endTime ? dayjs(editData.endTime, "HH:mm") : null,
          courseId: editData.courseId?._id || editData.courseId || undefined,
          batchId: editData.batchId || undefined,
          meetingLink: editData.meetingLink || "",
        });

        const courseIdVal = editData.courseId?._id || editData.courseId;
        if (courseIdVal && courses.length > 0) {
          const selectedCourse = courses.find((c) => c._id === courseIdVal);
          setBatches(selectedCourse?.batch || []);
        }
      } else {
        form.resetFields();
        setBatches([]);
      }
    }
  }, [open, editData, courses, form]);

  const handleCourseChange = (courseId: string) => {
    form.setFieldsValue({ batchId: undefined });
    if (courseId) {
      const selectedCourse = courses.find((c) => c._id === courseId);
      setBatches(selectedCourse?.batch || []);
    } else {
      setBatches([]);
    }
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        title: values.title,
        description: values.description || "",
        date: values.date ? values.date.format("YYYY-MM-DD") : null,
        startTime: values.startTime ? values.startTime.format("HH:mm") : null,
        endTime: values.endTime ? values.endTime.format("HH:mm") : null,
        courseId: values.courseId || undefined,
        batchId: values.batchId || undefined,
        meetingLink: values.meetingLink || "",
      };

      let res;
      if (editData?._id) {
        res = await updateScheduleApi(editData._id, payload);
      } else {
        res = await createScheduleApi(payload);
      }

      if (res?.success || res?.status) {
        toast.success(res.message || "Schedule saved successfully!");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.message || "Failed to save schedule");
      }
    } catch (err) {
      console.error(err);
      const error = err as { errorFields?: unknown };
      if (error?.errorFields) {
        toast.warning("Please fill all required fields correctly");
      } else {
        toast.error("An error occurred while saving schedule");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      centered={centered}
      closable={false}
      prefixCls="common-modal"
      className={`relative ${!centered && "!top-10"}`}
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-black rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm z-50 hover:bg-red-500 transition-colors"
      >
        <CloseIcon />
      </button>
      <div className="flex flex-col gap-[24px]">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {editData ? "Edit Schedule Event" : "Add Schedule"}
        </h2>
        <Form
          form={form}
          requiredMark={false}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="plus-jakarta-sans font-medium text-sm text-gray-700">
              Title
            </label>
            <Form.Item
              name="title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input
                className="!p-3 !border-[#C8C8C8] !rounded-[8px] focus:!border-secondary"
                placeholder="Enter event title"
              />
            </Form.Item>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="plus-jakarta-sans font-medium text-sm text-gray-700">
              Description (Optional)
            </label>
            <Form.Item name="description">
              <TextArea
                className="!p-3 !border-[#C8C8C8] !rounded-[8px] focus:!border-secondary"
                rows={3}
                placeholder="Enter event description details"
              />
            </Form.Item>
          </div>

          {/* Course & Batch selectors */}
          <div className="flex gap-4">
            <div className="w-1/2 flex flex-col gap-1">
              <label htmlFor="courseId" className="plus-jakarta-sans font-medium text-sm text-gray-700">
                Course (Optional)
              </label>
              <Form.Item name="courseId">
                <Select
                  placeholder="Select Course"
                  className="w-full h-[46px] rounded-[8px]"
                  onChange={handleCourseChange}
                  allowClear
                >
                  {courses.map((course) => (
                    <Option key={course._id} value={course._id}>
                      {course.course_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="w-1/2 flex flex-col gap-1">
              <label htmlFor="batchId" className="plus-jakarta-sans font-medium text-sm text-gray-700">
                Batch (Optional)
              </label>
              <Form.Item name="batchId">
                <Select
                  placeholder="Select Batch"
                  className="w-full h-[46px] rounded-[8px]"
                  disabled={batches.length === 0}
                  allowClear
                >
                  {batches.map((batch) => (
                    <Option key={batch._id} value={batch._id}>
                      {batch.batchName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="plus-jakarta-sans font-medium text-sm text-gray-700">
              Date
            </label>
            <Form.Item
              name="date"
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker
                suffixIcon={<CalendarIcon2 />}
                className="!p-3 !border-[#C8C8C8] !rounded-[8px] w-full focus:!border-secondary"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </div>

          {/* Time pickers */}
          <div className="flex flex-col gap-1">
            <label htmlFor="startTime" className="plus-jakarta-sans font-medium text-sm text-gray-700">
              Time Slot
            </label>
            <div className="flex gap-4">
              <Form.Item
                name="startTime"
                className="w-1/2"
                rules={[{ required: true, message: "Start time required" }]}
              >
                <TimePicker
                  suffixIcon={<ClockWheelIcon color="#818B9A" />}
                  className="!p-3 !border-[#C8C8C8] !rounded-[8px] w-full focus:!border-secondary"
                  format="HH:mm"
                  placeholder="Start Time"
                />
              </Form.Item>

              <Form.Item
                name="endTime"
                className="w-1/2"
                rules={[{ required: true, message: "End time required" }]}
              >
                <TimePicker
                  suffixIcon={<ClockWheelIcon color="#818B9A" />}
                  className="!p-3 !border-[#C8C8C8] !rounded-[8px] w-full focus:!border-secondary"
                  format="HH:mm"
                  placeholder="End Time"
                />
              </Form.Item>
            </div>
          </div>

          {/* Meeting/Live Lesson Link */}
          <div className="flex flex-col gap-1">
            <label htmlFor="meetingLink" className="plus-jakarta-sans font-medium text-sm text-gray-700">
              Platform Meeting/Live Call Link (Optional)
            </label>
            <Form.Item name="meetingLink">
              <Input
                className="!p-3 !border-[#C8C8C8] !rounded-[8px] focus:!border-secondary"
                placeholder="Enter Zoom, Meet, or live call URL"
              />
            </Form.Item>
          </div>

          <Form.Item className="!mb-0">
            <CommonButton
              text={editData ? "Update Schedule" : "Schedule Event"}
              loading={loading}
              disable={loading}
              type="submit"
              className="!bg-secondary text-white w-full !h-[50px] !rounded-[8px] text-base font-semibold"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ScheduleModalForm;
