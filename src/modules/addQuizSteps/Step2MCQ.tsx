"use client";

import { DeleteIcon, EditIcon, SixDotIcon } from "@/utils/icons";
import { Button, Collapse } from "antd";
import React, { useState } from "react";
import AddQuestionModal, { QuizQuestionProp } from "./AddQuestionModal";

interface Step2Props {
  questions: QuizQuestionProp[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestionProp[]>>;
}

const Step2MCQ: React.FC<Step2Props> = ({ questions, setQuestions }) => {
  const [activeKey, setActiveKey] = useState<string | string[]>([]);
  const [addModal, setAddModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<QuizQuestionProp | null>(null);

  const onClose = () => {
    setAddModal(false);
    setIsEditMode(false);
    setEditItem(null);
  };

  const handleChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center mb-2">
        <label className="font-semibold text-base text-[#002333]">
          Quiz Questions ({questions.length})
        </label>
        <span className="text-sm text-gray-500 font-medium">
          Total Marks: {questions.reduce((sum, q) => sum + Number(q.marks || 0), 0)}
        </span>
      </div>

      {questions?.map((item, index) => {
        const isActive = Array.isArray(activeKey)
          ? activeKey.includes(index.toString())
          : activeKey === index.toString();

        return (
          <div key={index} className="flex items-center gap-1">
            <SixDotIcon />
            <Collapse
              accordion={true}
              onChange={handleChange}
              expandIconPosition="end"
              activeKey={activeKey}
              prefixCls="custom-collapse-quiz"
              className={isActive ? "!bg-[#F5FCFF] w-full" : "!bg-white w-full"}
              items={[
                {
                  key: index.toString(),
                  label: (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20 uppercase font-semibold text-[10px]">
                          {item.questionType === "mcq" ? "MCQ" : "Short Answer"}
                        </span>
                        <p className="text-[16px] font-[700] text-[#002333]">
                          {item.question}
                        </p>
                      </div>
                      <p className="border border-[#D9D9D9] rounded-3xl bg-[#EBEBEB] py-1.5 px-4 font-semibold text-sm text-[#002333]">
                        {Number(item.marks)} Marks
                      </p>
                    </div>
                  ),
                  children: (
                    <div className="flex flex-col gap-3">
                      {item.questionType === "mcq" ? (
                        <div className="grid grid-cols-2 gap-4">
                          {item.options?.map((option, idx) => (
                            <div
                              key={idx}
                              className={`${
                                option === item.correctOption
                                  ? "bg-secondary text-white font-medium"
                                  : "bg-transparent border border-gray-200 text-[#002333]"
                              } rounded-3xl py-3 px-6 text-sm`}
                            >
                              <p>{option}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-[#FAFDFE] border border-[#E0F2F1] rounded-xl p-4 flex flex-col gap-1">
                          <p className="text-xs text-gray-500 font-medium">Correct single-word answer:</p>
                          <p className="text-secondary font-bold text-base capitalize">
                            {item.correctAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
            <button
              type="button"
              onClick={() => {
                setIsEditMode(true);
                setEditItem(item);
                setAddModal(true);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="cursor-pointer p-1 hover:bg-gray-100 rounded"
              onClick={() => handleRemoveQuestion(index)}
            >
              <DeleteIcon />
            </button>
          </div>
        );
      })}

      {questions.length === 0 && (
        <div className="flex items-center justify-center text-gray-400 text-sm h-24 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
          No questions added yet. Click below to add a question.
        </div>
      )}

      <Button
        onClick={() => {
          setIsEditMode(false);
          setEditItem(null);
          setAddModal(true);
        }}
        htmlType="button"
        className="w-full flex items-center justify-center text-base !border !border-secondary !text-secondary !h-12 rounded-xl mt-2 font-semibold"
      >
        + Add Question
      </Button>

      <AddQuestionModal
        addModal={addModal}
        isEditMode={isEditMode}
        editItem={editItem}
        onClose={onClose}
        setQuestions={setQuestions}
      />
    </div>
  );
};

export default Step2MCQ;