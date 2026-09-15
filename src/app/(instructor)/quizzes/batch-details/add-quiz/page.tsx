"use client";

import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import Step1 from "@/modules/addQuizSteps/Step1";
import Step2MCQ from "@/modules/addQuizSteps/Step2MCQ";
import { RoutePaths } from "@/utils/enums";
import { Breadcrumb, Form, Skeleton } from "antd";
import dayjs from "dayjs";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "@/utils/toast";
import {
  createQuizApi,
  getQuizDetailsApi,
  updateQuizApi,
} from "@/services/collections";
import { QuizQuestionProp } from "@/modules/addQuizSteps/AddQuestionModal";

import { CheckOutlined } from "@ant-design/icons";

const quizSteps: { title: string; subtitle: string }[] = [
  {
    title: "Basic Details",
    subtitle: "Quiz name, schedule & countdown timer",
  },
  {
    title: "Quiz Questions",
    subtitle: "Configure MCQ options & short answers",
  },
];

const AddQuizInner = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";
  const quizId = searchParams.get("quiz_id") || "";
  const mode = searchParams.get("mode") || "create";

  const organizationId = useSelector(
    (state: RootState) => state?.userdata?.organization_id
  );

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [questions, setQuestions] = useState<QuizQuestionProp[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const enableTimer = Form.useWatch("enableTimer", form);
  const batchDetailsUrl = `${RoutePaths?.Quizzes}/batch-details?course_id=${courseId}&batch_id=${batchId}`;

  const items = [
    { title: "Quizzes", href: RoutePaths?.Quizzes },
    {
      title: "Batch Quizzes",
      href: batchDetailsUrl,
    },
    { title: mode === "edit" ? "Edit Quiz" : "Add Quiz" },
  ];

  // If editing, load quiz details from backend
  useEffect(() => {
    if (mode === "edit" && quizId) {
      setInitialLoading(true);
      getQuizDetailsApi(quizId)
        .then((res) => {
          if (res?.status) {
            const q = res.data;
            form.setFieldsValue({
              quizName: q.quizName,
              dueDate: q.dueDateRaw ? dayjs(q.dueDateRaw) : undefined,
              quizType: q.quizType,
              overview: q.overview,
              enableTimer: q.enableTimer ?? false,
              timer: q.timer ? dayjs(q.timer, "HH:mm") : undefined,
            });
            // Prepopulate dynamic questions array
            setQuestions(q.questions || []);
          }
        })
        .catch(() => toast.error("Failed to load quiz details"))
        .finally(() => setInitialLoading(false));
    }
  }, [mode, quizId, form]);

  const handleFinish = async () => {
    if (currentStep !== 1) {
      // Validate step 1 fields first
      try {
        await form.validateFields();
      } catch (_) {
        return;
      }
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Step 2 publish
    if (questions.length === 0) {
      toast.error("Please add at least one question to the quiz.");
      return;
    }

    try {
      await form.validateFields();
    } catch (_) {
      setCurrentStep(0);
      return;
    }

    const values = form.getFieldsValue(true);

    if (!courseId || !batchId) {
      toast.error("Missing course or batch context. Please navigate from dashboard.");
      return;
    }

    setLoading(true);

    let dueDateISO: string | undefined;
    if (values.dueDate) {
      try {
        dueDateISO =
          typeof values.dueDate.toISOString === "function"
            ? values.dueDate.toISOString()
            : new Date(values.dueDate).toISOString();
      } catch (_) {
        toast.error("Invalid due date.");
        setLoading(false);
        return;
      }
    } else {
      toast.error("Due Date is required.");
      setCurrentStep(0);
      setLoading(false);
      return;
    }

    // Capture countdown timer string if timer enabled
    let timerStr = null;
    if (values.enableTimer && values.timer) {
      timerStr = dayjs(values.timer).format("HH:mm");
    }

    const payload = {
      quizName: values.quizName,
      dueDate: dueDateISO,
      quizType: values.quizType || "mixed",
      overview: values.overview,
      enableTimer: !!values.enableTimer,
      timer: timerStr,
      courseId,
      batchId,
      organisationId: organizationId || undefined,
      questions: questions.map((q) => ({
        questionType: q.questionType,
        question: q.question,
        marks: Number(q.marks),
        options: q.options || [],
        correctOption: q.correctOption || "",
        correctAnswer: q.correctAnswer || "",
      })),
      status: "published",
    };

    try {
      let res;
      if (mode === "edit" && quizId) {
        res = await updateQuizApi(quizId, payload);
      } else {
        res = await createQuizApi(payload);
      }

      if (res?.status) {
        toast.success(
          res.message ||
            (mode === "edit"
              ? "Quiz updated successfully"
              : "Quiz created successfully")
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
      <div className="p-8 bg-white rounded-xl">
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

          {quizSteps.map((s, idx) => {
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
          {currentStep === 0 && <Step1 enableTime={enableTimer} />}
          {currentStep === 1 && (
            <Step2MCQ questions={questions} setQuestions={setQuestions} />
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
            onClick={handleFinish}
            type="button"
            text={
              currentStep === 1
                ? mode === "edit"
                  ? "Update Quiz"
                  : "Publish Quiz"
                : "Continue to Questions"
            }
          />
        </div>
      </Form>
    </div>
  );
};

const AddQuiz = () => (
  <Suspense fallback={<Skeleton active />}>
    <AddQuizInner />
  </Suspense>
);

export default AddQuiz;
