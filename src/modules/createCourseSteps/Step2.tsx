"use client";
import useCategories from "@/hooks/useCategories";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { DefaultImg } from "@/utils/images";
import { Button, Form, Input, Select } from "antd";
import { DeleteIcon, SixDotIcon } from "@/utils/icons";
import { Category } from "@/utils/interface";

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

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-slate-200/60 bg-slate-50/40">
          <div className="relative w-[220px] h-[140px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs">
            <Image
              src={
                profilePhoto
                  ? profilePhoto
                  : typeof DefaultImg === "string"
                  ? DefaultImg
                  : DefaultImg.src
              }
              fill
              unoptimized
              alt="Course Thumbnail"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                Choose a banner from your device
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Recommended 16:9 ratio (1280x720px), PNG, JPG or WEBP. Max 10MB.
              </p>
            </div>

            <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-secondary bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold cursor-pointer transition-colors w-fit">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span>{profilePhoto ? "Replace Image" : "Upload Image"}</span>
            </label>
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
          </div>

          <Form.List name="learning_points">
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-3">
                {fields.map(({ key, name, ...restField }, idx) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 shadow-2xs"
                  >
                    <div className="text-slate-400 cursor-grab pl-1">
                      <SixDotIcon />
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-5 text-center">
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
                      onClick={() => remove(name)}
                      title="Remove objective"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))}

                <Button
                  onClick={() => add()}
                  className="w-full !h-11 flex items-center justify-center text-sm font-semibold !border-dashed !border-secondary !text-secondary hover:!bg-secondary/5 rounded-xl mt-1"
                >
                  + Add Another Objective
                </Button>
              </div>
            )}
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
