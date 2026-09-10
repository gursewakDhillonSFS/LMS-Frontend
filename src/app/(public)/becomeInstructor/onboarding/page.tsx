"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Col, Form, Row, Select, Input, Image } from "antd";
import { Rule } from "antd/es/form";
import { toast } from "@/utils/toast";
import { HeaderLogoIcon, UserProfileIcon } from "@/utils/icons";
import Link from "next/link";
import CommonLink from "@/components/CommonLink";
import CommonButton from "@/components/CommonButton";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { resetAllSlices } from "@/redux/resetSlice";
import Cookies from "js-cookie";
import {
  createInstrucotor,
  createOrganisationApi,
  getAllCategoriesApi,
  getOrganisation,
} from "@/services/collections";
import { setCategories } from "@/redux/slices/CategoriesSlice";
import { updateUser } from "@/redux/slices/UserDataSlice";
import { RootState } from "@/redux/store";
import { RoutePaths } from "@/utils/enums";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { renderFormItem } from "@/utils/commonFunctions";

const { Option } = Select;

interface FieldDefinition {
  key: string;
  label: string;
  type: "input" | "select";
  placeholder?: string;
  defaultValue?: string | string[];
  disabled?: boolean;
  mode?: "multiple";
  options?: string[];
  colSpan: number;
}

interface Organisation {
  organization_id: string;
  name: string;
  email: string;
  number_of_teachers: number;
  organization_type: string;
  photo_url: string;
}

export interface UploadedMedia {
  media: string;
}

const fields: FieldDefinition[] = [
  {
    key: "name",
    label: "Organization Name",
    type: "input",
    placeholder: "Enter organization name",
    colSpan: 24,
  },
  {
    key: "email",
    label: "Email Address",
    type: "input",
    placeholder: "Enter email address",
    colSpan: 8,
  },
  {
    key: "number_of_teachers",
    label: "No. of Teachers",
    type: "input",
    placeholder: "Enter no. of teachers",
    colSpan: 8,
  },
  {
    key: "organization_type",
    label: "Organization Type",
    type: "select",
    placeholder: "Select organization type",
    options: ["School", "Institute", "University", "Coaching", "Other"],
    colSpan: 8,
  },
];

