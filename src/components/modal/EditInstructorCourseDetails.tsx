"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Row, Col } from "antd";
import useCategories from "@/hooks/useCategories";
import useInstructor from "@/hooks/useInstructor";
import {
  CourseInfoDataProp,
  CreateCourseStep1Prop,
  EditCourseFormValues,
} from "@/utils/interface";
import { renderFormItem } from "@/utils/commonFunctions";
import Image from "next/image";
import { Fallback } from "@/utils/images";
import { getImageUrl } from "@/utils/comman";
import QuillEditor from "@/components/QuillEditor";
import CommonButton from "../CommonButton";
import {
  updateCourseStep1,
  updateCourseStep2,
  updateCourseStep3,
  updateCourseStep4,
  updateCourseStep5,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import {
  CloseOutlined,
  DollarOutlined,
  DeleteOutlined,
  PlusOutlined,
  CameraOutlined,
  AppstoreOutlined,
  ReadOutlined,
  UserOutlined,
  CheckSquareOutlined,
  TrophyOutlined,
  MenuOutlined,
} from "@ant-design/icons";

export interface EditInstructorCourseDetailsProps {
  visible: boolean;
  type: string;
  onCancel: () => void;
  courseInfo: CourseInfoDataProp | undefined;
  fetchCourseInfo: () => Promise<void>;
}

const EditInstructorCourseDetails: React.FC<
  EditInstructorCourseDetailsProps
> = ({ visible, onCancel, type, courseInfo, fetchCourseInfo }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { data: category, loading: categoryLoading } = useCategories();
  const skillOptions = category.map((cat: { category_name: string }) => ({
    label: cat.category_name,
    value: cat.category_name,
  }));
  const { data: instructor, loading: instructorLoading } = useInstructor();
  const liveClassesValue = Form.useWatch("live_classes", form);
  const courseTypeValue = Form.useWatch("course_type", form);
  const [batch, setBatch] = useState<
    { batchName: string; teacher: string | null }[]
  >([]);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        console.error("Only image files are allowed.");
        return;
      }

      const fileURL = URL.createObjectURL(file);
      setProfilePhoto(fileURL);
      setPhotoFile(file);
      setImgError(false);
    }
  };

  const step1Fields: CreateCourseStep1Prop[] = [
    {
      key: "course_name",
      label: "Course Name",
      type: "input",
      placeholder: "Enter course title",
      colSpan: 24,
    },
    {
      key: "head_teacher",
      label: "Lead Instructor",
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
      label: "Pricing Type",
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
      label: "Course Price ($)",
      type: "input",
      prefix: <DollarOutlined className="text-slate-400" />,
      placeholder: "Enter price",
      colSpan: 12,
      disabled: courseTypeValue === "free",
    },
    {
      key: "demo_class",
      label: "Offer free trial/demo class for this course?",
      type: "checkbox",
      colSpan: 24,
    },
    {
      key: "category_id",
      label: "Course Category",
      type: "select",
      placeholder: "--Select Option--",
      options: category,
      loading: categoryLoading,
      colSpan: 8,
    },
    {
      key: "course_schedule",
      label: "Session Timing",
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

  const handleFinish = async (values: EditCourseFormValues) => {
    if (!courseInfo?.course_id) return;
    setLoading(true);
    try {
      const course_id = courseInfo?.course_id;
      if (type === "info") {
        const payload = {
          ...values,
          course_id,
          batch: batch.filter((item) => item?.batchName?.trim().length > 0),
        };
        if (payload.course_type === "free") {
          delete payload.course_price;
        }
        const formData = new FormData();
        formData.append("courseData", JSON.stringify(payload));
        if (photoFile) {
          formData.append("photo", photoFile);
        }

        const res = await updateCourseStep1(formData);
        if (res.status) {
          toast.success(res.message);
          fetchCourseInfo();
          onCancel();
        } else {
          toast.warning(res.message);
        }
      }
      if (type === "points") {
        const { learning_points } = values;
        const payload = {
          learning_points: learning_points ?? [],
          course_id,
        };
        const res = await updateCourseStep2(payload);
        if (res.status) {
          toast.success(res.message);
          fetchCourseInfo();
          onCancel();
        } else {
          toast.warning(res.message);
        }
      }
      if (type === "skills") {
        const { skills_you_gain } = values;
        const payload = {
          skills_you_gain: skills_you_gain ?? [],
          course_id,
        };
        const res = await updateCourseStep3(payload);
        if (res.status) {
          toast.success(res.message);
          fetchCourseInfo();
          onCancel();
        } else {
          toast.warning(res.message);
        }
      }
      if (type === "about") {
        const { about_course } = values;
        const payload = {
          about_course: about_course ?? "",
          course_id,
        };
        const res = await updateCourseStep4(payload);
        if (res.status) {
          toast.success(res.message);
          fetchCourseInfo();
          onCancel();
        } else {
          toast.warning(res.message);
        }
      }
      if (type === "teacher") {
        const { instructor_id, description } = values;
        const payload = {
          instructor_id: instructor_id ?? "",
          description: description ?? "",
          course_id,
        };
        const res = await updateCourseStep5(payload);
        if (res.status) {
          toast.success(res.message);
          fetchCourseInfo();
          onCancel();
        } else {
          toast.warning(res.message);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (!courseInfo) return;

    form.setFieldsValue({
      course_name: courseInfo.course_name,
      head_teacher: courseInfo.head_teacher_id,
      duration: courseInfo.course_duration,
      course_type: courseInfo.course_price === 0 ? "free" : "paid",
      course_price: courseInfo.course_price,
      demo_class: courseInfo.demo_classes ?? false,
      category_id: courseInfo.category_id,
      course_schedule: courseInfo.course_schedule,
      live_classes: courseInfo.live_classes,
      about_course: courseInfo.about_course,
      instructor_id: courseInfo.course_instructor,
      description: courseInfo.description,
      learning_points: courseInfo.course_learning_points,
      skills_you_gain: courseInfo.skills_you_gain,
    });

    setImgError(false);
    if (courseInfo.course_image_url) {
      setProfilePhoto(getImageUrl(courseInfo.course_image_url));
    }
  }, [courseInfo, form, visible]);

  const getHeaderMeta = () => {
    switch (type) {
      case "info":
        return {
          icon: <AppstoreOutlined className="text-lg" />,
          title: "Update Course Information",
          subtitle: "Edit course title, lead instructor, pricing, and batches",
        };
      case "about":
        return {
          icon: <ReadOutlined className="text-lg" />,
          title: "About This Course",
          subtitle: "Detailed description and curriculum overview",
        };
      case "teacher":
        return {
          icon: <UserOutlined className="text-lg" />,
          title: "Meet Your Instructor",
          subtitle: "Instructor assignment and bio for this course",
        };
      case "points":
        return {
          icon: <CheckSquareOutlined className="text-lg" />,
          title: "What Students Will Learn",
          subtitle: "Key takeaways and module milestones",
        };
      case "skills":
        return {
          icon: <TrophyOutlined className="text-lg" />,
          title: "Skills Students Will Gain",
          subtitle: "Select relevant industry skill tags",
        };
      default:
        return {
          icon: <AppstoreOutlined className="text-lg" />,
          title: "Update Course Details",
          subtitle: "Make updates to course settings",
        };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={780}
      footer={false}
      closable={false}
      centered
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              {headerMeta.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {headerMeta.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={handleFinish} className="w-full flex flex-col gap-4">
          <div className="max-h-[62vh] overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-4">
            {type === "info" && (
              <>
                {/* Image Upload Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-5">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white shadow-xs">
                    <Image
                      src={
                        profilePhoto && !imgError
                          ? profilePhoto
                          : typeof Fallback === "string"
                          ? Fallback
                          : Fallback.src
                      }
                      fill
                      alt="Course Preview"
                      unoptimized
                      onError={() => setImgError(true)}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-sm text-slate-900">
                      Course Cover Thumbnail
                    </span>
                    <p className="text-xs text-slate-500">
                      Recommended aspect ratio 16:9, min 600x340px (JPG, PNG)
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer w-fit transition-colors">
                      <CameraOutlined />
                      <span>{profilePhoto ? "Change Thumbnail" : "Upload Thumbnail"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <Row gutter={[16, 0]} className="w-full">
                  {step1Fields.map((field) => (
                    <React.Fragment key={field?.key}>
                      {renderFormItem(field)}
                    </React.Fragment>
                  ))}

                  {/* Batch Section */}
                  {liveClassesValue === true && (
                    <Col span={24}>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3 mt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">Batch Management</h4>
                            <p className="text-xs text-slate-500">Assign batches and instructors</p>
                          </div>
                          <Button
                            onClick={handleAddBatch}
                            icon={<PlusOutlined />}
                            className="!border-[#315CFF] !text-[#315CFF] !rounded-lg text-xs font-semibold"
                          >
                            Add Batch
                          </Button>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          {batch.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200"
                            >
                              <Input
                                placeholder="Batch Name (e.g. Cohort Alpha)"
                                value={item.batchName}
                                onChange={(e) =>
                                  handleBatchNameChange(e.target.value, index)
                                }
                                onKeyDown={handleKeyDown}
                                className="!h-[40px] !rounded-lg text-sm"
                              />
                              <div className="w-[45%] shrink-0">
                                <Select
                                  placeholder="Select Teacher"
                                  loading={instructorLoading}
                                  value={item.teacher}
                                  onChange={(value) =>
                                    handleTeacherChange(value, index)
                                  }
                                  onKeyDown={handleKeyDown}
                                  className="w-full !h-[40px]"
                                  options={instructor}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveBatch(index)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                              >
                                <DeleteOutlined />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </>
            )}

            {type === "about" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">About this course</label>
                <Form.Item name="about_course" className="!mb-0">
                  <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[220px]">
                    <QuillEditor placeholder="Write a detailed description about this class..." />
                  </div>
                </Form.Item>
              </div>
            )}

            {type === "teacher" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Course Lead Instructor</label>
                  <Form.Item className="!mb-0" name="instructor_id">
                    <Select
                      placeholder="Select Instructor"
                      className="w-full !h-[42px]"
                      loading={instructorLoading}
                      options={instructor}
                    />
                  </Form.Item>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Instructor Bio & Notes</label>
                  <Form.Item className="!mb-0" name="description">
                    <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[180px]">
                      <QuillEditor placeholder="Write an introduction or teacher credentials..." />
                    </div>
                  </Form.Item>
                </div>
              </div>
            )}

            {type === "points" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Key Learning Points</label>
                </div>
                <Form.List name="learning_points">
                  {(fields, { add, remove }) => (
                    <div className="flex flex-col gap-2.5">
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80"
                        >
                          <MenuOutlined className="text-slate-400 cursor-grab ml-1" />
                          <Form.Item
                            {...restField}
                            name={name}
                            rules={[{ required: true, message: "Enter a learning point" }]}
                            className="w-full !mb-0"
                          >
                            <Input
                              placeholder="e.g. Master fundamental modeling techniques in Excel"
                              className="!h-[40px] !rounded-lg text-sm bg-white"
                            />
                          </Form.Item>
                          <button
                            type="button"
                            onClick={() => remove(name)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      ))}
                      <Button
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        className="!border-[#315CFF] !text-[#315CFF] !rounded-xl !h-[42px] text-sm font-semibold mt-1"
                      >
                        Add Learning Point
                      </Button>
                    </div>
                  )}
                </Form.List>
              </div>
            )}

            {type === "skills" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">Skills Students Will Gain</label>
                <Form.Item
                  className="!mb-0"
                  name="skills_you_gain"
                  rules={[{ required: true, message: "Please select at least one skill" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select categories or skill tags"
                    loading={categoryLoading}
                    className="w-full !min-h-[44px]"
                    options={skillOptions}
                  />
                </Form.Item>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              loading={loading}
              text="Update Course"
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default EditInstructorCourseDetails;
