import React, { useState } from "react";
import { Button, Form } from "antd";
import CommonInput from "../CommonInput";
import CommonButton from "../CommonButton";
import CommonLink from "../CommonLink";
import { AppleIcon, GoogleIcon } from "@/utils/icons";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setSignup, setSignupRole } from "@/redux/slices/AuthModalSlice";
import { createUserApi, socialAuth } from "@/services/collections";
import { setUser } from "@/redux/slices/UserDataSlice";
import { Role, RoutePaths } from "@/utils/enums";
import { toast } from "@/utils/toast";
import { useGoogleLogin } from "@react-oauth/google";
import { RootState } from "@/redux/store";
import { BookOutlined, UserOutlined } from "@ant-design/icons";

const authOptions = [
  {
    key: "google",
    label: "Google",
    icon: <GoogleIcon />,
  },
  {
    key: "apple",
    label: "Apple",
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
  const selectedRole = useSelector(
    (state: RootState) => state.authmodal.signupRole || "student"
  );
  const [role, setRole] = useState<"student" | "instructor">(selectedRole);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: "student" | "instructor") => {
    setRole(newRole);
    dispatch(setSignupRole(newRole));
  };

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
        signup_type: role,
      });

      if (response?.status) {
        dispatch(
          setUser({
            ...response?.data,
          })
        );
        dispatch(setSignup(false));

        if (role === "instructor") {
          toast.success("Account created! Let's set up your instructor profile.");
          router.push(`${RoutePaths?.BecomeInstructor}/onboarding`);
        } else {
          toast.success("Account created successfully!");
          router.push(RoutePaths?.Onboarding);
        }
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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const payload = {
          provider: "google",
          token: tokenResponse?.access_token,
          role_name: role === "instructor" ? Role?.INSTRUCTOR : Role?.STUDENT,
        };
        const response = await socialAuth(payload);
        if (response?.status) {
          dispatch(setUser({ ...response?.data }));
          dispatch(setSignup(false));
          if (role === "instructor") {
            router.push(`${RoutePaths?.BecomeInstructor}/onboarding`);
          } else {
            router.push(RoutePaths?.Onboarding);
          }
        }
      } catch (err) {
        console.error("Google auth error", err);
        toast.error("Google authentication failed");
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} className="mt-2">
      {/* Role Selection Tabs */}
      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Join As
        </label>
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleChange("student")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer outline-none focus:outline-none focus:ring-0 border ${
              role === "student"
                ? "bg-white text-[#4F46E5] shadow-xs border-[#4F46E5]/40"
                : "bg-transparent text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60"
            }`}
          >
            <UserOutlined className="text-sm" />
            <span>Student (Learner)</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("instructor")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer outline-none focus:outline-none focus:ring-0 border ${
              role === "instructor"
                ? "bg-white text-[#4F46E5] shadow-xs border-[#4F46E5]/40"
                : "bg-transparent text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60"
            }`}
          >
            <BookOutlined className="text-sm" />
            <span>Instructor (Teacher)</span>
          </button>
        </div>
      </div>

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
              value={form.getFieldValue("first_name") || ""}
              onChange={(e) => form.setFieldsValue({ first_name: e.target.value })}
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
              value={form.getFieldValue("last_name") || ""}
              onChange={(e) => form.setFieldsValue({ last_name: e.target.value })}
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
            value={form.getFieldValue("password_hash") || ""}
            onChange={(e) =>
              form.setFieldsValue({ password_hash: e.target.value })
            }
          />
        </Form.Item>
      </div>

      <Form.Item className="!mb-0 !mt-5">
        <CommonButton
          text={role === "instructor" ? "Sign Up as Instructor" : "Create Account"}
          className="w-full !h-12 !text-[15px] !font-bold !rounded-xl !bg-[#4F46E5] hover:!bg-[#4338CA] !text-white shadow-md hover:shadow-lg transition-all"
          loading={loading}
        />
      </Form.Item>

      <div className="flex flex-col items-center justify-center gap-4 my-5">
        <div className="flex items-center w-full">
          <div className="border-b border-slate-200 flex-1" />
          <span className="px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            or continue with
          </span>
          <div className="border-b border-slate-200 flex-1" />
        </div>

        <div className="w-full grid grid-cols-2 gap-3">
          {authOptions.map(({ key, icon }) => (
            <Button
              key={key}
              type="text"
              onClick={() => {
                if (key === "google") googleLogin();
              }}
              className="!bg-white !border !border-slate-300 hover:!border-slate-400 hover:!bg-slate-50 !h-11 !rounded-xl !flex !items-center !justify-center shadow-2xs transition-all"
            >
              {icon}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-slate-600 pb-1">
        Already have an account?{" "}
        <CommonLink
          text="Sign In"
          className="font-bold text-[#4F46E5] hover:text-[#4338CA] hover:underline"
          onClick={onSignin}
        />
      </div>
    </Form>
  );
};

export default SignUpForm;
