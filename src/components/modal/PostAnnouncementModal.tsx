import React, { useEffect, useState } from "react";
import { CloseIcon } from "@/utils/icons";
import { Form, Modal, Select, Input, Checkbox, DatePicker } from "antd";
import { useForm } from "antd/es/form/Form";
import CommonButton from "../CommonButton";
import { getAllCoursesApi } from "@/services/collections";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";

interface CourseItem {
  course_id: string;
  course_name: string;
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

  // Handle course change to populate batches
  const handleCourseChange = (courseId: string) => {
    const selectedCourse = courses.find((c) => c.course_id === courseId);
    if (selectedCourse && selectedCourse.batch) {
      setBatches(selectedCourse.batch);
    } else {
      setBatches([]);
    }
    form.setFieldsValue({ batchId: "" });
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

      // Populate batches for the course
      const selectedCourse = courses.find((c) => c.course_id === editData.courseId);
      if (selectedCourse && selectedCourse.batch) {
        setBatches(selectedCourse.batch);
      }
    } else if (postAnnouncement) {
      form.resetFields();
      setIsScheduled(false);
      setBatches([]);
    }
  }, [editData, postAnnouncement, courses]);

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
      width={550}
      centered
      className="relative"
    >
      <button
        onClick={() => setPostAnnouncement(false)}
        className="cursor-pointer absolute w-[30px] h-[30px] bg-slate-900 rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm hover:bg-slate-800 transition-colors shadow"
      >
        <CloseIcon />
      </button>

      <div className="p-2">
        <h2 className="font-bold text-2xl text-slate-800 mb-6 text-center">
          {editData ? "📝 Edit Announcement" : "📢 Post Announcement"}
        </h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            setClickedSubmitType("published");
            onFinish(values, "published");
          }}
          className="w-full"
        >
          {/* Select Course */}
          <Form.Item
            name="courseId"
            label={<span className="font-semibold text-slate-700">Course</span>}
            rules={[{ required: true, message: "Course is required" }]}
          >
            <Select
              loading={coursesLoading}
              placeholder="--Select Course--"
              className="w-full !h-[44px]"
              onChange={handleCourseChange}
              options={courses.map((c) => ({
                label: c.course_name,
                value: c.course_id,
              }))}
            />
          </Form.Item>

          {/* Select Batch */}
          <Form.Item
            name="batchId"
            label={<span className="font-semibold text-slate-700">Select Batch (Optional)</span>}
          >
            <Select
              placeholder="--All Batches--"
              className="w-full !h-[44px]"
              options={[
                { label: "All Batches (Whole Course)", value: "" },
                ...batches.map((b) => ({
                  label: b.batchName,
                  value: b._id,
                })),
              ]}
            />
          </Form.Item>

          {/* Title */}
          <Form.Item
            name="title"
            label={<span className="font-semibold text-slate-700">Subject / Title</span>}
            rules={[{ required: true, message: "Subject title is required" }]}
          >
            <Input placeholder="Enter title" className="!h-[44px] !rounded-lg" />
          </Form.Item>

          {/* Message */}
          <Form.Item
            name="message"
            label={<span className="font-semibold text-slate-700">Announcement Message</span>}
            rules={[{ required: true, message: "Message is required" }]}
          >
            <Input.TextArea
              placeholder="Enter announcement message..."
              rows={4}
              className="!rounded-lg"
            />
          </Form.Item>

          {/* Schedule announcement checkbox */}
          <Form.Item name="isScheduled" valuePropName="checked" className="!mb-4">
            <Checkbox onChange={(e) => setIsScheduled(e.target.checked)}>
              Schedule this announcement for a future date
            </Checkbox>
          </Form.Item>

          {/* Schedule Date */}
          {isScheduled && (
            <Form.Item
              name="scheduledAt"
              label={<span className="font-semibold text-slate-700">Date</span>}
              rules={[{ required: true, message: "Schedule date is required" }]}
            >
              <DatePicker
                className="w-full !h-[44px] !rounded-lg"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf("day")}
              />
            </Form.Item>
          )}

          {/* Submit buttons */}
          <div className="flex justify-end items-center gap-3 border-t border-slate-100 pt-4 mt-6">
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
              className="!bg-slate-100 !text-slate-700 hover:!bg-slate-200 border-none px-6"
            />
            <CommonButton
              type="submit"
              loading={loading && clickedSubmitType === "published"}
              disable={loading}
              text={editData ? "Publish Now" : "Post Announcement"}
              className="!bg-secondary text-white px-6"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default PostAnnouncementModal;
