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
import { toast } from "react-toastify";
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
        toast.warning(response?.message ?? "Something Went Wrong");
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
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
      <div className="flex flex-col gap-[5px]">
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

        <div className="flex items-center justify-end">
          <CommonLink
            text="Forgot Password?"
            className="w-fit"
            onClick={onForgotPassword}
          />
        </div>
      </div>

      <Form.Item className="!mb-0 ">
        <CommonButton
          text={"Login"}
          loading={loading}
          className="w-full h-[56px] text-[16px] text-md my-5"
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
                  // Facebook OAuth disabled until backend support is implemented
                }}
                className="!bg-[#FAFAFA] relative !border !border-[#EEEEEE] hover:shadow !h-[48px] !rounded-2 !flex !items-center !justify-center "
              >
                {icon}
              </Button>
            );
          })}
        </div>
      </div>

      {!pathname.includes(RoutePaths?.BecomeInstructor) && (
        <p className="text-center text-[14px] text-[#2D2D2D] mt-5">
          New to Learning+? <CommonLink text={"Sign Up"} onClick={onSignUp} />
        </p>
      )}
    </Form>
  );
};

export default SignInForm;
