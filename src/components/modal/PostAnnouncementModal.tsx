"use client";

import React, { useEffect, useState } from "react";
import { Form, Modal, Select, Input, Checkbox, DatePicker } from "antd";
import { useForm } from "antd/es/form/Form";
import CommonButton from "../CommonButton";
import { getAllCoursesApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import dayjs from "dayjs";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { CloseOutlined, SoundOutlined, CalendarOutlined } from "@ant-design/icons";

interface CourseItem {
  course_id: string;
  course_name: string;
  head_teacher_id?: string;
  batch?: Array<{
    _id: string;
    batchName: string;
  }>;
}

interface BatchItem {
  _id: string;
  batchName: string;
}

interface FormValues {
  courseId: string;
  batchId?: string;
  title: string;
  message: string;
  isScheduled?: boolean;
  scheduledAt?: dayjs.Dayjs | null;
}

interface PostAnnouncementModalProps {
  postAnnouncement: boolean;
  setPostAnnouncement: (open: boolean) => void;
  handlePostAnnouncement: (values: Record<string, unknown>, status: "published" | "draft") => Promise<void>;
  loading?: boolean;
  editData?: AnnouncementPayload | null;
}

const PostAnnouncementModal: React.FC<PostAnnouncementModalProps> = ({
  postAnnouncement,
  setPostAnnouncement,
  handlePostAnnouncement,
  loading = false,
  editData = null,
}) => {
  const [form] = useForm<FormValues>();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [clickedSubmitType, setClickedSubmitType] = useState<"published" | "draft" | null>(null);

  // Reset submit type when modal visibility or loading state changes
  useEffect(() => {
    if (!postAnnouncement || !loading) {
      setClickedSubmitType(null);
    }
  }, [postAnnouncement, loading]);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await getAllCoursesApi();
        if (res?.status && res?.data?.course_list) {
          setCourses(res.data.course_list as CourseItem[]);
        } else {
          toast.error(res?.message || "Failed to fetch courses");
        }
      } catch (err) {
        console.error("Error fetching courses for announcements:", err);
      } finally {
        setCoursesLoading(false);
      }
    };
    if (postAnnouncement) {
      fetchCourses();
    }
  }, [postAnnouncement]);

  const role = useSelector((state: RootState) => state.userdata?.role_name);
  const teacherId = useSelector(
    (state: RootState) =>
      state.userdata?.instructor_id ||
      state.userdata?.teacherId ||
      state.userdata?.teacher_id
  );
  const isTeacherRole = role === "teacher";
  const currentCourseId = Form.useWatch("courseId", form);
  const selectedCourse = courses.find((c) => c.course_id === currentCourseId);
  const canTargetAllBatches =
    !isTeacherRole ||
    (selectedCourse &&
      String(selectedCourse.head_teacher_id) === String(teacherId));

  // Handle course change to populate batches
  const handleCourseChange = (courseId: string) => {
    const courseObj = courses.find((c) => c.course_id === courseId);
    if (courseObj && courseObj.batch) {
      setBatches(courseObj.batch);
      const isHead = String(courseObj.head_teacher_id) === String(teacherId);
      if (isTeacherRole && !isHead && courseObj.batch.length > 0) {
        form.setFieldsValue({ batchId: courseObj.batch[0]._id });
      } else {
        form.setFieldsValue({ batchId: "" });
      }
    } else {
      setBatches([]);
      form.setFieldsValue({ batchId: "" });
    }
  };

  // Prefill form in edit mode
  useEffect(() => {
    if (editData && postAnnouncement) {
      form.setFieldsValue({
        courseId: editData.courseId,
        batchId: editData.batchId || "",
        title: editData.title,
        message: editData.message,
        isScheduled: !!editData.scheduledAt,
        scheduledAt: editData.scheduledAt ? dayjs(editData.scheduledAt) : null,
      });
      setIsScheduled(!!editData.scheduledAt);

      const selectedCourse = courses.find((c) => c.course_id === editData.courseId);
      if (selectedCourse && selectedCourse.batch) {
        setBatches(selectedCourse.batch);
      }
    } else if (postAnnouncement) {
      form.resetFields();
      setIsScheduled(false);
      setBatches([]);
    }
  }, [editData, postAnnouncement, courses, form]);

  const onFinish = async (values: FormValues, status: "published" | "draft") => {
    const payload: Record<string, unknown> = {
      courseId: values.courseId,
      batchId: values.batchId || null,
      title: values.title,
      message: values.message,
      status,
      scheduledAt: values.isScheduled && values.scheduledAt ? values.scheduledAt.format("YYYY-MM-DD") : null,
    };
    await handlePostAnnouncement(payload, status);
  };

  return (
    <Modal
      open={postAnnouncement}
      onCancel={() => setPostAnnouncement(false)}
      footer={false}
      closable={false}
      width={600}
      centered
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <SoundOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {editData ? "Edit Announcement" : "Post Announcement"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Broadcast updates, deadlines, or messages to your students
              </p>
            </div>
          </div>
          <button
            onClick={() => setPostAnnouncement(false)}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            setClickedSubmitType("published");
            onFinish(values, "published");
          }}
          className="w-full flex flex-col gap-4"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-4">
            {/* Course & Batch in responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="courseId"
                label={<span className="text-xs font-semibold text-slate-700">Course</span>}
                rules={[{ required: true, message: "Course is required" }]}
                className="!mb-0"
              >
                <Select
                  loading={coursesLoading}
                  placeholder="Select course"
                  className="w-full !h-[42px]"
                  onChange={handleCourseChange}
                  options={courses.map((c) => ({
                    label: c.course_name,
                    value: c.course_id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="batchId"
                label={
                  <span className="text-xs font-semibold text-slate-700">
                    Batch {!canTargetAllBatches ? "(Required)" : "(Optional)"}
                  </span>
                }
                rules={
                  !canTargetAllBatches
                    ? [{ required: true, message: "Please select a batch" }]
                    : []
                }
                className="!mb-0"
              >
                <Select
                  placeholder={
                    canTargetAllBatches ? "All Batches (Whole Course)" : "Select Batch"
                  }
                  className="w-full !h-[42px]"
                  options={[
                    ...(canTargetAllBatches
                      ? [{ label: "All Batches (Whole Course)", value: "" }]
                      : []),
                    ...batches.map((b) => ({
                      label: b.batchName,
                      value: b._id,
                    })),
                  ]}
                />
              </Form.Item>
            </div>

            {/* Title */}
            <Form.Item
              name="title"
              label={<span className="text-xs font-semibold text-slate-700">Subject / Title</span>}
              rules={[{ required: true, message: "Subject title is required" }]}
              className="!mb-0"
            >
              <Input
                placeholder="e.g. Midterm Exam Schedule Update"
                className="!h-[42px] !rounded-xl"
              />
            </Form.Item>

            {/* Message */}
            <Form.Item
              name="message"
              label={<span className="text-xs font-semibold text-slate-700">Announcement Content</span>}
              rules={[{ required: true, message: "Message is required" }]}
              className="!mb-0"
            >
              <Input.TextArea
                placeholder="Write your announcement details here..."
                rows={4}
                className="!rounded-xl text-sm"
              />
            </Form.Item>

            {/* Schedule Checkbox & Date */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
              <Form.Item name="isScheduled" valuePropName="checked" className="!mb-0">
                <Checkbox
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="text-xs font-medium text-slate-700"
                >
                  Schedule this announcement for a future date
                </Checkbox>
              </Form.Item>

              {isScheduled && (
                <Form.Item
                  name="scheduledAt"
                  label={<span className="text-xs font-semibold text-slate-700">Publish Date</span>}
                  rules={[{ required: true, message: "Schedule date is required" }]}
                  className="!mb-0"
                >
                  <DatePicker
                    suffixIcon={<CalendarOutlined />}
                    className="w-full !h-[42px] !rounded-xl"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                  />
                </Form.Item>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPostAnnouncement(false)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              onClick={() => {
                setClickedSubmitType("draft");
                form
                  .validateFields()
                  .then((values) => onFinish(values, "draft"))
                  .catch((info) => {
                    console.log("Validate Failed:", info);
                    setClickedSubmitType(null);
                  });
              }}
              loading={loading && clickedSubmitType === "draft"}
              disable={loading}
              text={editData ? "Save Draft" : "Save as Draft"}
              className="!bg-slate-100 !text-slate-700 hover:!bg-slate-200 border-none !py-2.5 !px-5 !rounded-xl font-semibold text-sm"
            />
            <CommonButton
              type="submit"
              loading={loading && clickedSubmitType === "published"}
              disable={loading}
              text={editData ? "Publish Now" : "Post Announcement"}
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default PostAnnouncementModal;
