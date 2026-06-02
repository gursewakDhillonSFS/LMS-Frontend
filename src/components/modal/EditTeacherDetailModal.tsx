"use client";
import { renderFormItem } from "@/utils/commonFunctions";
import { CloseIcon, UserProfileIcon1 } from "@/utils/icons";
import { CreateCourseStep1Prop, InstructorRecord } from "@/utils/interface";
import { Form, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import CommonButton from "../CommonButton";
import { updateInstructor } from "@/services/collections";
import { toast } from "react-toastify";
import useCategories from "@/hooks/useCategories";
import dayjs from "dayjs";
import Image from "next/image";
import { getImageUrl, isValidUrl } from "@/utils/comman";

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

  console.log(photoFile);

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

  // const formattedCategories = useMemo(() => {
  //   return (
  //     data?.map((cat: Category) => ({
  //       label: cat.category_name,
  //       value: cat.category_name,
  //     })) || []
  //   );
  // }, [data]);

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

    // let phoneNumber = "";
    // let countryCode = "";
    // if (value?.phone) {
    //   const parsedPhoneNumber = parsePhoneNumberFromString("+" + value.phone);
    //   if (parsedPhoneNumber && parsedPhoneNumber.isValid()) {
    //     phoneNumber = parsedPhoneNumber.nationalNumber;
    //     countryCode = parsedPhoneNumber.countryCallingCode;
    //   } else {
    //     console.log("Invalid phone number format", value.phone);
    //     return;
    //   }
    // }
    // value.phone = phoneNumber;
    // value.countryCode = countryCode;

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

      const [First_name, ...lastNameParts] = name.split(" ");
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
        console.log("hello");
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
      width={700}
      closable={false}
      className="relative !top-10 scrollbar-hide"
      prefixCls="confirmation-modal"
    >
      <button
        onClick={onCancel}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full  flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon color="black" />
      </button>
      <div className="w-full px-4 flex flex-col items-center justify-center gap-[16px]">
        <h1 className="text-[24px] font-bold">Edit Teacher Info</h1>
        <div className="flex flex-col gap-2 w-full">
          <div className="font-semibold text-xl">Instructor Photo</div>
          <div className="flex gap-5 items-center">
            {profilePhoto ? (
              <Image
                src={profilePhoto}
                width={180}
                height={180}
                alt="Profile"
                unoptimized
                className="w-[180px] h-[180px] rounded-full object-cover "
              />
            ) : (
              <UserProfileIcon1 />
            )}
            <div className="flex flex-col gap-[12px] justify-center h-full">
              <p className="font-semibold text-[16px] plus-jakarta-sans">
                Choose an image from your computer
              </p>
              <p className="text-sm text-[#767676]">
                Minimum size 100 x 100 px
              </p>
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
        <Form
          form={form}
          onFinish={handleSubmit}
          className="!w-full !flex !flex-col !items-center"
        >
          <Row gutter={[16, 0]} className="w-full">
            {inviteTeacherFields.map((field) => {
              return (
                <React.Fragment key={field?.key}>
                  {renderFormItem(field)}
                </React.Fragment>
              );
            })}
          </Row>
          <div className="flex items-center justify-end w-full">
            <CommonButton
              loading={loading}
              text={"Update"}
              className={`!bg-secondary text-white !w-[20%]`}
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};
