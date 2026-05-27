"use client";
import CommonButton from "@/components/CommonButton";
import { getStatusColor } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { RightOutlined } from "@ant-design/icons";
import type { CarouselRef } from "antd/es/carousel";
import { Breadcrumb, Carousel, Form } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionListingIcon } from "@/utils/icons";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";

const initialTime = 10 * 60;

interface Question {
  id: string;
  type: "mcq" | "essay";
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  selected: boolean;
}

interface QuizData {
  title: string;
  questions: Question[];
}

const quizData: QuizData = {
  title: "Generative AI Feature Quizzes",
  questions: [
    {
      id: "q1",
      type: "mcq",
      question:
        "Which of the following best describes a core function of a large language model like ChatGPT?",
      options: [
        "Generating human-like text",
        "Less than high school diploma",
        "Some college, but no degree",
        "Associate Degree (e.g., AA, AS)",
      ],
      correctAnswer: "Generating human-like text",
      userAnswer: "Less than high school diploma",
      selected: true,
    },
    {
      id: "q2",
      type: "mcq",
      question:
        "What does 'text-to-image' generation refer to in Generative AI?",
      options: [
        "Converting spoken words to images",
        "Generating images from written descriptions",
        "Describing images using text",
        "Translating text into binary image data",
      ],
      correctAnswer: "Generating images from written descriptions",
      userAnswer: "Generating images from written descriptions",
      selected: false,
    },
    {
      id: "q3",
      type: "mcq",
      question:
        "What is the main difference between 'retrieval-based' AI and 'generative' AI?",
      options: [
        "Generative AI creates new content; retrieval-based AI finds existing content",
        "Retrieval-based AI generates code",
        "Generative AI searches the web",
        "Retrieval-based AI needs internet access",
      ],
      correctAnswer:
        "Generative AI creates new content; retrieval-based AI finds existing content",
      userAnswer:
        "Generative AI creates new content; retrieval-based AI finds existing content",
      selected: true,
    },
    {
      id: "q4",
      type: "mcq",
      question:
        "Which technology is commonly used for training large language models?",
      options: ["CNN", "RNN", "Transformers", "GANs"],
      correctAnswer: "Transformers",
      userAnswer: "",
      selected: false,
    },
    {
      id: "q5",
      type: "mcq",
      question:
        "Which of the following is NOT typically considered a use-case for generative AI?",
      options: [
        "Image synthesis",
        "Text summarization",
        "Spam email detection",
        "Music composition",
      ],
      correctAnswer: "Spam email detection",
      userAnswer: "",
      selected: false,
    },
    {
      id: "q6",
      type: "mcq",
      question: "What is a potential ethical concern with generative AI?",
      options: [
        "Data compression",
        "Training speed",
        "Generating misleading information",
        "High-resolution output",
      ],
      correctAnswer: "Generating misleading information",
      userAnswer: "",
      selected: false,
    },
    {
      id: "q7",
      type: "mcq",
      question:
        "Which company developed GPT (Generative Pre-trained Transformer) models?",
      options: ["Google", "Meta", "OpenAI", "IBM"],
      correctAnswer: "OpenAI",
      userAnswer: "",
      selected: false,
    },
    {
      id: "q8",
      type: "mcq",
      question:
        "In generative AI, what does 'zero-shot learning' typically refer to?",
      options: [
        "Training from scratch without data",
        "Generating images with no model weights",
        "Solving tasks without specific training examples",
        "Using only one input sample",
      ],
      correctAnswer: "Solving tasks without specific training examples",
      userAnswer: "",
      selected: false,
    },
    {
      id: "q9",
      type: "mcq",
      question:
        "Which of the following would most likely be used to generate deepfake videos?",
      options: ["CNN", "Autoencoder", "GAN", "LSTM"],
      correctAnswer: "GAN",
      userAnswer: "",
      selected: false,
    },
    {
      id: "q10",
      type: "mcq",
      question:
        "Which term describes a model’s ability to generate responses that sound plausible but are factually incorrect?",
      options: ["Bias", "Overfitting", "Hallucination", "Confusion"],
      correctAnswer: "Hallucination",
      userAnswer: "",
      selected: false,
    },
  ],
};

