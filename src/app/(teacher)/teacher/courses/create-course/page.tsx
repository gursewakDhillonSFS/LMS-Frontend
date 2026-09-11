"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import { Step1 } from "@/modules/createCourseSteps/Step1";
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
import { Breadcrumb, Form } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";

const items = [
  {
    title: "Courses",
    href: RoutePaths?.TeacherCourses,
  },
  {
    title: "Create Course",
  },
];

const headings: { title: string; description?: string }[] = [
  {
    title: "Basic Course Info",
    description: "Fill the basic details of your course",
  },
  {
    title: "Course Details",
    description: "Fill the details of your course",
  },
  {
    title: "Course Description",
    description: "Give the course a description so people know about course ",
  },
  {
    title: "Add the Lessons",
  },
];

const TeacherCreateCourse = () => {
  const current_step = useSelector(
    (state: RootState) => state.createCourse.current_step
  );
  const form_data = useSelector(
    (state: RootState) => state.createCourse.form_data
  );
  const [currentStep, setCurrentStep] = useState<number>(current_step);
  const [isDraft, setIsDraft] = useState(false);
  const course_id = useSelector(
    (state: RootState) => state.createCourse.course_id
  );
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
        console.error("Only image files are allowed.");
        return;
      }
      const fileURL = URL.createObjectURL(file);
      setProfilePhoto(fileURL);
      setPhotoFile(file);
    }
  };

  const handleStepSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (currentStep === 0) {
        const { course_price, ...restValues } = values;
        const validBatches = batch.filter((item) => item?.batchName?.trim().length > 0);
        if (validBatches.length === 0) {
          toast.warning("Please add at least one batch before proceeding.");
          return;
        }

        const payload = {
          ...restValues,
          ...(restValues.course_type === 'free' ? {} : { course_price }),
          ...(course_id ? { course_id } : {}),
          organisation_id: organization_id || undefined,
          batch: validBatches,
        };
        const response = await createStep1(payload);
        if (response.status) {
          if (isDraft) {
            toast.success("Draft Saved Successfully");
            router.push(RoutePaths?.TeacherCourses);
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
            router.push(RoutePaths?.TeacherCourses);
            return;
          }
          dispatch(setCourseFormData(values));
          dispatch(
            setCourseFormData({ course_image_url: response?.data?.course_image_url })
          );
          toast.success(response.message || "Step two Completed");
          setCurrentStep((prev) => prev + 1);
        } else {
          toast.warning(response.message || "Something went wrong");
        }
      }

      if (currentStep === 2) {
        const payload = { ...values, course_id };
        const response = await createStep3(payload);
        if (response?.status) {
          if (isDraft) {
            toast.success("Draft Saved Successfully");
            router.push(RoutePaths?.TeacherCourses);
            return;
          }
          dispatch(setCourseFormData(values));
          toast.success(response.message || "Step three Completed");
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
            router.push(RoutePaths?.TeacherCourses);
            dispatch(resetCreateCourse());
            return;
          }
          toast.success(response.message || "Course Published");
          router.push(RoutePaths?.TeacherCourses);
          dispatch(resetCreateCourse());
        } else {
          toast.warning(response.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.error("Validation or API error:", error);
    } finally {
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
    <Form
      form={form}
      onFinish={handleStepSubmit}
      onFinishFailed={({ errorFields }) => {
        console.warn("Validation failed:", errorFields);
        toast.warning("Please complete all required fields.");
      }}
      className="!flex !flex-col !gap-[24px]"
    >
      <div className="flex justify-between w-full">
        <Breadcrumb
          separator={<span className="text-[#002333] font-[700]">{">"}</span>}
          items={items}
          itemRender={(item) => <BreadcrumbItemRender item={item} />}
        />
        <CommonButton
          icon={<DraftIcon />}
          text={"Save as draft"}
          onClick={() => setIsDraft(true)}
          className="!text-secondary !bg-transparent flex-row-reverse"
        />
      </div>

      <div className="flex flex-col  gap-6">
        <div className="w-[80%] flex gap-[5px] justify-between mb-6 mx-auto">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="w-full h-[4px] bg-[#D8D8D8] rounded-full overflow-hidden"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-in-out ${
                  currentStep >= index ? "bg-secondary" : "bg-transparent"
                }`}
                style={{
                  width:
                    currentStep > index
                      ? "100%"
                      : currentStep === index
                      ? "100%"
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col  items-center justify-center gap-2">
          <p className="text-[32px] text-[#002333] font-bold leading-[120%]">
            {headings[currentStep]?.title}
          </p>
          <p className="text-[20px] text-[#6B6B6B] leading-[120%]">
            {headings[currentStep]?.description}
          </p>
        </div>

        {currentStep == 0 && <Step1 batch={batch} setBatch={setBatch} />}
        {currentStep == 1 && (
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
        {currentStep == 2 && <Step3 />}
        {currentStep == 3 && <Step4 />}
        <div className="mt-3 flex justify-center gap-2 w-full">
          <CommonButton
            className={`border !bg-transparent !w-[20%] ${
              currentStep == 0 && "hidden"
            }`}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            type={"button"}
            text={"Back"}
          />
          <CommonButton
            className="!w-[20%]"
            onClick={() => setIsDraft(false)}
            text={currentStep == 3 ? "Publish" : "Next"}
          />
        </div>
      </div>
    </Form>
  );
};

export default TeacherCreateCourse;
