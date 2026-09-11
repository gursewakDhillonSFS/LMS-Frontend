"use client";

import React, { useState, useEffect } from "react";
import { DatePicker, Form, Input, Modal, TimePicker, Select } from "antd";
import CommonButton from "../CommonButton";
import { useForm } from "antd/es/form/Form";
import { getAllCoursesApi, createScheduleApi, updateScheduleApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import dayjs from "dayjs";
import {
  CloseOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  BookOutlined,
} from "@ant-design/icons";

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
  centered = true,
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
      width={560}
      centered={centered}
      closable={false}
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <CalendarOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {editData ? "Edit Schedule Event" : "Add Schedule Event"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Organize calendar sessions, classes, or mentoring calls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Form Body */}
        <Form
          form={form}
          requiredMark={false}
          layout="vertical"
          onFinish={handleFormSubmit}
          className="w-full flex flex-col gap-4"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-4">
            {/* Title */}
            <Form.Item
              name="title"
              label={<span className="text-xs font-semibold text-slate-700">Event Title</span>}
              rules={[{ required: true, message: "Please enter a title" }]}
              className="!mb-0"
            >
              <Input
                className="!h-[42px] !rounded-xl text-sm"
                placeholder="e.g. Weekly Group Mentorship Session"
              />
            </Form.Item>

            {/* Description */}
            <Form.Item
              name="description"
              label={<span className="text-xs font-semibold text-slate-700">Description (Optional)</span>}
              className="!mb-0"
            >
              <TextArea
                className="!rounded-xl text-sm"
                rows={3}
                placeholder="Enter event overview, topics, or instructions..."
              />
            </Form.Item>

            {/* Course & Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="courseId"
                label={<span className="text-xs font-semibold text-slate-700">Course (Optional)</span>}
                className="!mb-0"
              >
                <Select
                  placeholder="Select Course"
                  className="w-full !h-[42px]"
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

              <Form.Item
                name="batchId"
                label={<span className="text-xs font-semibold text-slate-700">Batch (Optional)</span>}
                className="!mb-0"
              >
                <Select
                  placeholder="Select Batch"
                  className="w-full !h-[42px]"
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

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item
                name="date"
                label={<span className="text-xs font-semibold text-slate-700">Date</span>}
                rules={[{ required: true, message: "Please select a date" }]}
                className="!mb-0"
              >
                <DatePicker
                  suffixIcon={<CalendarOutlined />}
                  className="w-full !h-[42px] !rounded-xl"
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item
                name="startTime"
                label={<span className="text-xs font-semibold text-slate-700">Start Time</span>}
                rules={[{ required: true, message: "Start time required" }]}
                className="!mb-0"
              >
                <TimePicker
                  suffixIcon={<ClockCircleOutlined />}
                  className="w-full !h-[42px] !rounded-xl"
                  format="HH:mm"
                  placeholder="Start Time"
                />
              </Form.Item>

              <Form.Item
                name="endTime"
                label={<span className="text-xs font-semibold text-slate-700">End Time</span>}
                rules={[{ required: true, message: "End time required" }]}
                className="!mb-0"
              >
                <TimePicker
                  suffixIcon={<ClockCircleOutlined />}
                  className="w-full !h-[42px] !rounded-xl"
                  format="HH:mm"
                  placeholder="End Time"
                />
              </Form.Item>
            </div>

            {/* Meeting Link */}
            <Form.Item
              name="meetingLink"
              label={<span className="text-xs font-semibold text-slate-700">Meeting Link (Optional)</span>}
              className="!mb-0"
            >
              <Input
                prefix={<LinkOutlined className="text-slate-400" />}
                className="!h-[42px] !rounded-xl text-sm"
                placeholder="https://meet.google.com/xyz or Zoom URL"
              />
            </Form.Item>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              text={editData ? "Update Schedule" : "Schedule Event"}
              loading={loading}
              disable={loading}
              type="submit"
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ScheduleModalForm;
