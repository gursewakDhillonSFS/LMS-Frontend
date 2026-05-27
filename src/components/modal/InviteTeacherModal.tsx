"use client";
import { renderFormItem } from "@/utils/commonFunctions";
import { CloseIcon } from "@/utils/icons";
import { CreateCourseStep1Prop } from "@/utils/interface";
import { Form, Modal, Row } from "antd";
import React, { useState } from "react";
import CommonButton from "../CommonButton";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { createInstrucotor } from "@/services/collections";
import { toast } from "react-toastify";
import useCategories from "@/hooks/useCategories";

interface InviteTeacherModalProps {
  open: boolean;
  onCancel: () => void;
  fetchAllTeacher: () => Promise<void>;
}

export const InviteTeacherModal: React.FC<InviteTeacherModalProps> = ({
  open,
  onCancel,
  fetchAllTeacher,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const user_id = useSelector((state: RootState) => state?.userdata?.user_id);

  const { data, loading: CategoryLoading } = useCategories();

  // const formattedCategories = useMemo(() => {
  //   return (
  //     data?.map((cat: Category) => ({
  //       label: cat.category_name,
  //       value: cat.category_id,
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

  const handleSubmit = async () => {
    setLoading(true);
    const value = form.getFieldsValue();
    value.user_id = user_id;
    if (value?.dob) {
      value.dob = new Date(value.dob).toISOString().split("T")[0];
    }
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

    try {
      // const updatedValue = { ...value, dob: value?.dob?.split("T")?.[0] };
      const res = await createInstrucotor(value);
      if (res.status) {
        toast.success(res.message);
        form.resetFields();
        fetchAllTeacher();
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

  const handleClose = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      footer={null}
      width={700}
      closable={false}
      className="relative"
      prefixCls="confirmation-modal"
    >
      <button
        onClick={handleClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full  flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon color="black" />
      </button>
      <div className="w-full px-4 flex flex-col items-center justify-center gap-[16px]">
        <h1 className="text-[24px] font-bold">Invite Teacher</h1>
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
              text={"Invite"}
              className={`!bg-secondary text-white !w-[20%]`}
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};
