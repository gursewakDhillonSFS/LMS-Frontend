"use client";
import CertificateCard from "@/components/CertificateCard";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { InstructorEvaluationTab } from "@/utils/constant";
import { InstructorEvaluationTabEnum } from "@/utils/enums";
import { EditIcon } from "@/utils/icons";
import React, { useState } from "react";

interface StudentEvaluationProps {
  details?: unknown;
}

const StudentEvaluation: React.FC<StudentEvaluationProps> = ({ details }) => {
  const [activeTab, setActiveTab] = useState<string>(
    InstructorEvaluationTabEnum.OVERALL_RESULT
  );
  return (
    <div className="flex flex-col gap-[20px]">
      <CustomTabSwitcher
        activeKey={activeTab}
        onChange={setActiveTab}
        tabs={InstructorEvaluationTab}
        className="rounded-[6px] px-1 pt-2 !shadow-sm"
      />

      {activeTab === InstructorEvaluationTabEnum?.OVERALL_RESULT && (
        <div className="flex gap-3">
          <div className="bg-white w-1/3 rounded-[12px] flex items-center justify-center font-semibold ">
            <TextFormatComponent text="Pass" className="!text-[150px]" />
          </div>
          <div className="flex w-2/3 flex-col gap-[16px] bg-white rounded-[12px] py-4 px-6">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-lg">Result Remark</h1>
              <div>
                <EditIcon />
              </div>
            </div>
            <p className="text-base text-[#002333]">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              Obcaecati eum perspiciatis accusamus nostrum et voluptate cumque,
              delectus molestias necessitatibus aperiam, id placeat quam
              possimus harum eaque in, quae magnam soluta aliquid pariatur error
              dolores qui nobis? Magni ullam, hic quas similique sapiente magnam
              porro aliquam iure corrupti sint nobis nam.
            </p>
          </div>
        </div>
      )}
      {activeTab === InstructorEvaluationTabEnum?.CERTIFICATE && (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <CertificateCard key={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentEvaluation;
