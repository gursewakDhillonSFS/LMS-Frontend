"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import { Step1, getWeeksFromDuration } from "@/modules/createCourseSteps/Step1";
import { Step2 } from "@/modules/createCourseSteps/Step2";
import { Step3 } from "@/modules/createCourseSteps/Step3";
import { Step4 } from "@/modules/createCourseSteps/step4";
import {
  resetCreateCourse,
  setCourseFormData,
  setCreateCourseData,
  updateCurrentStep,
} from "@/redux/slices/CreateCourseSlice";
import { RootState } from "@/redux/store";
import {
  createFinalStep,
  createStep1,
  createStep2,
  createStep3,
} from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { getImageUrl } from "@/utils/comman";
import { DraftIcon } from "@/utils/icons";
import { CheckOutlined } from "@ant-design/icons";
import { Breadcrumb, Form } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";

const items = [
  {
    title: "Courses",
    href: RoutePaths?.Courses,
  },
  {
    title: "Create Course",
  },
];

const courseSteps = [
  {
    title: "Basic Info",
    subtitle: "Course info & batches",
  },
  {
    title: "Media & Skills",
    subtitle: "Thumbnail & objectives",
  },
  {
    title: "Description",
    subtitle: "About & teacher profile",
  },
  {
    title: "Curriculum",
    subtitle: "Lessons & resources",
  },
];

