import React, { useState } from "react";
import { Button, Form } from "antd";
import CommonInput from "../CommonInput";
import CommonButton from "../CommonButton";
import CommonLink from "../CommonLink";
import { AppleIcon, FacebookIcon, GoogleIcon } from "@/utils/icons";
import { usePathname, useRouter } from "next/navigation";
import { Role, RoutePaths } from "@/utils/enums";
import { cartList, loginApi, socialAuth } from "@/services/collections";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/UserDataSlice";
import { toast } from "@/utils/toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useFacebookSdk } from "@/hooks/useFacebookSdk";
import { setCartCount } from "@/redux/slices/CourseDataSlice";

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

interface SignInFormProps {
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  onForgotPassword,
  onSignUp,
}) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isFacebookReady = useFacebookSdk();
  const [loading, setLoading] = useState(false);

  const onFinish = async (value: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await loginApi({
        ...value,
      });
      if (response?.status) {
        dispatch(
          setUser({
            ...response?.data,
          })
        );
        if (response?.data?.role_name === Role?.STUDENT) {
          const res = await cartList();
          if (res.status) {
            if (res?.data?.course_items)
              dispatch(setCartCount(res?.data?.course_items?.length));
          }
          router.push(RoutePaths?.Dashboard);
        } else if (response?.data.role_name === Role?.INSTRUCTOR) {
          router.push(RoutePaths?.InstructorPanel);
        } else if (response?.data.role_name === Role?.TEACHER) {
          router.push(RoutePaths?.TeacherDashboard);
        }
      } else {
        toast.warning(response?.message ?? "Invalid email or password");
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to login:", err);
      toast.error("An error occurred during login");
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
      <div className="flex flex-col gap-4">
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
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            {
              min: 8,
              message: "Password must be at least 8 characters",
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

        <div className="flex items-center justify-end -mt-1">
          <CommonLink
            text="Forgot Password?"
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)]"
            onClick={onForgotPassword}
          />
        </div>
      </div>

      <Form.Item className="!mb-0 !mt-5">
        <CommonButton
          text="Sign In"
          loading={loading}
          className="w-full !h-[44px] !text-[15px] font-medium !rounded-[8px]"
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

      {!pathname.includes(RoutePaths?.BecomeInstructor) && (
        <p className="text-center text-sm text-[var(--text-secondary)]">
          New to Learning+?{" "}
          <CommonLink text="Sign Up" className="font-semibold text-[var(--primary)] hover:underline" onClick={onSignUp} />
        </p>
      )}
    </Form>
  );
};

export default SignInForm;
