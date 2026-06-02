"use client";

import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import Step1 from "@/modules/addAssignmentSteps/Step1";
import Step2 from "@/modules/addAssignmentSteps/Step2";
import { RoutePaths } from "@/utils/enums";
import { createAssignmentSteps2Projects } from "@/utils/interface";
import { Breadcrumb, Form, Skeleton } from "antd";
import dayjs from "dayjs";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createAssignmentApi,
  updateAssignmentApi,
  getAssignmentDetailsApi,
} from "@/services/collections";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";

const headings: { title: string; description?: string }[] = [
  {
    title: "Add Assignment",
    description: "Fill the basic details of assignment",
  },
  {
    title: "Project Details",
    description: "Fill the details of assignment project",
  },
];

const AddAssignmentInner = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";
  const assignmentId = searchParams.get("assignment_id") || "";
  const mode = searchParams.get("mode") || "create";

  const organizationId = useSelector(
    (state: RootState) => state?.userdata?.organization_id
  );

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [projects, setProjects] = useState<createAssignmentSteps2Projects[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const batchDetailsUrl = `${RoutePaths?.TeacherAssignments}/batch-details?course_id=${courseId}&batch_id=${batchId}`;

  const items = [
    { title: "Assignments", href: RoutePaths?.TeacherAssignments },
    {
      title: "Batch Assignments",
      href: batchDetailsUrl,
    },
    { title: mode === "edit" ? "Edit Assignment" : "Add Assignment" },
  ];

  // If editing, pre-fill form with existing data
  useEffect(() => {
    if (mode === "edit" && assignmentId) {
      setInitialLoading(true);
      getAssignmentDetailsApi(assignmentId)
        .then((res) => {
          if (res?.status) {
            const a = res.data;
            form.setFieldsValue({
              assignmentName: a.assignmentName,
              dueDate: a.dueDateRaw ? dayjs(a.dueDateRaw) : undefined,
              overview: a.overview,
            });
            // Map projects to step2 format
            setProjects(
              (a.projects || []).map((p: createAssignmentSteps2Projects) => ({
                projectName: p.projectName,
                description: p.description || "",
                objectives: p.objectives || [],
                enableButton: p.enableButton ?? false,
              }))
            );
          }
        })
        .catch(() => toast.error("Failed to load assignment details"))
        .finally(() => setInitialLoading(false));
    }
  }, [mode, assignmentId, form]);

  const handleFinish = async () => {
    // Guard: if Enter was pressed on Step 0, just advance — don't submit to API
    if (currentStep !== 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    try {
      await form.validateFields();
    } catch (_) {
      setCurrentStep(0);
      return;
    }

    const values = form.getFieldsValue(true);

    // Validate required context params
    if (!courseId || !batchId) {
      toast.error("Missing course or batch context. Please go back and try again.");
      return;
    }

    setLoading(true);

    // AntD DatePicker returns a dayjs object — use .toISOString() directly
    let dueDateISO: string | undefined;
    if (values.dueDate) {
      try {
        // dayjs has .toISOString(), if not fall back to new Date()
        dueDateISO =
          typeof values.dueDate.toISOString === "function"
            ? values.dueDate.toISOString()
            : new Date(values.dueDate).toISOString();
      } catch (_) {
        toast.error("Invalid due date. Please select a valid date.");
        setLoading(false);
        return;
      }
    } else {
      toast.error("Due Date is required.");
      setCurrentStep(0);
      setLoading(false);
      return;
    }

    const payload = {
      assignmentName: values.assignmentName,
      dueDate: dueDateISO,
      overview: values.overview,
      courseId,
      batchId,
      organisationId: organizationId || undefined,
      projects: projects.map((p) => ({
        projectName: p.projectName,
        description: p.description,
        objectives: p.objectives,
        enableButton: p.enableButton ?? false,
      })),
      status: "published",
    };

    try {
      let res;
      if (mode === "edit" && assignmentId) {
        res = await updateAssignmentApi(assignmentId, payload);
      } else {
        res = await createAssignmentApi(payload);
      }

      if (res?.status) {
        toast.success(
          res.message ||
            (mode === "edit"
              ? "Assignment updated successfully"
              : "Assignment created successfully")
        );
        router.push(batchDetailsUrl);
      } else {
        const msg = Array.isArray(res?.message)
          ? res.message.join(", ")
          : res?.message || "Something went wrong";
        toast.warning(msg);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const serverMsg = error?.response?.data?.message;
      const displayMsg = Array.isArray(serverMsg)
        ? serverMsg.join(", ")
        : serverMsg || "An error occurred. Please try again.";
      toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-8">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex flex-col items-center justify-center gap-6">
        {/* Progress bar */}
        <div className="w-[80%] flex gap-[5px] justify-between mb-6">
          {[0, 1].map((index) => (
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

        <div className="flex flex-col items-center gap-2">
          <p className="text-[32px] text-[#002333] font-bold leading-[120%]">
            {headings[currentStep]?.title}
          </p>
          <p className="text-[20px] text-[#6B6B6B] leading-[120%]">
            {headings[currentStep]?.description}
          </p>
        </div>

        <Form form={form}>
          <div className="rounded-xl p-6 bg-white w-[950px]">
            {currentStep === 0 && <Step1 />}
            {currentStep === 1 && (
              <Step2 projects={projects} setProjects={setProjects} />
            )}
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <CommonButton
              className={`border !bg-transparent !w-[20%] ${
                currentStep === 0 && "hidden"
              }`}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              type={"button"}
              text={"Back"}
            />

            <CommonButton
              loading={loading}
              className="!w-[20%]"
              onClick={
                currentStep === 1
                  ? handleFinish
                  : () => setCurrentStep((prev) => prev + 1)
              }
              type={"button"}
              text={
                currentStep === 1
                  ? mode === "edit"
                    ? "Update"
                    : "Publish"
                  : "Next"
              }
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

const AddAssignment = () => (
  <Suspense fallback={<Skeleton active />}>
    <AddAssignmentInner />
  </Suspense>
);

export default AddAssignment;
