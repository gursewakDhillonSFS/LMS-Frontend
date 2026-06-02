"use client";
import { DeleteIcon, SixDotIcon } from "@/utils/icons";
import { Button, Form, Input } from "antd";
import React from "react";

const Step2Essay: React.FC = () => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <Form.List name="essayQuestions">
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-base mb-2">
            Essay Questions
          </label>
          <div className="flex flex-col gap-3">
            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2 w-full"
              >
                <SixDotIcon />
                <Form.Item
                  {...restField}
                  name={[name, "question"]}
                  rules={[
                    { required: true, message: "Please enter a question" },
                  ]}
                  className="flex-grow !mb-0"
                >
                  <Input
                    placeholder="Add Question"
                    className="h-12 rounded-radius-10 text-sm"
                    onKeyDown={handleKeyDown}
                  />
                </Form.Item>

                <div className="flex gap-1 items-center !min-w-[30%]">
                  <Form.Item
                    {...restField}
                    name={[name, "marks"]}
                    rules={[{ required: true, message: "Enter marks" }]}
                    className="w-full !mb-0"
                  >
                    <Input
                      placeholder="Add Maximum Marks"
                      className="h-12 rounded-radius-10 text-sm"
                      onKeyDown={handleKeyDown}
                    />
                  </Form.Item>

                  <div className="cursor-pointer" onClick={() => remove(name)}>
                    <DeleteIcon />
                  </div>
                </div>
              </div>
            ))}
            <Button
              onClick={() => add()}
              className="flex items-center justify-center text-base !border !border-secondary !text-secondary"
            >
              + Add Questions
            </Button>
          </div>
        </div>
      )}
    </Form.List>
  );
};

export default Step2Essay;
