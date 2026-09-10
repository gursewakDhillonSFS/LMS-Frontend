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

const headings: { title: string; description?: string }[] = [
  {
    title: "Add Quizzes",
    description: "Fill the basic details of Quizzes",
  },
  {
    title: "Add Questions",
    description: "Add the questions in this quizzes",
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
  const batchDetailsUrl = `${RoutePaths?.TeacherQuizzes}/batch-details?course_id=${courseId}&batch_id=${batchId}`;

  const items = [
    { title: "Quizzes", href: RoutePaths?.TeacherQuizzes },
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
            setQuestions(q.questions || []);
          }
        })
        .catch(() => toast.error("Failed to load quiz details"))
        .finally(() => setInitialLoading(false));
    }
  }, [mode, quizId, form]);

  const handleFinish = async () => {
    if (currentStep !== 1) {
      try {
        await form.validateFields();
      } catch (_) {
        return;
      }
      setCurrentStep((prev) => prev + 1);
      return;
    }

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
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex flex-col items-center justify-center gap-6">
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
            {currentStep === 0 && <Step1 enableTime={enableTimer} />}
            {currentStep === 1 && (
              <Step2MCQ questions={questions} setQuestions={setQuestions} />
            )}
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <CommonButton
              className={`border !bg-transparent !w-[20%] ${
                currentStep === 0 && "hidden"
              }`}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              type="button"
              text="Back"
            />

            <CommonButton
              loading={loading}
              className="!w-[20%]"
              onClick={handleFinish}
              type="button"
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

const AddQuiz = () => (
  <Suspense fallback={<Skeleton active />}>
    <AddQuizInner />
  </Suspense>
);

export default AddQuiz;
