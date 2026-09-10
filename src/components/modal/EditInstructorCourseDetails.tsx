import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Row, Col } from "antd";
import { CloseIcon, DeleteIcon, DollarIcon, SixDotIcon } from "@/utils/icons";
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

  console.log(loading)
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
      label: "Course Price",
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
      colSpan: 12,
      disabled: courseTypeValue === "free",
    },
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
        if (payload.course_type === 'free') {
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

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={false}
      closable={false}
      className={`!relative ${type !== "info" ? "!top-30" : "!top-10"}`}
    >
      <button
        onClick={() => {
          onCancel();
        }}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-black rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon />
      </button>
      <h1 className="text-center font-bold text-[24px] mb-4">
        Update Course Info
      </h1>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {type === "info" && (
          <>
            <div className="flex flex-col gap-2 mb-2">
              <div className="font-semibold text-xl">Course Photo</div>
              <div className="flex gap-5 items-center">
                <Image
                  src={
                    profilePhoto && !imgError
                      ? profilePhoto
                      : typeof Fallback === "string"
                      ? Fallback
                      : Fallback.src
                  }
                  width={180}
                  height={180}
                  alt="Profile"
                  unoptimized
                  onError={() => setImgError(true)}
                  className="w-[180px] h-[180px] rounded-xl object-cover "
                />
                <div className="flex flex-col gap-[12px] justify-center h-full">
                  <p className="font-semibold text-[16px] plus-jakarta-sans">
                    Choose an image from your computer
                  </p>
                  <p className="text-sm text-[#767676]">
                    Minimum size 100 x 100 px
                  </p>
                  <label className="flex items-center justify-center border cursor-pointer border-[#68B8FF] rounded-[10px] w-[120px] h-[32px] text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="!hidden"
                    />
                    <span className="text-sm text-center cursor-pointer text-[#68B8FF]">
                      {profilePhoto ? "Change Image" : "Upload Image"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <Row gutter={[16, 0]} className="mx-auto">
              {step1Fields.map((field) => {
                return (
                  <React.Fragment key={field?.key}>
                    {renderFormItem(field)}
                  </React.Fragment>
                );
              })}
              {liveClassesValue === true && (
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
                              onChange={(value) =>
                                handleTeacherChange(value, index)
                              }
                              onKeyDown={handleKeyDown}
                              className="!w-full !h-[48px] text-start !rounded-lg"
                              options={instructor}
                            />
                            <div
                              className="cursor-pointer"
                              onClick={() => handleRemoveBatch(index)}
                            >
                              <DeleteIcon />
                            </div>
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
              )}
            </Row>
          </>
        )}

        <div className="flex flex-col gap-4">
          {type === "about" && (
            <div className="flex flex-col gap-4">
              <div className="font-semibold text-xl">About this class</div>
              <Form.Item name="about_course" className="!mb-0">
                <QuillEditor placeholder="Enter text here..." />
              </Form.Item>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {type === "teacher" && (
              <>
                <div className="font-semibold text-xl">Meet your teacher</div>
                <div className="flex flex-col gap-2">
                  <p>Teacher</p>
                  <Form.Item className="!mb-0" name="instructor_id">
                    <Select
                      placeholder="--Select Option--"
                      className="w-full !h-[48px] text-start !rounded-lg"
                      loading={instructorLoading}
                      options={instructor}
                    />
                  </Form.Item>
                </div>
                <div className="flex flex-col gap-2">
                  <p>Description</p>
                  <Form.Item className="!mb-0" name="description">
                    <QuillEditor placeholder="Enter text here..." />
                  </Form.Item>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {type === "points" && (
              <>
                {" "}
                <label className="font-semibold text-xl">
                  What you&apos;ll learn
                </label>
                <Form.List name="learning_points">
                  {(fields, { add, remove }) => (
                    <div className="flex flex-col gap-3">
                      {fields.map(({ key, name, ...restField }) => (
                        <div key={key} className="flex items-center gap-3">
                          <SixDotIcon />
                          <Form.Item
                            {...restField}
                            name={name}
                            rules={[
                              { required: true, message: "Enter a point" },
                            ]}
                            className="w-full !mb-0"
                          >
                            <Input
                              placeholder="Add Point"
                              className="h-12 rounded-radius-10 text-sm"
                            />
                          </Form.Item>
                          <div
                            className="cursor-pointer"
                            onClick={() => remove(name)}
                          >
                            <DeleteIcon />
                          </div>
                        </div>
                      ))}
                      <Button
                        onClick={() => add()}
                        className="flex items-center justify-center text-base !border !border-secondary !text-secondary"
                      >
                        + Add a point
                      </Button>
                    </div>
                  )}
                </Form.List>
              </>
            )}

            {type === "skills" && (
              <div className="flex flex-col gap-2 mt-4">
                <p className="font-semibold text-base">
                  Skills you&apos;ll gain
                </p>
                <Form.Item
                  className="!mb-4"
                  name="skills_you_gain"
                  rules={[
                    { required: true, message: "Please select a skill" },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="--Select categories as skills--"
                    loading={categoryLoading}
                    className="w-full !h-[48px] text-start !rounded-lg"
                    options={skillOptions}
                  />
                </Form.Item>
              </div>
            )}
          </div>
        </div>
        <Form.Item className="!w-full !flex !justify-end !mt-3">
          <CommonButton
            text={"Update"}
            className="!bg-secondary text-white w-[100px]"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditInstructorCourseDetails;
