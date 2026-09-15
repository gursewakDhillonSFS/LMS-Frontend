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
import { toast } from "@/utils/toast";

import { CheckOutlined } from "@ant-design/icons";

const assignmentSteps: { title: string; subtitle: string }[] = [
  {
    title: "Basic Details",
    subtitle: "Name, due date & project instructions",
  },
  {
    title: "Project Tasks & Objectives",
    subtitle: "Define projects, requirements & deliverables",
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

  const batchDetailsUrl = `${RoutePaths?.Assignments}/batch-details?course_id=${courseId}&batch_id=${batchId}`;

  const items = [
    { title: "Assignments", href: RoutePaths?.Assignments },
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
        // NestJS may return { message: string | string[] }
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
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 pb-12">
      <Breadcrumb
        separator={<span className="text-slate-400 font-bold">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      {/* Stepper Card */}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-2xs">
        <div className="flex items-center justify-around relative">
          <div className="absolute top-5 left-20 right-20 h-[2px] bg-slate-100 -z-0 hidden sm:block">
            <div
              className="h-full bg-secondary transition-all duration-500 ease-in-out"
              style={{
                width: `${currentStep * 100}%`,
              }}
            />
          </div>

          {assignmentSteps.map((s, idx) => {
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
                <div className="text-center">
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
                  <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
                    {s.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Form form={form} className="flex flex-col gap-6 w-full">
        <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs w-full">
          {currentStep === 0 && <Step1 />}
          {currentStep === 1 && (
            <Step2 projects={projects} setProjects={setProjects} />
          )}
        </div>

        <div className="flex justify-between items-center w-full pt-4 border-t border-slate-200/80 bg-white/50 backdrop-blur-xs p-4 rounded-2xl">
          <CommonButton
            className={`border border-slate-200 !bg-white !text-slate-700 !px-6 hover:bg-slate-50 transition-all ${
              currentStep === 0 ? "invisible" : ""
            }`}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            type="button"
            text="Back"
            disable={loading}
          />

          <CommonButton
            loading={loading}
            disable={loading}
            className="!px-8 !bg-secondary text-white font-semibold shadow-xs hover:opacity-95"
            onClick={
              currentStep === 1
                ? handleFinish
                : async () => {
                    try {
                      await form.validateFields();
                      setCurrentStep((prev) => prev + 1);
                    } catch (_) {}
                  }
            }
            type="button"
            text={
              currentStep === 1
                ? mode === "edit"
                  ? "Update Assignment"
                  : "Publish Assignment"
                : "Continue to Projects"
            }
          />
        </div>
      </Form>
    </div>
  );
};

const AddAssignment = () => (
  <Suspense fallback={<Skeleton active />}>
    <AddAssignmentInner />
  </Suspense>
);

export default AddAssignment;
