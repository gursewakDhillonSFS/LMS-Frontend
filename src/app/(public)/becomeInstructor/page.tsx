"use client";
import CommonButton from "@/components/CommonButton";
import CommonInput from "@/components/CommonInput";
import CommonLink from "@/components/CommonLink";
import { useFacebookSdk } from "@/hooks/useFacebookSdk";
import { setSignin } from "@/redux/slices/AuthModalSlice";
import { setUser } from "@/redux/slices/UserDataSlice";
import { createUserApi, socialAuth } from "@/services/collections";
import { Role, RoutePaths } from "@/utils/enums";
import {
  AppleIcon,
  FacebookIcon,
  GoogleIcon,
  HeaderLogoIcon,
} from "@/utils/icons";
import { InstructorLeftImage } from "@/utils/images";
import { LeftOutlined } from "@ant-design/icons";
import { useGoogleLogin } from "@react-oauth/google";
import { Button, Form } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const authOptions = [
  {
    key: "google",
    label: "Continue with Google",
    icon: <GoogleIcon />,
  },
  {
    key: "facebook",
    label: "Continue with Facebook",
    icon: <FacebookIcon />,
  },
  {
    key: "apple",
    label: "Continue with Apple",
    icon: <AppleIcon />,
  },
];

const BecomeInstructor = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const isFacebookReady = useFacebookSdk();

  const onFinish = async (values: {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
  }) => {
    try {
      setLoading(true);
      const response = await createUserApi({
        ...values,
        signup_type: "instructor",
      });
      console.log(response);
      if (response?.status) {
        dispatch(
          setUser({
            ...response?.data,
          })
        );
        router.push(`${RoutePaths?.BecomeInstructor}/onboarding`);
      } else {
        toast.warning(response?.message ?? "Something Went Wrong");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB || !isFacebookReady) return;
    window.FB.login(
      (response: Facebook.LoginStatusResponse) => {
        console.log("FB login response", response);

        const token = response?.authResponse?.accessToken;

        if (!token) {
          console.error("No access token received from Facebook.");
          return;
        }

        handleSocialAuth(token);
      },
      { scope: "email,public_profile" }
    );
  };

  const handleSocialAuth = async (token: string) => {
    const payload = {
      provider: "facebook",
      token: token,
      role_name: Role?.INSTRUCTOR,
    };

    try {
      const res = await socialAuth(payload);
      if (res?.status) {
        console.log("Auth Success:", res);
      }
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log(tokenResponse);
        const payload = {
          provider: "google",
          token: tokenResponse?.access_token,
          role_name: Role?.STUDENT,
        };
        const response = await socialAuth(payload);
        if (response?.status) {
          console.log(response);
        }
      } catch (err) {
        console.error("Google auth error", err);
        toast.error("Google authentication failed");
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  return (
    <div className="w-full h-screen flex">
      <div className="hidden lg:block lg:w-[30%] sticky top-0">
        <div className="relative ">
          <Image
            alt="left image"
            className="!w-full !h-screen"
            src={InstructorLeftImage}
          />
          <div className="absolute top-[65px] left-[26px] flex flex-col items-center">
            <HeaderLogoIcon
              iconColor="var(--secondary)"
              width="200"
              height="100"
            />
            <div className="text-center px-10">
              Amet ac sed amet ornare ultricies ut vitae semper. Et scelerisque
              aliquet pulvinar amet pharetra lacinia porttitor.
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[70%] overflow-auto scrollbar-hide">
        <div className="flex items-center justify-between pt-[36px] px-[20px] sticky top-0 z-50 bg-white">
          <div className="flex gap-3 items-center">
            <LeftOutlined width={36} height={36} />
            <CommonLink
              text="Return Website"
              className="!text-[#2D2D2D] !font-[400]"
            />
          </div>
          <div className="flex items-center justify-center gap-[6px]">
            <span className="text-[#1C1C1C]">Already have an account?</span>
            <CommonLink
              text="LOG IN"
              className="underline"
              onClick={() => dispatch(setSignin(true))}
            />
          </div>
        </div>

        <div className="w-1/2 mx-auto my-10">
          <div className="flex flex-col items-center justify-center">
            <h1 className={`fjalla-one-regular  text-[36px]`}>
              BECOME A INSTRUCTOR
            </h1>
            <span
              className={`fjalla-one-regular  text-[16px] font-[400] text-[#424242]`}
            >
              Sign Up & Join Learning +
            </span>
          </div>
          <div>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="!mt-6"
            >
              <div className="flex flex-col gap-[6px]">
                <div className="flex flex-col gap-4">
                  <Form.Item
                    name="first_name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                      {
                        min: 2,
                        message: "First name must be at least 2 characters",
                      },
                    ]}
                    className="!mb-0 z-10"
                  >
                    <CommonInput
                      label="First Name"
                      type="text"
                      className="!border-none !shadow-sm"
                      value={form.getFieldValue("fname") || ""}
                      onChange={(e) =>
                        form.setFieldsValue({ fname: e.target.value })
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="last_name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                      {
                        min: 2,
                        message: "Last name must be at least 2 characters",
                      },
                    ]}
                    className="!mb-0"
                  >
                    <CommonInput
                      label="Last Name"
                      type="text"
                      className="!border-none !shadow-sm"
                      value={form.getFieldValue("lname") || ""}
                      onChange={(e) =>
                        form.setFieldsValue({ lname: e.target.value })
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                    className="!mb-0"
                  >
                    <CommonInput
                      label="Email Address"
                      type="email"
                      className="!border-none !shadow-sm"
                      value={form.getFieldValue("email") || ""}
                      onChange={(e) =>
                        form.setFieldsValue({ email: e.target.value })
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="password_hash"
                    rules={[
                      { required: true, message: "Please enter your password" },
                      {
                        min: 8,
                        message: "Password must be at least 8 characters",
                      },
                      {
                        pattern:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                        message:
                          "Password must include uppercase, lowercase, number, and special character",
                      },
                    ]}
                    className="!mb-0"
                  >
                    <CommonInput
                      label="Password"
                      isPassword
                      className="!border-none !shadow-sm"
                      value={form.getFieldValue("password") || ""}
                      onChange={(e) =>
                        form.setFieldsValue({ password: e.target.value })
                      }
                    />
                  </Form.Item>
                </div>
              </div>

              <Form.Item className="!mb-0 ">
                <CommonButton
                  text={"Sign Up"}
                  className="w-full h-[56px] text-[16px] text-md my-5"
                  loading={loading}
                />
              </Form.Item>

              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center w-full">
                  <div className="border-b-1 border-[#E0E0E0] w-[50%]"></div>
                  <div className="w-[48px] text-center text-[14px] text-[500]">
                    Or
                  </div>
                  <div className="border-b-1 border-[#E0E0E0] w-[50%]"></div>
                </div>

                <div className="w-full grid grid-cols-3 gap-[9px]">
                  {authOptions.map(({ key, icon }) => {
                    return (
                      <Button
                        key={key}
                        type="text"
                        size="large"
                        onClick={() => {
                          if (key === "google") googleLogin();
                          if (key === "facebook") handleFacebookLogin();
                          // if (key === "apple") handleAppleLogin();
                        }}
                        className="!bg-[#FAFAFA] relative !border !border-[#EEEEEE] hover:shadow !h-[48px] !rounded-2 !flex !items-center !justify-center "
                      >
                        {icon}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeInstructor;
