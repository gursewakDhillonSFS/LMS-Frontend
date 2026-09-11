"use client";

import { renderFormItem } from "@/utils/commonFunctions";
import { UserProfileIcon1 } from "@/utils/icons";
import { CreateCourseStep1Prop, InstructorRecord } from "@/utils/interface";
import { Form, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import CommonButton from "../CommonButton";
import { updateInstructor } from "@/services/collections";
import { toast } from "@/utils/toast";
import useCategories from "@/hooks/useCategories";
import dayjs from "dayjs";
import Image from "next/image";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { CloseOutlined, EditOutlined, CameraOutlined } from "@ant-design/icons";

interface EditTeacherDetailModalProps {
  open: boolean;
  onCancel: () => void;
  editInstructorData: InstructorRecord | undefined;
  getDetails: () => Promise<void>;
}

export const EditTeacherDetailModal: React.FC<EditTeacherDetailModalProps> = ({
  open,
  onCancel,
  editInstructorData,
  getDetails,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        console.error("Only image files are allowed.");
        return;
      }

      const fileURL = URL.createObjectURL(file);
      setProfilePhoto(fileURL);
      setPhotoFile(file);
    }
  };

  const { data, loading: CategoryLoading } = useCategories();

  const inviteTeacherFields: CreateCourseStep1Prop[] = [
    {
      key: "First_name",
      label: "First Name",
      type: "input",
      placeholder: "Enter first name",
      colSpan: 12,
    },
    {
      key: "Last_name",
      label: "Last Name",
      type: "input",
      placeholder: "Enter last name",
      colSpan: 12,
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      placeholder: "--Select Option--",
      options: [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ],
      colSpan: 8,
    },
    {
      key: "dob",
      label: "D.O.B.",
      type: "date",
      placeholder: "DD/MM/YYYY",
      colSpan: 8,
    },
    {
      key: "marital_status",
      label: "Marital Status",
      type: "select",
      placeholder: "--Select Option--",
      options: [
        { label: "Single", value: "Single" },
        { label: "Married", value: "Married" },
        { label: "Divorced", value: "Divorced" },
      ],
      colSpan: 8,
    },
    {
      key: "email",
      label: "Email Address",
      type: "input",
      placeholder: "Enter email address",
      colSpan: 12,
    },
    {
      key: "phone_number",
      label: "Phone Number",
      type: "phone",
      placeholder: "Enter phone number",
      colSpan: 12,
    },
    {
      key: "qualification",
      label: "Qualification",
      type: "input",
      placeholder: "Enter qualification",
      colSpan: 24,
    },
    {
      key: "expert_in",
      label: "Expert In",
      type: "select",
      mode: "multiple",
      placeholder: "--Select Option--",
      options: data,
      loading: CategoryLoading,
      colSpan: 24,
    },
  ];

  const handleSubmit = async (value: {
    First_name?: string;
    Last_name?: string;
    email: string;
    gender?: string;
    dob?: string | Date;
    marital_status: string;
    phone_number: string;
    qualification: string;
    expert_in: string[];
    instructor_id: string;
  }) => {
    setLoading(true);
    const dob = value?.dob
      ? new Date(value.dob).toISOString().split("T")[0]
      : undefined;
    const payload = {
      ...value,
      dob,
      status: "active",
      instrcutor_id: editInstructorData?.instructor_id,
      name: `${value.First_name} ${value.Last_name}`,
    };

    delete payload.First_name;
    delete payload.Last_name;
    delete payload.gender;

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const res = await updateInstructor(formData);
      if (res.status) {
        toast.success(res.message);
        getDetails();
        onCancel();
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editInstructorData) {
      const {
        name,
        email,
        gender,
        dob,
        marital_status,
        phone_number,
        qualification,
        expert_in,
      } = editInstructorData;

      const [First_name, ...lastNameParts] = (name || "").split(" ");
      const Last_name = lastNameParts.join(" ");

      form.setFieldsValue({
        First_name,
        Last_name,
        email,
        gender,
        dob: dob ? dayjs(dob) : undefined,
        marital_status,
        phone_number,
        qualification,
        expert_in,
      });

      if (editInstructorData?.image_url) {
        setProfilePhoto(
          isValidUrl(getImageUrl(editInstructorData.image_url))
            ? getImageUrl(editInstructorData.image_url)
            : null
        );
      } else {
        setProfilePhoto(null);
      }
    } else {
      setProfilePhoto(null);
      setPhotoFile(null);
      form.resetFields();
    }
  }, [editInstructorData, open, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      centered
      closable={false}
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <EditOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Edit Teacher Information
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update instructor profile details and credentials
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="w-full flex flex-col"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-5">
            {/* Photo upload section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs bg-slate-200 flex items-center justify-center">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <UserProfileIcon1 />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-sm text-slate-900">
                  Instructor Profile Photo
                </span>
                <p className="text-xs text-slate-500">
                  Recommended size: square aspect ratio, at least 200x200px (JPG, PNG)
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer w-fit transition-colors">
                  <CameraOutlined />
                  <span>{profilePhoto ? "Change Photo" : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Field Grid */}
            <Row gutter={[16, 0]} className="w-full">
              {inviteTeacherFields.map((field) => (
                <React.Fragment key={field?.key}>
                  {renderFormItem(field)}
                </React.Fragment>
              ))}
            </Row>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CommonButton
              loading={loading}
              text="Update Teacher"
              className="!bg-[#315CFF] text-white !py-2.5 !px-6 !rounded-xl font-semibold text-sm shadow-xs"
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};
