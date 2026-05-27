"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Col, Form, Row, Select, Input, Image, Spin } from "antd";
import { Rule } from "antd/es/form";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { UserProfileIcon } from "@/utils/icons";
import CommonButton from "@/components/CommonButton";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/UserDataSlice";
import { getOrganisationDetailsApi, createOrganisationApi } from "@/services/collections";
import { LoadingOutlined } from "@ant-design/icons";

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
        
        // Sync Redux store: if new organization was created/linked, update organization_id
        if (res.data?.organization_id && res.data.organization_id !== organizationId) {
          dispatch(setUser({
            ...userData!,
            organization_id: res.data.organization_id,
          }));
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
      <div className="w-full h-[300px] flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      <div>
        <h2 className="text-[20px] font-bold plus-jakarta-sans pb-3 border-b border-[#C8C8C8]">
          Organisation Profile
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {/* <div className="font-semibold text-lg text-gray-800">Organization Photo</div> */}
        <div className="flex gap-10 items-center flex-wrap md:flex-nowrap">
          {profilePhoto ? (
            <div className="w-[160px] h-[160px] rounded-full overflow-hidden border-2 border-gray-150">
              <Image
                src={profilePhoto}
                width={160}
                height={160}
                alt="Profile"
                preview={false}
                className="w-[160px] h-[160px] rounded-full object-cover"
              />
            </div>
          ) : (
            <UserProfileIcon height={"160px"} width={"160px"} />
          )}
          <div className="flex flex-col gap-[15px] justify-center h-full">
            <p className="font-semibold leading-[150%] text-gray-700">
              Choose an image from your computer{" "}
            </p>
            <p className="text-sm leading-[150%] text-[#767676]">
              Minimum size 100 x 100 px
            </p>
            <label className="border cursor-pointer border-[#68B8FF] rounded-[10px] w-[130px] h-[36px] flex items-center justify-center transition-colors hover:bg-blue-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="!hidden"
              />
              <span className="text-sm font-medium cursor-pointer text-[#68B8FF]">
                {profilePhoto ? "Change Logo" : "Upload Logo"}
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
            <Col key={field.key} span={field.colSpan} xs={24} sm={field.colSpan === 24 ? 24 : 12} lg={field.colSpan}>
              <Form.Item
                label={
                  <span className="!text-[15px] font-[500] text-gray-700">{field.label}</span>
                }
                name={field.key}
                rules={
                  [
                    { required: true, message: `${field.label} is required` },
                    field.key === "number_of_teachers"
                      ? {
                          pattern: /^(?:[1-9][0-9]{0,3}|10000)$/,
                          message: "Please enter a valid number of teachers",
                        }
                      : null,
                  ].filter(Boolean) as Rule[]
                }
              >
                {field.type === "input" ? (
                  <Input
                    placeholder={field.placeholder}
                    className="!h-[48px] text-sm !rounded-lg"
                  />
                ) : (
                  <Select
                    placeholder={field.placeholder}
                    prefixCls="custom-tag-select"
                    className="w-full !h-[48px] text-sm text-start !rounded-lg"
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
        <Form.Item className="!w-full !flex !items-center !justify-end mb-0 mt-4">
          <CommonButton 
            text={"Save Organisation Changes"} 
            loading={saving}
            disable={saving}
            type="submit"
            className="!w-fit !px-6 !bg-secondary text-white !h-[48px] !rounded-lg" 
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default OrganisationProfile;
