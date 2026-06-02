"use client";

import AddAssignmentsProjectModal from "@/modules/addAssignmentSteps/AddAssignmentsProjectModal";
import { DeleteIcon, EditIcon, SixDotIcon } from "@/utils/icons";
import { createAssignmentSteps2Projects } from "@/utils/interface";
import { Button, Collapse, Divider } from "antd";
import React, { Dispatch, SetStateAction, useState } from "react";

const Step2: React.FC<{
  projects: createAssignmentSteps2Projects[];
  setProjects: Dispatch<SetStateAction<createAssignmentSteps2Projects[]>>;
}> = ({ projects, setProjects }) => {
  const [addProjectModal, setAddProjectModal] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | string[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editItem, setEditItem] =
    useState<createAssignmentSteps2Projects | undefined>(undefined);

  const onClose = () => {
        setIsEditMode(false);
        setEditItem(undefined)
    setAddProjectModal(false);
  };

  const handleRemoveProject = (index: number) => {
    const updatedLinks = projects.filter(
      (_: createAssignmentSteps2Projects, i: number) => i !== index
    );
    setProjects(updatedLinks);
  };

  const handleChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {projects?.map((item, index) => {
          const isActive = Array.isArray(activeKey)
            ? activeKey.includes(index.toString())
            : activeKey === index.toString();
          return (
            <div key={index} className="flex items-center gap-1">
              <SixDotIcon />
              <Collapse
                key={index}
                accordion={true}
                onChange={handleChange}
                expandIconPosition="end"
                activeKey={activeKey}
                className={
                  isActive ? "!bg-[#F5FCFF] w-full" : "!bg-white w-full"
                }
                items={[
                  {
                    key: index.toString(),
                    label: (
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-[700]">
                          {item.projectName}
                        </p>
                      </div>
                    ),
                    children: (
                      <div className="flex flex-col gap-2.5">
                        <div>
                          <p className="font-semibold text-base mb-1.5">
                            Project Details
                          </p>
                          <div dangerouslySetInnerHTML={{ __html: item.description }} />
                        </div>
                        <div>
                          <p className="font-semibold text-base mb-1.5">
                            Objectives
                          </p>
                          <ul className="list-disc pl-5 flex flex-col">
                            {item.objectives.map((objective, idx) => (
                              <React.Fragment key={idx}>
                                <li>{objective}</li>
                                {idx < item.objectives.length - 1 && (
                                  <Divider prefixCls="custom-divider" />
                                )}
                              </React.Fragment>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
              <button
                onClick={() => {
                  setIsEditMode(true);
                  setEditItem(item);
                  setAddProjectModal(true);
                }}
              >
                <EditIcon />
              </button>
              <button
                className="cursor-pointer"
                onClick={() => handleRemoveProject(index)}
              >
                <DeleteIcon />
              </button>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="flex items-center justify-center text-gray-500 text-sm h-20">
            No projects added yet.
          </div>
        )}
        <Button
          onClick={() => setAddProjectModal(true)}
          className="w-full flex items-center justify-center text-base !border !border-secondary !text-secondary"
        >
          + Add Project
        </Button>
      </div>
      <AddAssignmentsProjectModal
        addProjectModal={addProjectModal}
        onClose={onClose}
        setProjects={setProjects}
        isEditMode={isEditMode}
        editItem={editItem}
      />
    </div>
  );
};

export default Step2;
