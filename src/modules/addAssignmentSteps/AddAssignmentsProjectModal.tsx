"use client";

import { CloseIcon, DeleteIcon, SixDotIcon } from "@/utils/icons";
import { Button, Checkbox, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import CommonButton from "../../components/CommonButton";
import QuillEditor from "@/components/QuillEditor";
import { createAssignmentSteps2Projects } from "@/utils/interface";

interface AddAssignmentsProjectModalProps {
  addProjectModal: boolean;
  onClose: () => void;
  setProjects: React.Dispatch<
    React.SetStateAction<createAssignmentSteps2Projects[]>
  >;
  isEditMode?: boolean;
  editItem?: createAssignmentSteps2Projects | undefined;
}

const AddAssignmentsProjectModal: React.FC<AddAssignmentsProjectModalProps> = ({
  addProjectModal,
  onClose,
  setProjects,
  isEditMode,
  editItem,
}) => {
  const [form] = Form.useForm();

  // Pre-fill form ONLY when in edit mode and modal is open
  useEffect(() => {
    if (addProjectModal) {
      if (isEditMode && editItem) {
        form.setFieldsValue(editItem);
      } else {
        form.resetFields();
      }
    }
  }, [addProjectModal, isEditMode, editItem, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch (_) {
      return;
    }

    const value = form.getFieldsValue(true);
    const newProject: createAssignmentSteps2Projects = {
      projectName: value.projectName || "",
      description: value.description || "",
      objectives: value.objectives || [],
      enableButton: value.enableButton || false,
    };

    if (isEditMode && editItem) {
      setProjects((prev) =>
        prev.map((proj) => (proj === editItem ? newProject : proj))
      );
    } else {
      setProjects((prev) => [...prev, newProject]);
    }

    handleClose();
  };

  return (
    <Modal
      open={addProjectModal}
      footer={null}
      onCancel={handleClose}
      closable={false}
      width={900}
      className="!top-10"
      destroyOnClose
    >
      <button
        type="button"
        onClick={handleClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon color="black" />
      </button>

      {/* Standalone Form — not nested inside any parent Form */}
      <Form form={form} onFinish={handleSave} layout="vertical">
        <div className="flex flex-col gap-10">
          <h1 className="font-bold text-2xl flex justify-center">
            {isEditMode ? "Edit Project" : "Add Project"}
          </h1>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-base">Project Title</label>
              <Form.Item
                name="projectName"
                rules={[
                  { required: true, message: "Project title is required" },
                ]}
                className="!mb-0"
              >
                <Input
                  placeholder="Enter project title"
                  className="!h-12"
                />
              </Form.Item>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-base">Project Details</label>
              <Form.Item name="description" className="!mb-0">
                <QuillEditor
                  placeholder="Enter project details"
                />
              </Form.Item>
            </div>

            <div className="flex flex-col gap-3">
              <Form.List name="objectives">
                {(fields, { add, remove }) => (
                  <>
                    <label className="font-semibold text-base">
                      Objectives
                    </label>
                    <div className="flex flex-col gap-3">
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          className="flex items-center justify-center gap-1"
                        >
                          <SixDotIcon />
                          <Form.Item
                            {...restField}
                            name={name}
                            rules={[
                              {
                                required: true,
                                message: "Objective is required",
                              },
                            ]}
                            className="w-full !mb-0"
                          >
                            <Input
                              placeholder="Add Objective"
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
                        + Add Objective
                      </Button>
                    </div>
                  </>
                )}
              </Form.List>

              <div className="flex justify-between items-center mt-2">
                <Form.Item
                  name="enableButton"
                  valuePropName="checked"
                  className="!mb-0"
                >
                  <Checkbox>
                    Unlock this project after completing the previous one.
                  </Checkbox>
                </Form.Item>

                <CommonButton
                  text={isEditMode ? "Update" : "Save"}
                  onClick={handleSave}
                  type="button"
                  className="w-[150px] h-10 flex !bg-secondary text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddAssignmentsProjectModal;
