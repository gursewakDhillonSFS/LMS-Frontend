import React, { useState } from "react";
import { Collapse } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { CheckIcon, FileDisplayIcon } from "@/utils/icons";
import CommonLink from "./CommonLink";

const staticMilestones = [
  {
    step: "1",
    title: "What is Light and prove it?",
    status: "Completed",
    description:
      "Pellentesque nibh porta facilisis nunc. Amet vulputate ornare varius ultricies tellus duis fringilla interdum...",
    objective: [
      "Lorem ipsum dolor sit amet consectetur. Vitae magna molestie.",
      "Lorem ipsum dolor sit amet consectetur. Vitae magna molestie.",
      "Lorem ipsum dolor sit amet consectetur. Vitae magna molestie.",

      "Lorem ipsum dolor sit amet consectetur. Vitae magna molestie.",
    ],
    note: "Sed eu nunc urna sagittis lacinia. Eget ac amet purus ultrices faucibus tellus commodo...",
    files: [
      { name: "HannahBusing_Resume.pdf", size: 200 },
      { name: "HannahBusing_Resume.pdf", size: 200 },
    ],
  },
  {
    step: "2",
    title: "History of theory of relativity",
    status: "Not Started",
    description:
      "Pellentesque nibh porta facilisis nunc. Amet vulputate ornare varius ultricies tellus duis fringilla interdum...",
    objective: [
      "Lorem ipsum dolor sit amet consectetur. Vitae magna molestie.",
      "Lorem ipsum dolor sit amet consectetur. Vitae magna molestie.",
      "Lorem ipsum dolor sit amet consectetur. Vitae magna molestie.",

      "Lorem ipsum dolor sit amet consectetur. Vitae magna molestie.",
    ],
    note: "",
    files: [],
  },
];

const AssignmentDetailDisplayCollapse = () => {
  const [activeStep, setActiveStep] = useState("1");

  return (
    <div className="flex flex-col gap-4">
      {staticMilestones.map((item, index) => (
        <Collapse
          key={index}
          accordion
          activeKey={activeStep}
          onChange={() => setActiveStep(item.step)}
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <RightOutlined
              style={{
                transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                transition: "0.2s",
              }}
            />
          )}
          className={activeStep == item.step ? "!bg-secondary" : "!bg-white"}
          items={[
            {
              key: item.step,
              label: (
                <div className={`flex justify-between `}>
                  <div className="flex gap-2">
                    <p
                      className={`rounded-[12px] px-2 py-1 text-xs whitespace-nowrap h-fit ${
                        activeStep !== item.step ? "bg-[#E3E3E3]" : "bg-white"
                      }`}
                    >
                      Project {item.step}
                    </p>
                    <p
                      className={`font-bold ${
                        activeStep == item.step && "text-white"
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>
                </div>
              ),
              children: (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <h1 className="font-semibold text-[16px] ">
                      Project Details
                    </h1>
                    <p className="text-[#002333]">{item.description}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h1 className="font-semibold text-[16px] ">
                      Objective Completed
                    </h1>
                    <ul className="list-none text-sm  text-[#002333] flex flex-col gap-2 items-start">
                      {item?.objective.map((el,index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="bg-primary items-center justify-center w-[24px] h-[25px] rounded-full ">
                            <CheckIcon color="white" />
                          </div>
                          {el}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h1 className="font-semibold text-[16px] ">
                      Project Description
                    </h1>
                    <p className="text-[#002333]">{item.note}</p>
                  </div>

                  <div>
                    <h1 className="font-bold text-[18px] mb-1">Project</h1>
                    <div className="grid grid-cols-3 gap-3">
                      {item.files.map((file, fileIndex) => (
                        <div
                          key={fileIndex}
                          className="border border-[#D8D8D8] p-[16px] rounded-[6px] flex items-start
                           gap-3"
                        >
                          <FileDisplayIcon />
                          <div className="flex flex-col items-start">
                            <p className="text-[16px] font-semibold">
                              {file.name}
                            </p>
                            <p className="text-[12px] text-[#818B9A]">
                              {file.size} KB
                            </p>
                            <CommonLink text={"Click to view"} />
                          </div>
                        </div>
                      ))}
                      {item.files.length === 0 && (
                        <p className="text-sm text-[#9F9F9F]">
                          No files uploaded.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      ))}
    </div>
  );
};

export default AssignmentDetailDisplayCollapse;
