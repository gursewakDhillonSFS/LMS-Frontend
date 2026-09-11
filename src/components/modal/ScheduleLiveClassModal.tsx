"use client";

import { Form, Modal, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import CommonButton from "../CommonButton";
import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { getAllCoursesApi } from "@/services/collections";
import { CloseOutlined, VideoCameraOutlined } from "@ant-design/icons";

interface ScheduleLiveClassModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  onSubmit?: (payload: Record<string, unknown>) => void | Promise<void>;
}

const ScheduleLiveClassModal: React.FC<ScheduleLiveClassModalProps> = ({
  open,
  onClose,
  loading = false,
  onSubmit,
}) => {
  const [form] = useForm();
  const [fields, setFields] = useState<CreateCourseStep1Prop[]>([]);
  const [courses, setCourses] = useState<
    { course_id: string; course_name: string; batch?: { _id: string; batchName: string }[] }[]
  >([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const params = new URLSearchParams();
        params.append("size", "100");
        const res = await getAllCoursesApi(params);
        const list = res?.data?.courses || res?.data || [];
        setCourses(list);
        setFields([
          {
            key: "courseId",
            label: "Course",
            type: "select",
            placeholder: "--Select Course--",
            options: list.map(
              (c: { course_id: string; course_name: string }) => ({
                label: c.course_name,
                value: c.course_id,
              }),
            ),
            colSpan: 24,
          },
          {
            key: "batchId",
            label: "Batch",
            type: "select",
            placeholder: "--Select Batch--",
            options: [],
            colSpan: 24,
          },
          {
            key: "title",
            label: "Live Session Title",
            type: "text",
            placeholder: "e.g. Advanced Analysis & Live Q&A",
            colSpan: 24,
          },
          {
            key: "date",
            label: "Date",
            type: "date",
            placeholder: "DD/MM/YYYY",
            colSpan: 24,
          },
          {
            key: "startTime",
            label: "Start Time",
            type: "text",
            placeholder: "10:00",
            colSpan: 12,
          },
          {
            key: "endTime",
            label: "End Time",
            type: "text",
            placeholder: "11:00",
            colSpan: 12,
          },
          {
            key: "meetingLink",
            label: "Meeting URL (Zoom, Meet)",
            type: "text",
            placeholder: "https://zoom.us/j/...",
            colSpan: 24,
          },
        ]);
      } catch {
        // ignore
      }
    })();
  }, [open]);

  const handleValuesChange = (changed: Record<string, unknown>) => {
    if (changed.courseId) {
      const course = courses.find((c) => c.course_id === changed.courseId);
      const batchOptions = (course?.batch || []).map((b) => ({
        label: b.batchName,
        value: b._id,
      }));
      setFields((prev) =>
        prev.map((f) =>
          f.key === "batchId" ? { ...f, options: batchOptions } : f,
        ),
      );
    }
  };

  const handleSubmit = async () => {
    const values = form.getFieldsValue();
    if (onSubmit) {
      await onSubmit({
        title: values.title || "Live Class",
        description: "Scheduled live class",
        date: values.date,
        startTime: values.startTime || "00:00",
        endTime: values.endTime || "23:59",
        courseId: values.courseId,
        batchId: values.batchId || "",
        meetingLink: values.meetingLink || "",
      });
      form.resetFields();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={false}
      closable={false}
      width={480}
      centered
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <VideoCameraOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Schedule Live Class
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up an interactive session with video link
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
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          className="w-full flex flex-col"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            <Row gutter={[16, 0]} className="w-full">
              {fields.map((field) => renderFormItem(field))}
            </Row>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              text="Schedule Session"
              type="submit"
              loading={loading}
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ScheduleLiveClassModal;