const CourseQuiz = () => {
  const breadcrumbItems = [
    { title: "My Course", href: RoutePaths.MyCourses },
    {
      title: "Finance & Quantitative Modeling for Analysts",
      href: `${RoutePaths?.MyCourses}/course-details`,
    },
    { title: "Generative AI Feature Quizzes" },
  ];
  const [form] = Form.useForm();
  const router = useRouter();
  const carouselRef = useRef<CarouselRef>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [data, setData] = useState<Question[]>(quizData?.questions);
  const [QuestionListing, setQuestionListing] = useState(false);
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [indexToShow, setIndexToShow] = useState<number>(0);

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / (60 * 60))).padStart(2, "0");
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = useCallback(() => {
    setSubmitLoading(true);
    const values = form.getFieldsValue();
    setAnswers(values);
    setIsSubmitted(true);
    setTimeout(() => {
      router.push(`${RoutePaths?.MyCourses}/course-details`);
    }, 1000);
    setSubmitLoading(false);
  }, [form, router]);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, handleSubmit]);

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <Breadcrumb
          separator={<span className="text-[#002333] font-[700]">{">"}</span>}
          items={breadcrumbItems}
          itemRender={(item) => <BreadcrumbItemRender item={item} />}
        />
        <CommonButton
          text={"Exit"}
          className="!bg-[#FB4A49] text-white w-[8%]"
          onClick={() => router.push(`${RoutePaths?.MyCourses}/course-details`)}
        />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">{quizData.title}</h1>
        <div
          className={`font-bold text-2xl text-[${getStatusColor(
            formatTime(remainingTime)
          )}]`}
        >
          {formatTime(remainingTime)}
        </div>
      </div>

      <div
        className={`w-full bg-white p-3 pb-[12px] flex flex-col gap-[10px] rounded-[20px]`}
      >
        {QuestionListing && (
          <div className={`w-full rounded-lg p-4 bg-white`}>
            <h1 className="font-bold text-2xl">Questions</h1>
            <div className="flex flex-col">
              {quizData?.questions.map((q, idx) => (
                <div
                  onClick={() => {
                    //   carouselRef.current?.goTo(idx, true);
                    setIndexToShow(idx);
                    setQuestionListing(false);
                  }}
                  key={q.id}
                  className={`flex justify-between items-center py-5 cursor-pointer ${
                    idx < quizData?.questions?.length - 1 &&
                    "border-b border-[#D8D8D8]"
                  }`}
                >
                  <div className="flex gap-2 items-start justify-between">
                    <div className="flex gap-2 items-center">
                      <div
                        className={`rounded-[12px] px-2 py-1 text-xs h-fit ${
                          q.selected
                            ? "bg-secondary text-white border border-secondary "
                            : "bg-transparent border border-black text-black"
                        }`}
                      >
                        Q{idx + 1}
                      </div>
                      <p className={`font-[500] text-[16px] `}>{q.question}</p>
                    </div>
                  </div>
                  <RightOutlined />
                </div>
              ))}
            </div>
          </div>
        )}

        {!QuestionListing && (
          <div className={``}>
            <div>
              <CommonButton
                text={"Question List"}
                icon={<QuestionListingIcon />}
                onClick={() => setQuestionListing(true)}
                className="!bg-transparent border flex-row-reverse"
              />
            </div>
            <div className="flex-1">
              <Form
                form={form}
                layout="vertical"
                onValuesChange={(changed) => {
                  const [questionId, answer] = Object.entries(changed)[0];
                  handleOptionChange(questionId, answer as string);
                }}
              >
                <Carousel
                  ref={carouselRef}
                  dots={false}
                  draggable={false}
                  initialSlide={indexToShow}
                >
                  {data.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`${
                        QuestionListing ? "hidden opacity-0" : "block"
                      } !flex !flex-col !items-center !gap-[32px] !w-[60%] mx-auto`}
                    >
                      <Form.Item
                        name={q.id}
                        label={
                          <div className="font-bold text-2xl leading-[120%] text-center mb-[32px]">
                            Q{idx + 1}. {q.question}
                          </div>
                        }
                        className=""
                      >
                        <div className="flex flex-col gap-2 justify-center items-center">
                          {q.options.map((opt, i) => {
                            const isSelected = answers[q.id] === opt;

                            return (
                              <button
                                key={i}
                                type="button"
                                className={`w-[80%] transition-all ease-in-out duration-300 border rounded-[24px] px-6 py-3 text-left cursor-pointer  ${
                                  isSelected
                                    ? "border-secondary bg-secondary text-white"
                                    : "bg-transparent hover:bg-gray-50"
                                }`}
                                disabled={isSubmitted}
                                onClick={() => {
                                  form.setFieldValue(q.id, opt);
                                  setData((prev) =>
                                    prev.map((item) => {
                                      if (item?.id === q.id) {
                                        return { ...item, selected: true };
                                      } else {
                                        return item;
                                      }
                                    })
                                  );
                                  handleOptionChange(q.id, opt);
                                }}
                              >
                                {`${String.fromCharCode(65 + i)}. ` + opt}
                              </button>
                            );
                          })}
                        </div>
                      </Form.Item>

                      <div className="flex w-full items-center justify-center gap-3">
                        {idx !== 0 && (
                          <CommonButton
                            text="Back"
                            onClick={() => carouselRef.current?.prev()}
                            disable={idx === 0 || isSubmitted}
                            className="!w-[20%] !bg-transparent border"
                          />
                        )}
                        {idx === quizData.questions.length - 1 ? (
                          <CommonButton
                            text="Submit"
                            className="!bg-[#0177DB] text-white w-[20%]"
                            onClick={handleSubmit}
                            disable={isSubmitted}
                            loading={submitLoading}
                          />
                        ) : (
                          <CommonButton
                            text="Next"
                            onClick={() => carouselRef.current?.next()}
                            disable={isSubmitted}
                            className="!w-[20%]"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </Carousel>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseQuiz;
