import React, { useState } from "react";
import { Button, Form } from "antd";
import CommonInput from "../CommonInput";
import CommonButton from "../CommonButton";
import CommonLink from "../CommonLink";
import { AppleIcon, FacebookIcon, GoogleIcon } from "@/utils/icons";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSignup } from "@/redux/slices/AuthModalSlice";
import { createUserApi, socialAuth } from "@/services/collections";
import { setUser } from "@/redux/slices/UserDataSlice";
import { Role, RoutePaths } from "@/utils/enums";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import { useFacebookSdk } from "@/hooks/useFacebookSdk";

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

interface SignUpFormProps {
  onSignin?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignin }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();
  const isFacebookReady = useFacebookSdk();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
  }) => {
    // const values = form.getFieldsValue();
    try {
      setLoading(true);
      const response = await createUserApi({
        ...values,
        signup_type: "student",
      });
      console.log(response);
      if (response?.status) {
        dispatch(
          setUser({
            ...response?.data,
          })
        );
        router.push(RoutePaths?.Onboarding);
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
      role_name: Role?.STUDENT,
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
    <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-6">
      <div className="flex flex-col gap-[6px]">
        <div className="flex flex-col gap-4">
          <Form.Item
            name="first_name"
            rules={[
              { required: true, message: "Please enter your first name" },
              { min: 2, message: "First name must be at least 2 characters" },
            ]}
            className="!mb-0"
          >
            <CommonInput
              label="First Name"
              type="text"
              value={form.getFieldValue("fname") || ""}
              onChange={(e) => form.setFieldsValue({ fname: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            name="last_name"
            rules={[
              { required: true, message: "Please enter your last name" },
              { min: 2, message: "Last name must be at least 2 characters" },
            ]}
            className="!mb-0"
          >
            <CommonInput
              label="Last Name"
              type="text"
              value={form.getFieldValue("lname") || ""}
              onChange={(e) => form.setFieldsValue({ lname: e.target.value })}
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
              value={form.getFieldValue("email") || ""}
              onChange={(e) => form.setFieldsValue({ email: e.target.value })}
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
          <div className="w-[48px] text-center text-[14px] text-[500]">Or</div>
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

      <div className="text-center text-[14px] text-[#2D2D2D] mt-5">
        Already on Learning+?{" "}
        <CommonLink text={"Login"} className="underline" onClick={onSignin} />
      </div>

      <div className="text-center border-t-1 border-[#E0E0E0] pt-3 text-[14px] text-[#2D2D2D] mt-3">
        Sign Up as{" "}
        <CommonLink
          text={"Instructor"}
          className="underline"
          onClick={() => {
            router.push(RoutePaths?.BecomeInstructor);
            dispatch(setSignup(false));
          }}
        />
      </div>
    </Form>
  );
};

export default SignUpForm;
