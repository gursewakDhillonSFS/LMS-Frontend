"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import CommonLink from "@/components/CommonLink";
import { getStatusColor } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { QuestionListingIcon } from "@/utils/icons";
import { RightOutlined } from "@ant-design/icons";
import { Breadcrumb, Form, Select } from "antd";
import Carousel, { CarouselRef } from "antd/es/carousel";
import React, { useRef, useState } from "react";

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
      selected: true,
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
      userAnswer: "Transformers",
      selected: true,
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
      userAnswer: "Spam email detection",
      selected: true,
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
      userAnswer: "Generating misleading information",
      selected: true,
    },
    {
      id: "q7",
      type: "mcq",
      question:
        "Which company developed GPT (Generative Pre-trained Transformer) models?",
      options: ["Google", "Meta", "OpenAI", "IBM"],
      correctAnswer: "OpenAI",
      userAnswer: "OpenAI",
      selected: true,
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
      userAnswer: "Solving tasks without specific training examples",
      selected: true,
    },
    {
      id: "q9",
      type: "mcq",
      question:
        "Which of the following would most likely be used to generate deepfake videos?",
      options: ["CNN", "Autoencoder", "GAN", "LSTM"],
      correctAnswer: "GAN",
      userAnswer: "GAN",
      selected: true,
    },
    {
      id: "q10",
      type: "mcq",
      question:
        "Which term describes a model’s ability to generate responses that sound plausible but are factually incorrect?",
      options: ["Bias", "Overfitting", "Hallucination", "Confusion"],
      correctAnswer: "Hallucination",
      userAnswer: "Hallucination",
      selected: true,
    },
  ],
};

const QuizDetails = () => {
  const [form] = Form.useForm();
  const carouselRef = useRef<CarouselRef>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [data, setData] = useState<Question[]>(quizData?.questions);
  const [QuestionListing, setQuestionListing] = useState(false);
  const [marks, setMarks] = useState<{ [key: string]: number }[]>([]);
  const [indexToShow, setIndexToShow] = useState<number>(0);

  console.log(setData)
  const handleSubmit = () => {
    setSubmitLoading(true);
    console.log("Submitted Data:", form.getFieldsValue());
    console.log("Submitted Data:", marks);
    setSubmitLoading(false);
  };

  const items = [
    {
      title: "Students",
      href: RoutePaths?.Students,
    },
    {
      title: "Theresa Webb",
      href: `${RoutePaths?.Students}/student-details`,
    },
    {
      title: "Generative AI Monthly Test",
    },
  ];

  return (
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
      itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">{quizData.title}</h1>
        <div
          className={`font-bold text-2xl leading-[120%] text-[${getStatusColor(
            85
          )}]`}
        >
          Score : 85/100
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
              <Form form={form} layout="vertical">
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
                      <div>
                        <div className="font-bold text-2xl leading-[120%] text-center">
                          Q{idx + 1}. {q.question}
                        </div>
                        <div className="flex items-center justify-between">
                          <CommonLink text={"Marks(out of 5)"} />
                          <Form.Item name={`marks${q.id}`}>
                            <Select
                              placeholder={"--Select Marks--"}
                              onChange={(value) =>
                                setMarks((prev) => {
                                  const newMarks = [...prev];
                                  newMarks[idx] = { [q.id]: Number(value) };
                                  return newMarks;
                                })
                              }
                              value={
                                marks[idx] ? Object.values(marks[idx])[0] : ""
                              }
                              className="!w-full min-w-[250px] !h-[40px] !mt-4 text-start !rounded-lg"
                              //   options={[
                              //     { value: "0", label: "0" },
                              //     { value: "1", label: "1" },
                              //     { value: "2", label: "2" },
                              //     { value: "3", label: "3" },
                              //     { value: "4", label: "4" },
                              //     { value: "5", label: "5" },
                              //   ]}
                              options={[
                                { value: "1", label: "Correct" },
                                { value: "0", label: "Incorrect" },
                              ]}
                            />
                          </Form.Item>
                        </div>
                        <div className="flex flex-col gap-2 justify-center items-center">
                          {q.options.map((opt, i) => {
                            const isSelected = q.userAnswer === opt;

                            return (
                              <button
                                key={i}
                                type="button"
                                className={`w-[80%] transition-all ease-in-out duration-300 border rounded-[24px] px-6 py-3 text-left cursor-not-allowed ${
                                  isSelected
                                    ? "border-secondary bg-secondary text-white"
                                    : "bg-transparent hover:bg-gray-50"
                                }`}
                              >
                                {`${String.fromCharCode(65 + i)}. ` + opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-center gap-3">
                        {idx !== 0 && (
                          <CommonButton
                            text="Back"
                            onClick={() => carouselRef.current?.prev()}
                            disable={idx === 0}
                            className="!w-[20%] !bg-transparent border"
                          />
                        )}
                        {idx === quizData.questions.length - 1 ? (
                          <CommonButton
                            text="Submit"
                            className="!bg-[#0177DB] text-white w-[20%]"
                            onClick={handleSubmit}
                            loading={submitLoading}
                          />
                        ) : (
                          <CommonButton
                            text="Next"
                            onClick={() => carouselRef.current?.next()}
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

export default QuizDetails;
