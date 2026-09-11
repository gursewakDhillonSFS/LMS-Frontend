"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Form, Select, Input, Spin } from "antd";
import { Rule } from "antd/es/form";
import { useSelector, useDispatch } from "react-redux";
import {
  BankOutlined,
  MailOutlined,
  TeamOutlined,
  UploadOutlined,
  LoadingOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import Image from "next/image";

import { toast } from "@/utils/toast";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/UserDataSlice";
import { getOrganisationDetailsApi, createOrganisationApi } from "@/services/collections";

const { Option } = Select;

const OrganisationProfile = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.userdata);
  const organizationId = userData?.organization_id;
  const userId = userData?.user_id;

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOrgDetails = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoadingData(true);
      const res = await getOrganisationDetailsApi(organizationId);
      if (res?.status && res?.data) {
        form.setFieldsValue({
          name: res.data.name,
          email: res.data.email,
          number_of_teachers: res.data.number_of_teachers?.toString(),
          organization_type: res.data.organization_type,
        });
        if (res.data.photo_url) {
          setProfilePhoto(res.data.photo_url);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load organization details");
    } finally {
      setLoadingData(false);
    }
  }, [organizationId, form]);

  useEffect(() => {
    fetchOrgDetails();
  }, [fetchOrgDetails]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed.");
        return;
      }

      const fileURL = URL.createObjectURL(file);
      setProfilePhoto(fileURL);
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    email: string;
    number_of_teachers: string;
    organization_type: string;
  }) => {
    try {
      setSaving(true);
      const formData = new FormData();
      if (uploadedFile) {
        formData.append("photo", uploadedFile);
      }

      const payload = {
        ...values,
        user_id: userId,
      };
      formData.append("payload", JSON.stringify(payload));

      const res = await createOrganisationApi(formData);
      if (res?.status) {
        toast.success("Organization profile updated successfully!");

        if (res.data?.organization_id && res.data.organization_id !== organizationId) {
          dispatch(
            setUser({
              ...userData!,
              organization_id: res.data.organization_id,
            })
          );
        }

        if (res.data?.photo_url) {
          setProfilePhoto(res.data.photo_url);
        }
      } else {
        toast.error(res?.message || "Failed to save organization changes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving changes");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#F2F4F7]">
        <h3 className="text-lg font-bold text-[#101828]">Organization Profile</h3>
        <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
          Manage your institution details, branding logo, and faculty capacity.
        </p>
      </div>

      {/* BRANDING LOGO SECTION */}
      <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-[#E4E7EC] shadow-2xs shrink-0 flex items-center justify-center">
          {profilePhoto ? (
            <Image
              src={profilePhoto}
              alt="Organization Logo"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <BankOutlined className="text-3xl text-slate-400" />
          )}
        </div>

        <div className="space-y-2 flex-1 text-center sm:text-left">
          <span className="text-sm font-bold text-[#101828] block">Organization Brand Logo</span>
          <p className="text-xs text-[#667085]">
            Upload high-resolution square logo (PNG, JPG, SVG). Recommended 400x400px.
          </p>
          <div>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-slate-50 hover:border-[#315CFF] cursor-pointer transition-colors shadow-2xs">
              <UploadOutlined />
              <span>{profilePhoto ? "Change Logo" : "Upload Brand Logo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* FORM FIELDS */}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              Institution Name <span className="text-red-500">*</span>
            </label>
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Organization name is required" }]}
              className="mb-0"
            >
              <Input
                prefix={<BankOutlined className="text-slate-400 mr-1.5" />}
                placeholder="e.g. Acme Tech Academy"
                className="!py-2.5 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
              />
            </Form.Item>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              Official Email Address <span className="text-red-500">*</span>
            </label>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}
              className="mb-0"
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 mr-1.5" />}
                placeholder="contact@institution.edu"
                className="!py-2.5 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
              />
            </Form.Item>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              Organization Type <span className="text-red-500">*</span>
            </label>
            <Form.Item
              name="organization_type"
              rules={[{ required: true, message: "Please select organization type" }]}
              className="mb-0"
            >
              <Select
                size="large"
                placeholder="Select category"
                className="w-full !rounded-xl"
                options={[
                  { value: "School", label: "School" },
                  { value: "Institute", label: "Institute" },
                  { value: "University", label: "University" },
                  { value: "Coaching", label: "Coaching Center" },
                  { value: "Other", label: "Other Enterprise" },
                ]}
              />
            </Form.Item>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              Estimated Faculty Size (Teachers) <span className="text-red-500">*</span>
            </label>
            <Form.Item
              name="number_of_teachers"
              rules={[
                { required: true, message: "Please specify number of teachers" },
                {
                  pattern: /^(?:[1-9][0-9]{0,3}|10000)$/,
                  message: "Please enter a valid count",
                },
              ]}
              className="mb-0"
            >
              <Input
                prefix={<TeamOutlined className="text-slate-400 mr-1.5" />}
                placeholder="e.g. 25"
                className="!py-2.5 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving Changes..." : "Save Organization Profile"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default OrganisationProfile;