const ProfileSetup = () => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const instructorOnboarding = Cookies.get("instructor_onboarding");
  const [step, setStep] = useState(instructorOnboarding || "1");
  const dispatch = useDispatch();
  const router = useRouter();
  const [organisation, setOrganisation] = useState<Organisation>();
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const user_id = useSelector((state: RootState) => state?.userdata?.user_id);
  const organization_id = useSelector(
    (state: RootState) => state?.userdata?.organization_id
  );
  const category = useSelector(
    (state: RootState) => state?.categories?.categories
  );

  // const formattedCategories = useMemo(() => {
  //   return (
  //     category?.map((cat: Category) => ({
  //       label: cat.category_name,
  //       value: cat.category_id,
  //     })) || []
  //   );
  // }, [category]);

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
      options: category,
      colSpan: 24,
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(file.type === "image/jpeg" || file.type === "image/png")) {
      toast.error("Only JPG or PNG images are allowed.");
      return;
    }

    const fileURL = URL.createObjectURL(file);
    setProfilePhoto(fileURL);

    setProfilePhoto(fileURL);
    setUploadedFile(file);
  };

  const handleSubmit = async (values: {
    name: string;
    email: string;
    number_of_teachers: string;
    organization_type: string;
  }) => {
    // Photo is only required when creating for the first time (no existing org)
    if (!uploadedFile && !profilePhoto) {
      toast.error("Please upload an organization image.");
      return;
    }

    const formData = new FormData();
    if (uploadedFile) {
      formData.append("photo", uploadedFile);
    }

    if (user_id) {
      const payload = {
        ...values,
        user_id,
      };
      formData.append("payload", JSON.stringify(payload));

      try {
        setLoading(true);

        const response = await createOrganisationApi(formData);

        if (response?.status) {
          toast.success("Organization created successfully!");
          const newOrgId = response.data?._id || response.data?.organization_id;
          if (newOrgId) {
            dispatch(updateUser({ organization_id: String(newOrgId) }));
          }
          setStep("2");
          Cookies.set("instructor_onboarding", "2");
        } else {
          toast.warning(response?.message ?? "Something went wrong");
        }
      } catch (err) {
        console.error("Submission error:", err);
        toast.error("Failed to create organization.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInstructorSubmit = async (value: {
    First_name: string;
    Last_name: string;
    gender: "Male" | "Female" | "Other" | string;
    dob: string;
    marital_status: "Single" | "Married" | "Divorced" | string;
    email: string;
    phone_number: string;
    qualification: string;
    expert_in: string[];
    user_id?: string;
  }) => {
    setLoading(true);
    value.user_id = user_id;
    if (value?.dob) {
      value.dob = new Date(value.dob).toISOString().split("T")[0];
    }

    try {
      const res = await createInstrucotor(value);
      if (res.status) {
        toast.success(res.message);
        const newTeacherId = res.teacher?._id || res.teacher?.instructor_id;
        if (newTeacherId) {
          dispatch(updateUser({ instructor_id: String(newTeacherId) }));
        }
        Cookies.set("instructor_onboarding", "undefined");
        router.push(RoutePaths?.InstructorPanel);
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getOrganisationData = useCallback(async () => {
    if (!organization_id) return;

    try {
      const res = await getOrganisation(organization_id);
      if (res.status) {
        setOrganisation(res?.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [organization_id]);

  const handleLogout = () => {
    setLoading(true);
    try {
      Cookies.remove("token");
      Cookies.remove("role_name");
      Cookies.remove("user_onboarding");
      Cookies.remove("instructor_onboarding");
      Cookies.remove("profileStatus");
      dispatch(resetAllSlices());
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrganisationData();
  }, [getOrganisationData]);

  useEffect(() => {
    if (organisation) {
      form.setFieldsValue({
        name: organisation?.name,
        email: organisation?.email,
        number_of_teachers: organisation?.number_of_teachers,
        organization_type: organisation?.organization_type,
      });

      if (organisation?.photo_url) {
        const fullImageUrl = organisation.photo_url.startsWith("http")
          ? organisation.photo_url
          : `${process.env.NEXT_PUBLIC_BASE_URL}/${organisation.photo_url}`;
        setProfilePhoto(fullImageUrl);
      }
    }
  }, [organisation, form]);

  // Fetch categories on mount so expert_in select is populated
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategoriesApi();
        if (res?.data?.length) {
          const formatted = res.data.map((cat: { category_id: string; category_name: string }) => ({
            label: cat.category_name,
            value: cat.category_name, // store name so expert_in saves readable strings
            category_id: cat.category_id,
            category_name: cat.category_name,
          }));
          dispatch(setCategories(formatted));
        }
      } catch {
        // silent — non-blocking
      }
    };
    loadCategories();
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <div>
      <div className="sticky top-0 z-50 bg-white flex items-center justify-between w-full h-[82px] border-b-[1px] border-[#D8D8D8] px-[20px] py-[8px] lg:px-[40px] lg:py-[16px]">
        <Link href={"/"}>
          <HeaderLogoIcon />
        </Link>

        <CommonLink
          text={"Logout"}
          onClick={handleLogout}
          className="text-[16px] !text-[#FB4A49] font-[700]"
        />
      </div>
      <div
        className={`w-full h-full flex flex-col justify-center py-8 px-[40px] xl:px-60 gap-8 ${
          step === "1" ? "block" : "hidden"
        }`}
      >
        <div>
          <p className=" text-[32px] font-bold text-black text-center">
            Tell Us About Your Organization
          </p>
          <p className=" text-[20px] text-[#6B6B6B] text-center">
            Fill the basic details of your organization to help us to know more
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="font-semibold text-xl">Organization Photo</div>
          <div className="flex gap-10 items-center">
            {profilePhoto ? (
              <Image
                src={profilePhoto ?? ""}
                width={160}
                height={160}
                alt="Profile"
                className="w-[150px] h-[150px] rounded-full object-cover "
              />
            ) : (
              <UserProfileIcon height={"160px"} width={"160px"} />
            )}
            <div className="flex flex-col gap-[15px] justify-center h-full">
              <p className="font-semibold leading-[150%]">
                Choose an image from your computer{" "}
              </p>
              <p className="text-sm leading-[150%] text-[#767676]">
                Minimum size 100 x 100 px
              </p>
              <label className="border cursor-pointer border-[#68B8FF] rounded-[10px] w-[120px] h-[32px] text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="!hidden"
                />
                <span className="text-sm text-center font medium cursor-pointer text-[#68B8FF]">
                  {profilePhoto ? "Change Image" : "Upload Image"}
                </span>
              </label>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          className="w-full"
          onFinish={handleSubmit}
        >
          <Row gutter={[16, 0]}>
            {fields.map((field) => (
              <Col key={field.key} span={field.colSpan}>
                <Form.Item
                  label={
                    <span className="!text-[16px] font-[400]">
                      {field.label}
                    </span>
                  }
                  name={field.key}
                  rules={
                    [
                      {
                        required: true,
                        message: `${field.label} is required`,
                      },
                      field.key === "number_of_teachers"
                        ? {
                            pattern: /^(?:[1-9][0-9]{0,2}|1000)$/,
                            message: "Please enter a number between 1 and 1000",
                          }
                        : null,
                      field.key === "email"
                        ? {
                            type: "email",
                            message: "Please enter a valid email",
                          }
                        : null,
                      field.key === "name"
                        ? {
                            min: 2,
                            message:
                              "Organisation name must be at least 2 characters",
                          }
                        : null,
                    ].filter(Boolean) as Rule[]
                  }
                >
                  {field.type === "input" ? (
                    <Input
                      placeholder={field.placeholder}
                      className="!h-[56px] text-sm !rounded-lg"
                    />
                  ) : (
                    <Select
                      placeholder={field.placeholder}
                      prefixCls="custom-tag-select"
                      className="w-full !h-[56px] text-sm text-start !rounded-lg"
                    >
                      {field.options?.map((opt) => (
                        <Option key={opt} value={opt}>
                          {opt}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Form.Item className="!w-full !flex !items-center !justify-center !mt-5">
            <CommonButton
              text={"Continue"}
              loading={loading}
              className="!w-[150px]"
            />
          </Form.Item>
        </Form>
      </div>
      <div
        className={`w-full h-full flex flex-col justify-center py-8 px-[40px] xl:px-60 gap-8 ${
          step === "1" ? "hidden" : "block"
        }`}
      >
        <div>
          <p className=" text-[32px] font-bold text-black text-center">
            Tell Us About Instructor
          </p>
          <p className=" text-[20px] text-[#6B6B6B] text-center">
            Fill the basic details of instructor to help us to know more
          </p>
        </div>
        <Form
          form={form1}
          onFinish={handleInstructorSubmit}
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
          <div className="flex gap-3">
            <CommonButton
              text={"Back"}
              onClick={() => setStep("1")}
              className="!w-[150px] !bg-transparent !border"
            />
            <CommonButton
              text={"Finish"}
              loading={loading}
              className="!w-[150px]"
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProfileSetup;