const CreateCourse = () => {
  const current_step = useSelector(
    (state: RootState) => state.createCourse.current_step
  );
  const form_data = useSelector(
    (state: RootState) => state.createCourse.form_data
  );
  const [currentStep, setCurrentStep] = useState<number>(current_step || 0);
  const [isDraft, setIsDraft] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const course_id = useSelector(
    (state: RootState) => state.createCourse.course_id
  );
  const userData = useSelector((state: RootState) => state.userdata);
  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const [batch, setBatch] = useState<
    { batchName: string; teacher: string | null }[]
  >([{ batchName: "", teacher: null }]);
  const [form] = Form.useForm();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed.");
        return;
      }

      const fileURL = URL.createObjectURL(file);
      setProfilePhoto(fileURL);
      setPhotoFile(file);
    }
  };

  const handleStepSubmit = async () => {
    setSubmitLoading(true);
    try {
      const values = await form.validateFields();

      if (currentStep === 0) {
        const { course_price, teacher_revenue_percent, ...restValues } = values;
        const validBatches = batch.filter((item) => item?.batchName?.trim().length > 0);
        if (validBatches.length === 0) {
          toast.warning("Please add at least one batch before proceeding.");
          return;
        }

        const totalWeeks = getWeeksFromDuration(restValues.duration);
        const payload = {
          ...restValues,
          total_weeks: totalWeeks,
          head_teacher:
            restValues.head_teacher ||
            userData?.instructor_id ||
            userData?.teacherId ||
            undefined,
          course_price:
            restValues.course_type === "free" ? 0 : Number(course_price || 0),
          teacher_revenue_percent:
            restValues.course_type === "free"
              ? 0
              : teacher_revenue_percent !== undefined &&
                teacher_revenue_percent !== null &&
                teacher_revenue_percent !== ""
              ? Number(teacher_revenue_percent)
              : 20,
          ...(course_id ? { course_id } : {}),
          organisation_id: organization_id || undefined,
          batch: validBatches,
        };
        const response = await createStep1(payload);
        if (response.status) {
          if (isDraft) {
            toast.success("Draft Saved Successfully");
            router.push(RoutePaths?.Courses);
            return;
          }
          dispatch(setCourseFormData(payload));
          dispatch(setCreateCourseData(response?.data?.course_id));
          toast.success(response.message || "Step One Completed");
          setCurrentStep((prev) => prev + 1);
        } else {
          toast.warning(response.message || "Something went wrong");
        }
      }

      if (currentStep === 1) {
        const payload = { ...values, course_id };
        const formData = new FormData();
        formData.append("payload", JSON.stringify(payload));
        if (photoFile) formData.append("course_image", photoFile);

        const response = await createStep2(formData);
        if (response?.status) {
          if (isDraft) {
            toast.success("Draft Saved Successfully");
            router.push(RoutePaths?.Courses);
            return;
          }
          dispatch(setCourseFormData(values));
          dispatch(
            setCourseFormData({ course_image_url: response?.data?.course_image_url })
          );
          toast.success(response.message || "Step Two Completed");
          setCurrentStep((prev) => prev + 1);
        } else {
          toast.warning(response.message || "Something went wrong");
        }
      }

      if (currentStep === 2) {
        const instructorId =
          values.instructor_id ||
          form.getFieldValue("instructor_id") ||
          userData?.instructor_id ||
          userData?.teacherId;
        const payload = { ...values, instructor_id: instructorId, course_id };
        const response = await createStep3(payload);
        if (response?.status) {
          if (isDraft) {
            toast.success("Draft Saved Successfully");
            router.push(RoutePaths?.Courses);
            return;
          }
          dispatch(setCourseFormData(values));
          toast.success(response.message || "Step Three Completed");
          setCurrentStep((prev) => prev + 1);
        } else {
          toast.warning(response.message || "Something went wrong");
        }
      }

      if (currentStep === 3) {
        const payload = { course_id, ...values, course_status: isDraft ? 'draft' : 'published' };
        const response = await createFinalStep(payload);
        if (response?.status) {
          if (isDraft) {
            toast.success("Draft Saved Successfully");
            router.push(RoutePaths?.Courses);
            dispatch(resetCreateCourse());
            return;
          }
          toast.success(response.message || "Course Published");
          router.push(RoutePaths?.Courses);
          dispatch(resetCreateCourse());
        } else {
          toast.warning(response.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.error("Validation or API error:", error);
    } finally {
      setSubmitLoading(false);
      setIsDraft(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (currentStep !== undefined && currentStep !== null) {
      dispatch(updateCurrentStep(currentStep));
    }
  }, [dispatch, currentStep]);

  useEffect(() => {
    const initForm = async () => {
      const initialValues = {
        ...form_data,
      };

      form.setFieldsValue(initialValues);

      if (typeof form_data?.course_image_url === "string") {
        setProfilePhoto(getImageUrl(form_data.course_image_url));
      }

      const batchData = form_data?.batch;

      if (
        Array.isArray(batchData) &&
        batchData.length > 0 &&
        typeof batchData[0] === "object" &&
        "batchName" in batchData[0]
      ) {
        setBatch(batchData as { batchName: string; teacher: string | null }[]);
      }
    };

    initForm();
  }, [form, form_data]);

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <Breadcrumb
          separator={<span className="text-slate-400 font-bold">{">"}</span>}
          items={items}
          itemRender={(item) => <BreadcrumbItemRender item={item} />}
        />
        <CommonButton
          icon={<DraftIcon />}
          text={submitLoading && isDraft ? "Saving..." : "Save as draft"}
          loading={submitLoading && isDraft}
          disable={submitLoading}
          onClick={() => {
            setIsDraft(true);
            form.submit();
          }}
          className="!text-secondary !bg-secondary/10 hover:!bg-secondary/20 !border-0 flex-row-reverse rounded-xl"
        />
      </div>

      {/* Modern Stepper */}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-2xs">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-10 right-10 h-[2px] bg-slate-100 -z-0 hidden sm:block">
            <div
              className="h-full bg-secondary transition-all duration-500 ease-in-out"
              style={{
                width: `${(currentStep / (courseSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {courseSteps.map((s, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? "bg-secondary text-white shadow-sm ring-4 ring-secondary/15"
                      : isCurrent
                      ? "bg-white text-secondary border-2 border-secondary ring-4 ring-secondary/20 shadow-sm"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <CheckOutlined className="text-xs stroke-[2]" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="text-center hidden sm:block">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? "text-slate-900"
                        : isCompleted
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[11px] text-slate-400 hidden md:block mt-0.5">
                    {s.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <Form
        form={form}
        onFinish={handleStepSubmit}
        onFinishFailed={({ errorFields }) => {
          console.warn("Validation failed:", errorFields);
          toast.warning("Please complete all required fields.");
        }}
        className="flex flex-col gap-6"
      >
        {currentStep === 0 && <Step1 batch={batch} setBatch={setBatch} />}
        {currentStep === 1 && (
          <Step2
            profilePhoto={
              profilePhoto ||
              (typeof form_data?.course_image_url === "string"
                ? getImageUrl(form_data.course_image_url)
                : null)
            }
            setProfilePhoto={setProfilePhoto}
            handleFileChange={handleFileChange}
          />
        )}
        {currentStep === 2 && <Step3 />}
        {currentStep === 3 && <Step4 />}

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center w-full pt-4 border-t border-slate-200/80 bg-white/50 backdrop-blur-xs p-4 rounded-2xl">
          <CommonButton
            className={`border border-slate-200 !bg-white !text-slate-700 !px-6 hover:bg-slate-50 transition-all ${
              currentStep === 0 ? "invisible" : ""
            }`}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            type="button"
            text="Back"
            disable={submitLoading}
          />

          <div className="flex items-center gap-3">
            <CommonButton
              loading={submitLoading && !isDraft}
              disable={submitLoading}
              className="!px-8 !bg-secondary text-white font-semibold shadow-xs hover:opacity-95"
              type="submit"
              onClick={() => setIsDraft(false)}
              text={currentStep === 3 ? "Publish Course" : "Continue to Next Step"}
            />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CreateCourse;
