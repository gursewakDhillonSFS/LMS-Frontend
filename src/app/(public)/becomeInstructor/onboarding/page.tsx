"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Col, Form, Row, Select, Input, Image, DatePicker } from "antd";
import { toast } from "@/utils/toast";
import { HeaderLogoIcon } from "@/utils/icons";
import Link from "next/link";
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
import PhoneInput from "react-phone-input-2";
import dayjs from "dayjs";
import {
  BankOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  LogoutOutlined,
  LoadingOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";

import { categories as fallbackCategories } from "@/utils/constant";

const { Option } = Select;

interface Organisation {
  organization_id: string;
  name: string;
  email: string;
  number_of_teachers: number;
  organization_type: string;
  photo_url: string;
}

const ProfileSetup = () => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const instructorOnboarding = Cookies.get("instructor_onboarding");
  const [step, setStep] = useState<string>(instructorOnboarding === "2" ? "2" : "1");
  const dispatch = useDispatch();
  const router = useRouter();
  const [organisation, setOrganisation] = useState<Organisation>();
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const user_id = useSelector((state: RootState) => state?.userdata?.user_id);
  const organization_id = useSelector(
    (state: RootState) => state?.userdata?.organization_id
  );
  const userData = useSelector((state: RootState) => state?.userdata);
  const category = useSelector(
    (state: RootState) => state?.categories?.categories
  );

  const formattedCategories = useMemo(() => {
    const list = category && category.length > 0 ? category : fallbackCategories;
    return (
      list?.map((cat: { category_name?: string; category_id?: string; label?: string; value?: string }) => ({
        label: cat.category_name || cat.label || "",
        value: cat.category_name || cat.value || "",
      })) || []
    );
  }, [category]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp")) {
      toast.error("Only JPG, PNG, or WebP images are allowed.");
      return;
    }

    const fileURL = URL.createObjectURL(file);
    setProfilePhoto(fileURL);
    setUploadedFile(file);
  };

  const handleOrgSubmit = async (values: {
    name: string;
    email: string;
    number_of_teachers: string;
    organization_type: string;
  }) => {
    if (!uploadedFile && !profilePhoto) {
      toast.error("Please upload an organization brand logo to continue.");
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
          toast.success("Organization profile created successfully!");
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
        toast.error("Failed to create organization profile.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInstructorSubmit = async (values: {
    First_name: string;
    Last_name: string;
    gender: string;
    dob: dayjs.Dayjs | string;
    marital_status: string;
    email: string;
    phone_number: string;
    qualification: string;
    expert_in: string[];
  }) => {
    setLoading(true);
    const dobString = values?.dob ? dayjs(values.dob).format("YYYY-MM-DD") : "";
    const payload = {
      ...values,
      email: values?.email || userData?.email || "",
      dob: dobString,
      user_id,
    };

    try {
      const res = await createInstrucotor(payload);
      if (res.status) {
        toast.success(res.message || "Lead instructor profile verified!");
        const newTeacherId = res.teacher?._id || res.teacher?.instructor_id;
        if (newTeacherId) {
          dispatch(updateUser({ instructor_id: String(newTeacherId) }));
        }
        Cookies.set("instructor_onboarding", "undefined");
        router.push(RoutePaths?.InstructorPanel || "/instructorPanel");
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete instructor profile.");
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
      console.error(error);
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
      console.error(error);
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategoriesApi();
        if (res?.data?.length) {
          const formatted = res.data.map((cat: { category_id: string; category_name: string }) => ({
            label: cat.category_name,
            value: cat.category_name,
            category_id: cat.category_id,
            category_name: cat.category_name,
          }));
          dispatch(setCategories(formatted));
        }
      } catch {
        // silent
      }
    };
    loadCategories();
  }, [dispatch]);

  useEffect(() => {
    if (userData?.email) {
      form1.setFieldsValue({
        First_name: form1.getFieldValue("First_name") || userData.first_name,
        Last_name: form1.getFieldValue("Last_name") || userData.last_name,
        email: userData.email,
      });
    }
  }, [userData, form1]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("step");
      if (s === "1" || s === "2") {
        setStep(s);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-[72px] px-4 sm:px-8 lg:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <HeaderLogoIcon />
          </Link>
          <span className="hidden sm:inline-block w-[1px] h-5 bg-slate-200" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3B66FF] bg-[#EEF2FF] px-3 py-1 rounded-full border border-[#3B66FF]/20">
            <span>✦</span>
            <span>Instructor & Partner Studio</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
        >
          <LogoutOutlined className="text-slate-500" />
          <span>Exit Setup</span>
        </button>
      </header>

      {/* Main Form Content Canvas */}
      <main className="flex-1 relative overflow-hidden py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-start">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Studio Elevated Card */}
        <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08)] p-6 sm:p-10 flex flex-col gap-6 relative z-10">
          {/* Stepper Header */}
          <div className="flex flex-col gap-3.5 border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#3B66FF] bg-[#EEF2FF] px-3 py-1 rounded-full border border-[#3B66FF]/20">
                  Step {step} of 2 · {step === "1" ? "Organization Profile" : "Lead Instructor Credentials"}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {step === "1" ? "50% Complete" : "100% Complete"}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className="h-2 rounded-full overflow-hidden bg-slate-100 border border-slate-200/60"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      Number(step) >= s
                        ? "bg-gradient-to-r from-[#3B66FF] to-[#264DE4]"
                        : "bg-transparent"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Partner Studio Hero Banner (Coursera / Udemy Style) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
            <div className="flex flex-col gap-1 max-w-lg">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Skillora University & Academy Partner Program</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {step === "1"
                  ? "Tell Us About Your Organization"
                  : "Verify Lead Instructor Credentials"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {step === "1"
                  ? "Set up your academy identity. Create verified courses and reach hundreds of thousands of motivated learners worldwide."
                  : "Provide instructor details to configure verified certificates and direct course purchase permissions."}
              </p>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                ✦ 95% Revenue Share
              </span>
              <span className="text-[11px] text-slate-400">Direct Stripe Transfers</span>
            </div>
          </div>

          {/* STEP 1: Organization Details */}
          {step === "1" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Organization Brand Logo Upload Area */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-center gap-5">
                <div className="relative shrink-0">
                  {profilePhoto ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-sm relative bg-white">
                      <Image
                        src={profilePhoto}
                        alt="Organization Logo"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shadow-2xs">
                      <BankOutlined className="text-3xl text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500">LOGO</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Organization / Academy Logo
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Recommended: High-resolution square image (JPG, PNG, min 100x100px).
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer transition-all shadow-xs">
                    <UploadOutlined />
                    <span>{profilePhoto ? "Change Logo" : "Upload Brand Logo"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                className="w-full"
                onFinish={handleOrgSubmit}
              >
                <Row gutter={[20, 4]}>
                  {/* Organization Name */}
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Organization / Academy Name <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="name"
                      rules={[
                        { required: true, message: "Organization name is required" },
                        { min: 2, message: "Name must be at least 2 characters" },
                      ]}
                    >
                      <Input
                        placeholder="e.g., CodeCraft Academy, Stanford AI Lab"
                        className="!h-11 !rounded-xl !border-slate-300 text-sm"
                      />
                    </Form.Item>
                  </Col>

                  {/* Official Email */}
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Official Contact Email <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Official email is required" },
                        { type: "email", message: "Enter a valid email address" },
                      ]}
                    >
                      <Input
                        type="email"
                        placeholder="e.g., contact@youracademy.com"
                        className="!h-11 !rounded-xl !border-slate-300 text-sm"
                      />
                    </Form.Item>
                  </Col>

                  {/* Organization Type */}
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Organization Type <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="organization_type"
                      rules={[{ required: true, message: "Select organization type" }]}
                    >
                      <Select
                        placeholder="Select organization category"
                        className="w-full !h-11 text-sm text-start"
                      >
                        {["Institute", "University", "School", "Coaching", "Other"].map((opt) => (
                          <Option key={opt} value={opt}>
                            {opt}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Number of Teachers */}
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Faculty / Instructors Count <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="number_of_teachers"
                      rules={[
                        { required: true, message: "Faculty count is required" },
                        {
                          pattern: /^(?:[1-9][0-9]{0,2}|1000)$/,
                          message: "Please enter a number between 1 and 1000",
                        },
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        className="!h-11 !rounded-xl !border-slate-300 text-sm"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Form Actions */}
                <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#3B66FF] to-[#264DE4] hover:from-[#315CFF] hover:to-[#1D4ED8] text-white font-bold text-sm shadow-[0_2px_8px_rgba(49,92,255,0.25)] hover:shadow-[0_4px_14px_rgba(49,92,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading && <LoadingOutlined spin />}
                    <span>Save & Continue to Instructor Setup</span>
                    <ArrowRightOutlined />
                  </button>
                </div>
              </Form>
            </div>
          )}

          {/* STEP 2: Lead Instructor Details */}
          {step === "2" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <Form
                form={form1}
                layout="vertical"
                requiredMark={false}
                className="w-full"
                onFinish={handleInstructorSubmit}
              >
                <Row gutter={[20, 4]}>
                  {/* First Name */}
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          First Name <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="First_name"
                      rules={[{ required: true, message: "First name is required" }]}
                    >
                      <Input
                        placeholder="Enter first name"
                        className="!h-11 !rounded-xl !border-slate-300 text-sm"
                      />
                    </Form.Item>
                  </Col>

                  {/* Last Name */}
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Last Name <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="Last_name"
                      rules={[{ required: true, message: "Last name is required" }]}
                    >
                      <Input
                        placeholder="Enter last name"
                        className="!h-11 !rounded-xl !border-slate-300 text-sm"
                      />
                    </Form.Item>
                  </Col>

                  {/* Email */}
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Instructor Account Email <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Enter a valid email" },
                      ]}
                    >
                      <Input
                        type="email"
                        disabled
                        placeholder="instructor@youracademy.com"
                        className="!h-11 !rounded-xl !border-slate-300 text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
                      />
                    </Form.Item>
                  </Col>

                  {/* Phone Number */}
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Phone Number <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="phone_number"
                      rules={[{ required: true, message: "Phone number is required" }]}
                    >
                      <PhoneInput
                        country={"in"}
                        inputStyle={{
                          width: "100%",
                          height: "44px",
                          borderRadius: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "14px",
                          paddingLeft: "68px",
                        }}
                        buttonStyle={{
                          borderRadius: "12px 0 0 12px",
                          border: "1px solid #cbd5e1",
                          borderRight: "none",
                          backgroundColor: "#f8fafc",
                          width: "50px",
                        }}
                        inputClass="!pl-[68px]"
                        enableSearch={true}
                        containerClass="w-full"
                      />
                    </Form.Item>
                  </Col>

                  {/* Gender */}
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Gender <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="gender"
                      rules={[{ required: true, message: "Select gender" }]}
                    >
                      <Select placeholder="-- Select Gender --" className="w-full !h-11 text-sm text-start">
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Date of Birth */}
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Date of Birth (18+ Required) <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="dob"
                      rules={[
                        { required: true, message: "Date of birth is required" },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            const eighteenYearsAgo = dayjs().subtract(18, "year").endOf("day");
                            if (dayjs(value).isAfter(eighteenYearsAgo)) {
                              return Promise.reject(new Error("Lead instructor must be at least 18 years old"));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        placeholder="DD/MM/YYYY"
                        className="w-full !h-11 !rounded-xl !border-slate-300 text-sm"
                        disabledDate={(current) =>
                          current && current > dayjs().subtract(18, "year").endOf("day")
                        }
                        defaultPickerValue={dayjs().subtract(18, "year")}
                      />
                    </Form.Item>
                  </Col>

                  {/* Marital Status */}
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Marital Status <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="marital_status"
                      rules={[{ required: true, message: "Select status" }]}
                    >
                      <Select placeholder="-- Select Status --" className="w-full !h-11 text-sm text-start">
                        <Option value="Single">Single</Option>
                        <Option value="Married">Married</Option>
                        <Option value="Divorced">Divorced</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Highest Qualification */}
                  <Col xs={24}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Highest Academic / Professional Qualification <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="qualification"
                      rules={[{ required: true, message: "Qualification is required" }]}
                    >
                      <Input
                        placeholder="e.g., Ph.D. in Computer Science, M.S. Artificial Intelligence, Senior Principal Engineer"
                        className="!h-11 !rounded-xl !border-slate-300 text-sm"
                      />
                    </Form.Item>
                  </Col>

                  {/* Expert In (Category / Topics) */}
                  <Col xs={24}>
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-700">
                          Subject Matter Expertise / Teaching Domains <span className="text-rose-500">*</span>
                        </span>
                      }
                      name="expert_in"
                      rules={[
                        {
                          required: true,
                          type: "array",
                          min: 1,
                          message: "Select at least one expertise domain",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select domain categories you teach"
                        className="w-full min-h-[44px] text-sm text-start"
                        options={formattedCategories}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Form Actions with Solid High-Contrast Back Button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep("1")}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeftOutlined />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#3B66FF] to-[#264DE4] hover:from-[#315CFF] hover:to-[#1D4ED8] text-white font-bold text-sm shadow-[0_2px_8px_rgba(49,92,255,0.25)] hover:shadow-[0_4px_14px_rgba(49,92,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading && <LoadingOutlined spin />}
                    <span>Complete Onboarding & Launch Studio</span>
                    <ArrowRightOutlined />
                  </button>
                </div>
              </Form>
            </div>
          )}

          {/* Footer Partner Security & Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100/80">
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-500" />
              <span>95% Direct Revenue Share</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-500" />
              <span>Bank-Grade Stripe Connect Payouts</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <SafetyCertificateFilled className="text-emerald-500" />
              <span>Direct Single Course Purchase Architecture</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSetup;
