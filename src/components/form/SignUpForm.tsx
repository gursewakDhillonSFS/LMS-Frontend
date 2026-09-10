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
import { toast } from "@/utils/toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useFacebookSdk } from "@/hooks/useFacebookSdk";

const authOptions = [
  {
    key: "google",
    label: "Continue with Google",
    icon: <GoogleIcon />,
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
    try {
      setLoading(true);
      const response = await createUserApi({
        ...values,
        signup_type: "student",
      });
      if (response?.status) {
        dispatch(
          setUser({
            ...response?.data,
          })
        );
        router.push(RoutePaths?.Onboarding);
      } else {
        toast.warning(response?.message ?? "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Failed to sign up:", err);
      toast.error("Registration error. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB || !isFacebookReady) return;

    window.FB.login(
      (response: Facebook.LoginStatusResponse) => {
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
    <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-4">
      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="first_name"
            rules={[
              { required: true, message: "Please enter first name" },
              { min: 2, message: "At least 2 characters" },
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
              { required: true, message: "Please enter last name" },
              { min: 2, message: "At least 2 characters" },
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
        </div>
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
                "Include upper, lower, number, and special character",
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

      <Form.Item className="!mb-0 !mt-5">
        <CommonButton
          text="Create Account"
          className="w-full !h-[44px] !text-[15px] font-medium !rounded-[8px]"
          loading={loading}
        />
      </Form.Item>

      <div className="flex flex-col items-center justify-center gap-4 my-5">
        <div className="flex items-center w-full">
          <div className="border-b border-[var(--border)] flex-1"></div>
          <span className="px-3 text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">or</span>
          <div className="border-b border-[var(--border)] flex-1"></div>
        </div>

        <div className="w-full grid grid-cols-2 gap-3">
          {authOptions.map(({ key, icon }) => (
            <Button
              key={key}
              type="text"
              onClick={() => {
                if (key === "google") googleLogin();
              }}
              className="!bg-white !border !border-[var(--border)] hover:!bg-[var(--surface-subtle)] !h-[42px] !rounded-[8px] !flex !items-center !justify-center shadow-2xs transition-colors"
            >
              {icon}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <CommonLink text="Sign In" className="font-semibold text-[var(--primary)] hover:underline" onClick={onSignin} />
      </div>

      <div className="text-center border-t border-[var(--border)] pt-3 text-sm text-[var(--text-secondary)] mt-3">
        Want to teach?{" "}
        <CommonLink
          text="Become an Instructor"
          className="font-medium text-[var(--primary)] hover:underline"
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
