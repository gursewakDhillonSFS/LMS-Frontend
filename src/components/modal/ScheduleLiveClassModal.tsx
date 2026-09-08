import { CloseIcon } from "@/utils/icons";
import { Form, Modal, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import CommonButton from "../CommonButton";
import { renderFormItem } from "@/utils/commonFunctions";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { getAllCoursesApi } from "@/services/collections";

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
            placeholder: "--Select Option--",
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
            placeholder: "--Select Option--",
            options: [],
            colSpan: 24,
          },
          {
            key: "title",
            label: "Title",
            type: "text",
            placeholder: "Live class title",
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
            label: "Meeting Link",
            type: "text",
            placeholder: "https://zoom.us/...",
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
      width={400}
      className="!relative"
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-black rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon />
      </button>
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-2xl text-center">Schedule Live Class</h1>
        <Form
          form={form}
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          className="!w-full !flex !flex-col !items-center"
        >
          <Row gutter={[16, 0]} className="w-full">
            {fields.map((field) => renderFormItem(field))}
          </Row>
          <CommonButton
            text="Schedule"
            type="submit"
            loading={loading}
            className="!w-full !mt-2"
          />
        </Form>
      </div>
    </Modal>
  );
};

export default ScheduleLiveClassModal;
