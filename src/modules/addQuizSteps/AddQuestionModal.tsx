"use client";

import CommonButton from "@/components/CommonButton";
import { CloseIcon, DeleteIcon, SixDotIcon } from "@/utils/icons";
import { Button, Form, Input, Modal, Select } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

export interface QuizQuestionProp {
  _id?: string;
  questionType: "mcq" | "essay";
  question: string;
  marks: number;
  options?: string[];
  correctOption?: string;
  correctAnswer?: string;
}

interface AddQuesModalProps {
  isEditMode: boolean;
  editItem: QuizQuestionProp | null;
  onClose: () => void;
  addModal: boolean;
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestionProp[]>>;
}

const AddQuestionModal: React.FC<AddQuesModalProps> = ({
  isEditMode,
  editItem,
  onClose,
  addModal,
  setQuestions,
}) => {
  const [form] = Form.useForm();
  const watchedQuestionType = Form.useWatch("questionType", form);
  const watchedOptions = Form.useWatch("options", form);

  const closeModal = () => {
    onClose();
    form.resetFields();
  };

  const handleSubmit = (values: {
    questionType: "mcq" | "essay";
    question: string;
    marks: number | string;
    options?: string[];
    correctOption?: string;
    correctAnswer?: string;
  }) => {
    const { questionType, question, marks, correctOption, options, correctAnswer } = values;

    if (questionType === "mcq") {
      if (!correctOption || !options || !options.includes(correctOption)) {
        toast.error("Please select a valid correct option for MCQ.");
        return;
      }
    } else if (questionType === "essay") {
      if (!correctAnswer || !correctAnswer.trim()) {
        toast.error("Please enter the correct short answer.");
        return;
      }
    }

    const payload: QuizQuestionProp = {
      questionType,
      question,
      marks: Number(marks),
      options: questionType === "mcq" ? options : [],
      correctOption: questionType === "mcq" ? correctOption : "",
      correctAnswer: questionType === "essay" ? (correctAnswer?.trim() ?? "") : "",
    };

    if (isEditMode && editItem) {
      setQuestions((prev) => prev.map((q) => (q === editItem ? payload : q)));
    } else {
      setQuestions((prev) => [...prev, payload]);
    }

    closeModal();
  };

  useEffect(() => {
    if (isEditMode && editItem) {
      form.setFieldsValue({
        questionType: editItem.questionType || "mcq",
        question: editItem.question,
        options: editItem.options || [],
        correctOption: editItem.correctOption || null,
        correctAnswer: editItem.correctAnswer || "",
        marks: editItem.marks,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        questionType: "mcq",
        question: "",
        options: [],
        correctOption: null,
        correctAnswer: "",
        marks: "",
      });
    }
  }, [isEditMode, editItem, form, addModal]);

  return (
    <Modal
      open={addModal}
      onCancel={closeModal}
      closable={false}
      footer={null}
      width={800}
      forceRender
    >
      <button
        onClick={closeModal}
        type="button"
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full flex items-center justify-center -top-[10px] -right-[10px] text-sm z-[99]"
      >
        <CloseIcon color="black" />
      </button>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="flex flex-col gap-3">
          <h1 className="font-bold text-2xl flex justify-center">
            {isEditMode ? "Edit" : "Add"} Question
          </h1>

          <Form.Item
            name="questionType"
            label="Question Type"
            rules={[{ required: true, message: "Please select question type" }]}
            className="!mb-0"
          >
            <Select
              className="!h-12"
              options={[
                { label: "Multiple Choice (MCQ)", value: "mcq" },
                { label: "Short Answer (Essay - Auto evaluated)", value: "essay" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: "Please enter the question" }]}
            className="!mb-0"
          >
            <Input placeholder="Enter question description" className="!h-12" />
          </Form.Item>

          {watchedQuestionType === "mcq" && (
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-base">Options</label>

                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex items-center gap-1">
                      <SixDotIcon />
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[{ required: true, message: "Enter option text" }]}
                        className="w-full !mb-0"
                      >
                        <Input
                          placeholder="Add option text"
                          className="h-12 rounded-radius-10 text-sm"
                        />
                      </Form.Item>
                      <div
                        className="cursor-pointer"
                        onClick={() => remove(name)}
                      >
                        <DeleteIcon />
                      </div>
                    </div>
                  ))}

                  <Button
                    htmlType="button"
                    onClick={() => add()}
                    className="flex items-center justify-center text-base !border !border-secondary !text-secondary"
                  >
                    + Add Option
                  </Button>
                </div>
              )}
            </Form.List>
          )}

          {watchedQuestionType === "essay" && (
            <Form.Item
              name="correctAnswer"
              label="Correct Short Answer (One word)"
              rules={[
                { required: true, message: "Please enter the single word correct answer" },
                {
                  pattern: /^\S+$/,
                  message: "Must be a single word (no spaces)",
                },
              ]}
              className="!mb-0"
            >
              <Input
                placeholder="Enter correct single-word answer (e.g. 'Photosynthesis')"
                className="!h-12"
              />
            </Form.Item>
          )}

          <div className="flex gap-2">
            {watchedQuestionType === "mcq" ? (
              <Form.Item
                name="correctOption"
                label="Correct Option"
                className="w-1/2 !mb-0"
              >
                <Select
                  placeholder="Select correct option"
                  options={(watchedOptions || [])
                    .map((option: string, idx: number) => ({
                      label: option || `Option ${idx + 1}`,
                      value: option,
                    }))
                    .filter((opt: { label: string; value: string }) => opt.value?.trim())}
                  className="!h-12"
                />
              </Form.Item>
            ) : (
              <div className="w-1/2" />
            )}

            <Form.Item
              name="marks"
              label="Marks"
              rules={[
                { required: true, message: "Enter marks" },
                {
                  pattern: /^[0-9]+$/,
                  message: "Marks must be a number",
                },
              ]}
              className="w-1/2 !mb-0"
            >
              <Input placeholder="Enter marks" className="h-12 text-sm" />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-2">
            <CommonButton
              text={isEditMode ? "Edit" : "Save"}
              type="button"
              onClick={() => form.submit()}
              className="w-[150px] h-10 flex !bg-secondary text-white"
            />
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddQuestionModal;
