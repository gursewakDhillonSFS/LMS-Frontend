"use client";
import CertificateCard from "@/components/CertificateCard";
import CommonButton from "@/components/CommonButton";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { EvaluationTab } from "@/utils/constant";
import { EvaluationTabEnum } from "@/utils/enums";
import React, { useState } from "react";

export const submissions = [
  {
    id: 1,
    type: "Quizzes",
    title: "Generative AI Feature Quizzes",
    submittedDate: "20 May, 2024",
    score: "85",
  },
  {
    id: 2,
    type: "Quizzes",
    title: "Generative AI Feature Quizzes",
    submittedDate: "20 May, 2024",
    score: "60",
  },
  {
    id: 3,
    type: "Assignments",
    title: "Physics Assignment",
    submittedDate: "20 May, 2024",
    score: "30",
  },
];

const tagColors: Record<string, string> = {
  Quizzes: "bg-[#5EB85C]",
  Assignments: "bg-[#5F3A6B]",
};

const Evaluation = () => {
  const [activeTab, setActiveTab] = useState<string>(
    EvaluationTabEnum?.PERFORMANCE
  );
  return (
    <div className="flex flex-col gap-[20px]">
      <CustomTabSwitcher
        activeKey={activeTab}
        onChange={setActiveTab}
        tabs={EvaluationTab}
        className="rounded-[6px] px-1 pt-2 !shadow-sm"
      />

      {activeTab === EvaluationTabEnum?.PERFORMANCE && (
        <div className="grid grid-cols-2 gap-3">
          {submissions?.map((submission, index) => (
            <div key={index} className="bg-white rounded-xl p-4 w-full">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-xs px-2 py-1 text-white rounded-full w-fit ${
                      tagColors[submission.type]
                    }`}
                  >
                    {submission.type}
                  </span>
                  <h3 className="font-semibold text-[20px] leading-[120%]">
                    {submission.title}
                  </h3>
                </div>
                <p className="text-sm font-medium leading-[150%] text-secondary">
                  Submitted on: {submission.submittedDate}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 items-center justify-center">
                    Score:
                    <TextFormatComponent number={submission?.score} />
                  </div>
                  <CommonButton text={"View"} className="!w-[30%]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === EvaluationTabEnum?.OVERALL_RESULT && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[12px] flex items-center justify-center font-semibold w-full">
              <TextFormatComponent text="Pass" className="!text-[150px]" />
            </div>
            <div className="flex flex-col gap-[16px] bg-white rounded-[12px] py-4 px-6">
              <h1 className="font-bold text-lg">Result Remark</h1>
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

          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-2xl">Certificate</h1>
            <div className="grid grid-cols-2 gap-2">
              <CertificateCard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluation;
