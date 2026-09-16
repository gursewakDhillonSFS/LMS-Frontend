"use client";
import useCategories from "@/hooks/useCategories";
import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";
import { DefaultImg } from "@/utils/images";
import { Button, Form, Input, Select } from "antd";
import { DeleteIcon, SixDotIcon } from "@/utils/icons";
import { Category } from "@/utils/interface";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableLearningPointProps {
  id: string;
  idx: number;
  name: number;
  restField: Record<string, any>;
  onRemove: () => void;
}

const SortableLearningPoint: React.FC<SortableLearningPointProps> = ({
  id,
  idx,
  name,
  restField,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
        isDragging
          ? "border-secondary bg-blue-50/50 shadow-md ring-2 ring-secondary/20"
          : "border-slate-200/80 bg-slate-50/50 shadow-2xs"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing pl-1 py-1 shrink-0"
        title="Drag to reorder"
      >
        <SixDotIcon />
      </div>
      <span className="text-xs font-bold text-slate-400 w-5 text-center select-none shrink-0">
        {idx + 1}.
      </span>
      <Form.Item
        {...restField}
        name={name}
        rules={[{ required: true, message: "Enter an objective" }]}
        className="w-full !mb-0"
      >
        <Input
          placeholder="e.g. Understand core design systems and responsive token styling"
          className="!h-10 rounded-lg text-sm bg-white"
        />
      </Form.Item>
      <button
        type="button"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
        onClick={onRemove}
        title="Remove objective"
      >
        <DeleteIcon />
      </button>
    </div>
  );
};

export const Step2 = ({
  profilePhoto,
  setProfilePhoto,
  handleFileChange,
}: {
  profilePhoto: string | null;
  setProfilePhoto: Dispatch<SetStateAction<string | null>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}) => {
  console.log(setProfilePhoto);
  const { data: categories, loading: categoryLoading } = useCategories();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use category names as skill options so skills are meaningful & consistent
  const skillOptions = categories.map((cat: Category) => ({
    label: cat.category_name,
    value: cat.category_name,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Course Photo Card */}
      <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            Course Thumbnail
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload a high-quality cover image to represent your course across the platform
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0 shadow-inner group">
            <Image
              src={profilePhoto || DefaultImg}
              alt="Course thumbnail"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {profilePhoto && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded-md">
                  Change Photo
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-2">
            <label
              htmlFor="upload-photo"
              className="px-5 py-2.5 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary/90 transition shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {profilePhoto ? "Replace Thumbnail" : "Upload Thumbnail"}
            </label>
            <input
              id="upload-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-slate-400">
              Recommended: 1280 x 720 px (16:9 ratio). JPG, PNG or WebP up to 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Learning Outcomes & Skills Card */}
      <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            What You&apos;ll Learn & Skills
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            List the key takeaways and actionable competencies students will gain
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <label className="font-bold text-sm text-slate-800">
              Key Learning Objectives
            </label>
            <span className="text-xs text-slate-400">
              Drag by the handle on the left to reorder
            </span>
          </div>

          <Form.List name="learning_points">
            {(fields, { add, remove, move }) => {
              const handleDragEnd = (event: DragEndEvent) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                  const oldIndex = fields.findIndex(
                    (f) => String(f.key) === String(active.id)
                  );
                  const newIndex = fields.findIndex(
                    (f) => String(f.key) === String(over.id)
                  );
                  if (oldIndex !== -1 && newIndex !== -1) {
                    move(oldIndex, newIndex);
                  }
                }
              };

              return (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((f) => String(f.key))}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {fields.map(({ key, name, ...restField }, idx) => (
                        <SortableLearningPoint
                          key={key}
                          id={String(key)}
                          idx={idx}
                          name={name}
                          restField={restField}
                          onRemove={() => remove(name)}
                        />
                      ))}

                      <Button
                        onClick={() => add()}
                        className="w-full !h-11 flex items-center justify-center text-sm font-semibold !border-dashed !border-secondary !text-secondary hover:!bg-secondary/5 rounded-xl mt-1"
                      >
                        + Add Another Objective
                      </Button>
                    </div>
                  </SortableContext>
                </DndContext>
              );
            }}
          </Form.List>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
            <label className="font-bold text-sm text-slate-800">
              Skills You&apos;ll Gain
            </label>
            <p className="text-xs text-slate-400 -mt-1">
              Select key categories and topics that will appear as skill tags on the course card
            </p>
            <Form.Item
              className="!mb-0 mt-1"
              name="skills_you_gain"
              rules={[{ required: true, message: "Please select at least one skill" }]}
            >
              <Select
                mode="multiple"
                placeholder="-- Select categories as course skills --"
                loading={categoryLoading}
                className="w-full !min-h-[44px] text-start !rounded-xl"
                options={skillOptions}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    </div>
  );
};
