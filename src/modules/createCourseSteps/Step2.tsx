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
    <div className="flex flex-col gap-4">
      <div className="rounded-xl p-6 bg-white flex flex-col gap-4">
        <div className="font-semibold text-xl">Course Photo</div>
        <div className="flex gap-10 items-center">
          <Image
            src={
              profilePhoto
                ? profilePhoto
                : typeof DefaultImg === "string"
                ? DefaultImg
                : DefaultImg.src
            }
            width={180}
            height={180}
            unoptimized
            alt="Profile"
            className="w-[180px] h-[180px] rounded-xl object-cover "
          />
          <div className="flex flex-col gap-[12px] justify-center h-full">
            <p className="font-semibold text-[16px] plus-jakarta-sans">
              Choose an image from your computer
            </p>
            <p className="text-sm text-[#767676]">Minimum size 100 x 100 px</p>
            <label className="flex items-center justify-center border cursor-pointer border-[#68B8FF] rounded-[10px] w-[120px] h-[32px] text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="!hidden"
              />
              <span className="text-sm text-center cursor-pointer text-[#68B8FF]">
                {profilePhoto ? "Change Image" : "Upload Image"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* What you'll learn */}
      <div className="rounded-xl p-6 bg-white">
        <div className="flex flex-col gap-4">
          <label className="font-semibold text-xl">
            What you&apos;ll learn
          </label>
          <Form.List name="learning_points">
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-3">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex items-center gap-3">
                    <SixDotIcon />
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[{ required: true, message: "Enter a point" }]}
                      className="w-full !mb-0"
                    >
                      <Input
                        placeholder="Add Point"
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
                  onClick={() => add()}
                  className="flex items-center justify-center text-base !border !border-secondary !text-secondary"
                >
                  + Add a point
                </Button>
              </div>
            )}
          </Form.List>

          <div className="flex flex-col gap-2 mt-4">
            <p className="font-semibold text-base">Skills you&apos;ll gain</p>
            <Form.Item
              className="!mb-4"
              name="skills_you_gain"
              rules={[{ required: true, message: "Please select at least one skill" }]}
            >
              <Select
                mode="multiple"
                placeholder="--Select categories as skills--"
                loading={categoryLoading}
                className="w-full !h-[48px] text-start !rounded-lg"
                options={skillOptions}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    </div>
  );
};
