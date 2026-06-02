"use client";
import TabSwitcher from "@/components/TabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { QuizDetailTabs } from "@/utils/constant";
import { QuizDetailTabEnum, RoutePaths } from "@/utils/enums";
import { Breadcrumb } from "antd";
import React, { useState } from "react";
import { Collapse } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { getStatusColor } from "@/utils/comman";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";

const QuizQuestion = [
  {
    status: "Completed",
    type: "mcq",
    question:
      "Which of the following best describes a core function of a large language model like ChatGPT?",
    userAnswer: "Understanding and generating human-like text",
    correctAnswer: "Understanding and generating human-like text",
  },
  {
    status: "Completed",
    type: "mcq",
    question: 'What does "text-to-image" generation refer to in Generative AI?',
    userAnswer: "Creating images from a written description",
    correctAnswer: "Creating images from a written description",
  },
  {
    status: "Completed",
    type: "mcq",
    question:
      "Which of the following is a typical use case for generative AI in business?",
    userAnswer: "Predictive analytics for stock trends",
    correctAnswer: "Generating personalized marketing content",
  },
  {
    status: "Completed",
    type: "essay",
    question:
      'What is the main difference between "retrieval-based" AI and "generative" AI?',
    userAnswer:
      "Retrieval-based AI fetches existing data, while generative AI creates new content.",
    correctAnswer:
      "Retrieval-based AI provides responses from a pre-existing database, whereas generative AI generates novel content.",
  },
  {
    status: "Completed",
    type: "mcq",
    question: 'What does "text-to-image" generation refer to in Generative AI?',
    userAnswer: "Creating images from a written description",
    correctAnswer: "Creating images from a written description",
  },
  {
    status: "Completed",
    type: "mcq",
    question:
      "Which of the following is a typical use case for generative AI in business?",
    userAnswer: "Predictive analytics for stock trends",
    correctAnswer: "Generating personalized marketing content",
  },
  {
    status: "Completed",
    type: "essay",
    question:
      'What is the main difference between "retrieval-based" AI and "generative" AI?',
    userAnswer:
      "Retrieval-based AI fetches existing data, while generative AI creates new content.",
    correctAnswer:
      "Retrieval-based AI provides responses from a pre-existing database, whereas generative AI generates novel content.",
  },
];

const QuizResult = () => {
  const [activeTab, setActiveTab] = useState<string>(
    QuizDetailTabEnum?.QUESTIONS
  );
  const items = [
    {
      title: "My Course",
      href: RoutePaths?.MyCourses,
    },
    {
      title: "Finance & Quantitative Modeling for Analysts",
      href: `${RoutePaths?.MyCourses}/course-details`,
    },
    {
      title: "Generative AI Feature Quizzes",
    },
  ];
  return (
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />
      <div className="flex flex-col gap-3">
        <h1 className="font-bold text-2xl">Generative AI Feature Quizzes</h1>
        <div className="flex items-center justify-between w-full">
          <TabSwitcher
            activeKey={activeTab}
            onChange={setActiveTab}
            tabs={QuizDetailTabs}
          />
          {activeTab === QuizDetailTabEnum.QUESTIONS && (
            <div
              className={`font-bold text-2xl leading-[120%] text-[${getStatusColor(
                85
              )}]`}
            >
              Score : 85/100
            </div>
          )}
        </div>
        {activeTab === QuizDetailTabEnum.QUESTIONS && (
          <div className="bg-white flex flex-col gap-[10px] p-6 rounded-[20px]">
            <h1 className="font-bold text-2xl">Questions</h1>
            <div className="flex flex-col">
              {QuizQuestion.map((item, index) => {
                const isCorrect = item.userAnswer === item.correctAnswer;

                return (
                  <div key={index}>
                    <Collapse
                      expandIconPosition="end"
                      className="!bg-white !border-none"
                      expandIcon={({ isActive }) =>
                        item.status === "In Progress" ||
                        item.status === "Completed" ? (
                          <RightOutlined
                            style={{
                              transform: isActive
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              transition: "0.2s",
                            }}
                          />
                        ) : (
                          <LockOutlined />
                        )
                      }
                      accordion
                      items={[
                        {
                          key: index + 1,
                          label: (
                            <div
                              className={`flex justify-between items-center ${
                                item.status === "Not Started" && "opacity-50"
                              }`}
                            >
                              <div className="flex gap-2 items-center">
                                <div
                                  className={`rounded-[12px] px-2 py-1 text-xs whitespace-nowrap h-fit bg-secondary text-white`}
                                >
                                  Q{index + 1}
                                </div>
                                <p className={`font-semibold text-[16px] `}>
                                  {item.question}
                                </p>
                              </div>
                              <div>
                                {isCorrect ? (
                                  <div className="bg-[#5EB85C] p-[6px] rounded-full text-white flex items-center justify-center">
                                    <CheckOutlined />
                                  </div>
                                ) : (
                                  <div>
                                    <CloseOutlined className="bg-[#FB4A49] p-[6px] rounded-full !text-white flex items-center justify-center" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ),
                          children: (
                            <div>
                              <div className="mb-2">
                                <strong>Your Answer:</strong>{" "}
                                <span
                                  className={`${
                                    isCorrect
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {item.userAnswer}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="mb-2">
                                  <strong>Correct Answer:</strong>{" "}
                                  <span className="text-green-700">
                                    {item.correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                          ),
                        },
                      ]}
                    />
                    {index < QuizQuestion.length - 1 && (
                      <div className="w-full border-b border-[#D8D8D8] my-2"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {activeTab === QuizDetailTabEnum.SCORE && (
          <div className="flex gap-3 w-full">
            <div className="bg-white rounded-[12px] flex items-center justify-center font-semibold w-1/3">
              <TextFormatComponent number="85" className="!text-[150px]" />
            </div>
            <div className="flex flex-col gap-[16px] bg-white rounded-[12px] py-4 px-6 w-2/3">
              <h1 className="font-bold text-lg">Score Remark</h1>
              <p className="text-base text-[#002333]">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Obcaecati eum perspiciatis accusamus nostrum et voluptate
                cumque, delectus molestias necessitatibus aperiam, id placeat
                quam possimus harum eaque in, quae magnam soluta aliquid
                pariatur error dolores qui nobis? Magni ullam, hic quas
                similique sapiente magnam porro aliquam iure corrupti sint nobis
                nam.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResult;
