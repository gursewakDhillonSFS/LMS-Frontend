"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Switch,
  Tooltip,
  message,
} from "antd";
import {
  VideoCameraOutlined,
  CloseOutlined,
  LinkOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
  CopyOutlined,
  CheckOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { getAllCoursesApi } from "@/services/collections";

const { TextArea } = Input;
const { Option } = Select;

interface BatchItem {
  _id: string;
  batchName: string;
  startDate?: string;
  endDate?: string;
}

interface CourseItem {
  course_id: string;
  course_name: string;
  batch?: BatchItem[];
}

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
  const [form] = Form.useForm();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<BatchItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [meetingProvider, setMeetingProvider] = useState<"inapp" | "gmeet" | "zoom" | "custom">("inapp");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch courses on open
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedCourseId("");
      setSelectedBatchId("");
      setAvailableBatches([]);
      return;
    }

    let isMounted = true;
    (async () => {
      setFetchingCourses(true);
      try {
        const params = new URLSearchParams();
        params.append("size", "100");
        const res = await getAllCoursesApi(params);
        const rawList =
          res?.data?.course_list ||
          res?.data?.courses ||
          (Array.isArray(res?.data) ? res.data : []);
        const list: CourseItem[] = Array.isArray(rawList)
          ? rawList.map((c: any) => ({
              course_id: String(c.course_id || c._id || ""),
              course_name: c.course_name || "Course",
              batch: Array.isArray(c.batch)
                ? c.batch.map((b: any) => ({
                    _id: String(b._id),
                    batchName: b.batchName || "Batch",
                    startDate: b.startDate,
                    endDate: b.endDate,
                  }))
                : [],
            }))
          : [];

        if (isMounted) {
          setCourses(list);
        }
      } catch (err) {
        console.error("Failed to load courses for scheduler:", err);
        if (isMounted) setCourses([]);
      } finally {
        if (isMounted) setFetchingCourses(false);
      }
    })();

    // Set default initial values
    form.setFieldsValue({
      date: dayjs().add(1, "day"),
      startTime: dayjs().set("hour", 10).set("minute", 0),
      endTime: dayjs().set("hour", 11).set("minute", 0),
      notifyStudents: true,
    });

    return () => {
      isMounted = false;
    };
  }, [open, form]);

  // Handle Course Change -> update batch dropdown
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedBatchId("");
    form.setFieldsValue({ batchId: undefined });

    const safeCourses = Array.isArray(courses) ? courses : [];
    const found = safeCourses.find((c) => String(c.course_id) === String(courseId));
    const batches = Array.isArray(found?.batch) ? found.batch : [];
    setAvailableBatches(batches);

    // If only one batch exists, auto-select it
    if (batches.length === 1) {
      const singleBatch = batches[0]._id;
      setSelectedBatchId(singleBatch);
      form.setFieldsValue({ batchId: singleBatch });
      generateMeetingLink(courseId, singleBatch, meetingProvider);
    } else {
      generateMeetingLink(courseId, "", meetingProvider);
    }
  };

  // Handle Batch Change
  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    generateMeetingLink(selectedCourseId, batchId, meetingProvider);
  };

  // Dynamic meeting link generator
  const generateMeetingLink = (
    cId: string,
    bId: string,
    provider: "inapp" | "gmeet" | "zoom" | "custom"
  ) => {
    if (provider === "custom") return;

    let link = "";
    const rand = Math.random().toString(36).substring(2, 7);
    const cleanCourse = cId ? cId.slice(-6) : "class";
    const cleanBatch = bId ? bId.slice(-4) : "session";

    if (provider === "inapp") {
      // Secure zero-install in-app WebRTC classroom link
      link = `https://meet.jit.si/LMS-Live-${cleanCourse}-${cleanBatch}-${rand}`;
    } else if (provider === "gmeet") {
      link = `https://meet.google.com/new`;
    } else if (provider === "zoom") {
      link = `https://zoom.us/join`;
    }

    form.setFieldsValue({ meetingLink: link });
  };

  // Provider selector change
  const handleProviderSelect = (prov: "inapp" | "gmeet" | "zoom" | "custom") => {
    setMeetingProvider(prov);
    generateMeetingLink(selectedCourseId, selectedBatchId, prov);
  };

  // Copy link helper
  const handleCopyLink = () => {
    const currentLink = form.getFieldValue("meetingLink");
    if (!currentLink) return;
    navigator.clipboard.writeText(currentLink);
    setCopied(true);
    message.success("Meeting link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit form
  const handleFormFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const formattedDate = values.date ? dayjs(values.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const startTimeStr = values.startTime ? dayjs(values.startTime).format("HH:mm") : "10:00";
      const endTimeStr = values.endTime ? dayjs(values.endTime).format("HH:mm") : "11:00";

      const payload = {
        title: values.title?.trim() || "Live Interactive Session",
        description: values.description?.trim() || "",
        date: formattedDate,
        startTime: startTimeStr,
        endTime: endTimeStr,
        courseId: values.courseId,
        batchId: values.batchId || null,
        meetingLink: values.meetingLink?.trim() || "",
        notifyStudents: values.notifyStudents ?? true,
      };

      if (onSubmit) {
        await onSubmit(payload);
      }
      form.resetFields();
      onClose();
    } catch (err: any) {
      console.error("Error submitting live class schedule:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={560}
      centered
      destroyOnClose
      className="schedule-live-class-modal"
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <VideoCameraOutlined className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Schedule Live Class
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up a video meeting and notify enrolled students
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-sm" />
          </button>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormFinish}
          requiredMark={false}
          className="w-full flex flex-col space-y-3.5"
        >
          {/* Row 1: Course & Batch Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Form.Item
              name="courseId"
              label={
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Select Course <span className="text-rose-500">*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select a course" }]}
              className="!mb-0"
            >
              <Select
                placeholder="Choose a course"
                loading={fetchingCourses}
                onChange={handleCourseChange}
                className="w-full !h-10"
                showSearch
                filterOption={(input, option) =>
                  String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {(Array.isArray(courses) ? courses : []).map((c) => (
                  <Option key={c.course_id} value={c.course_id}>
                    {c.course_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="batchId"
              label={
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Select Batch <span className="text-rose-500">*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select a batch" }]}
              className="!mb-0"
            >
              <Select
                placeholder={selectedCourseId ? "Choose target batch" : "Select course first"}
                disabled={!selectedCourseId}
                onChange={handleBatchChange}
                className="w-full !h-10"
              >
                {(Array.isArray(availableBatches) ? availableBatches : []).map((b) => (
                  <Option key={b._id} value={b._id}>
                    {b.batchName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Row 2: Live Class Title */}
          <Form.Item
            name="title"
            label={
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                Session Title <span className="text-rose-500">*</span>
              </span>
            }
            rules={[{ required: true, message: "Please provide a session title" }]}
            className="!mb-0"
          >
            <Input
              placeholder="e.g. Masterclass: Real-time Architecture & Q&A"
              className="!h-10 !rounded-lg text-sm"
            />
          </Form.Item>

          {/* Row 3: Date & Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Form.Item
              name="date"
              label={
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <CalendarOutlined className="text-blue-500" /> Date <span className="text-rose-500">*</span>
                </span>
              }
              rules={[{ required: true, message: "Required" }]}
              className="!mb-0"
            >
              <DatePicker
                format="YYYY-MM-DD"
                className="w-full !h-10 !rounded-lg"
                disabledDate={(curr) => curr && curr < dayjs().startOf("day")}
              />
            </Form.Item>

            <Form.Item
              name="startTime"
              label={
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <ClockCircleOutlined className="text-blue-500" /> Start Time
                </span>
              }
              rules={[{ required: true, message: "Required" }]}
              className="!mb-0"
            >
              <TimePicker format="HH:mm" minuteStep={5} className="w-full !h-10 !rounded-lg" />
            </Form.Item>

            <Form.Item
              name="endTime"
              label={
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <ClockCircleOutlined className="text-blue-500" /> End Time
                </span>
              }
              rules={[{ required: true, message: "Required" }]}
              className="!mb-0"
            >
              <TimePicker format="HH:mm" minuteStep={5} className="w-full !h-10 !rounded-lg" />
            </Form.Item>
          </div>

          {/* Meeting Room Generator Section */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ThunderboltFilled className="text-amber-500" />
                Meeting Provider & Link Generator
              </label>
              <span className="text-[11px] text-slate-500">Instant launch & join</span>
            </div>

            {/* Provider presets */}
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleProviderSelect("inapp")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center cursor-pointer ${
                  meetingProvider === "inapp"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                In-App Classroom
              </button>
              <button
                type="button"
                onClick={() => handleProviderSelect("gmeet")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center cursor-pointer ${
                  meetingProvider === "gmeet"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                Google Meet
              </button>
              <button
                type="button"
                onClick={() => handleProviderSelect("zoom")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center cursor-pointer ${
                  meetingProvider === "zoom"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                Zoom
              </button>
              <button
                type="button"
                onClick={() => handleProviderSelect("custom")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center cursor-pointer ${
                  meetingProvider === "custom"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                Custom URL
              </button>
            </div>

            {/* Meeting Link input with actions */}
            <Form.Item
              name="meetingLink"
              rules={[{ required: true, message: "Please provide or generate a meeting link" }]}
              className="!mb-0"
            >
              <Input
                prefix={<LinkOutlined className="text-slate-400 mr-1" />}
                suffix={
                  <div className="flex items-center gap-1">
                    <Tooltip title={copied ? "Copied!" : "Copy Link"}>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer transition-colors"
                      >
                        {copied ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                      </button>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => generateMeetingLink(selectedCourseId, selectedBatchId, meetingProvider)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded cursor-pointer transition-colors ml-1"
                    >
                      Regenerate
                    </button>
                  </div>
                }
                placeholder="https://meet.jit.si/LMS-..."
                className="!h-10 !rounded-lg text-xs font-mono"
              />
            </Form.Item>
          </div>

          {/* Row 4: Description / Agenda */}
          <Form.Item
            name="description"
            label={
              <span className="text-xs font-semibold text-slate-700">
                Agenda / Notes for Students (Optional)
              </span>
            }
            className="!mb-0"
          >
            <TextArea
              rows={2}
              placeholder="Key concepts to cover, prerequisite materials, or live exercises..."
              className="!rounded-lg text-xs"
            />
          </Form.Item>

          {/* Row 5: Notify Students Switch */}
          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-2">
              <GlobalOutlined className="text-blue-600 text-sm" />
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  Announce to Batch Students
                </p>
                <p className="text-[11px] text-slate-500">
                  Broadcast live class schedule to enrolled students
                </p>
              </div>
            </div>
            <Form.Item name="notifyStudents" valuePropName="checked" noStyle>
              <Switch size="small" defaultChecked />
            </Form.Item>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || submitting}
              className="!bg-[#315CFF] hover:!bg-[#2546D9] !h-9 text-white !py-2 !px-5 !rounded-xl font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              <VideoCameraOutlined />
              Schedule Session
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ScheduleLiveClassModal;
