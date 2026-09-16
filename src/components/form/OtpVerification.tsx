"use client";
import React, { useRef, useState, useEffect } from "react";
import { Col, Form, Input, InputRef, Row } from "antd";
import CommonButton from "../CommonButton";
import CommonLink from "../CommonLink";
import { useDispatch, useSelector } from "react-redux";
import {
  setChangePass,
  setOtpVerify,
  setToken,
  setuserId,
} from "@/redux/slices/AuthModalSlice";
import { forgetPasswordApi, verifyOtpApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import { RootState } from "@/redux/store";

interface OtpVerificationProps {
  onSignin?: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ onSignin }) => {
  const [form] = Form.useForm();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<InputRef[]>([]);
  const [timer, setTimer] = useState<number>(60);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const email = useSelector((state: RootState) => state.authmodal.email);
  const userId = useSelector((state: RootState) => state.authmodal.user_id);
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(1, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const onFinish = async () => {
    if (otp.some((digit) => digit === "")) {
      form.setFields([
        {
          name: "otp",
          errors: ["Please enter the complete 6-digit code."],
        },
      ]);
      return;
    }
    const finalOtp = otp.join("");
    try {
      setLoading(true);
      const response = await verifyOtpApi({
        otp: finalOtp,
        email: email || undefined,
        user_id: userId || undefined,
      });
      if (response?.status || response?.success) {
        const token = response?.data?.token || response?.token;
        const resolvedUserId = response?.data?.user_id || response?.userId || userId;
        if (token) dispatch(setToken(token));
        if (resolvedUserId) dispatch(setuserId(resolvedUserId));
        dispatch(setOtpVerify(false));
        dispatch(setChangePass(true));
        toast.success(response?.message ?? "Code verified successfully");
      } else {
        toast.warning(response?.message ?? "Invalid verification code");
      }
    } catch (err) {
      console.error("Failed to verify OTP:", err);
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onResendFinish = async () => {
    if (resendDisabled) return;
    try {
      setLoading(true);
      if (email) {
        const response = await forgetPasswordApi({
          email,
        });
        if (response?.status || response?.success) {
          toast.success(response?.message ?? "A new verification code has been sent");
          setTimer(60);
          setResendDisabled(true);
        } else {
          toast.warning(response?.message ?? "Could not resend code");
        }
      }
    } catch (err) {
      console.error("Failed to resend code:", err);
      toast.error("Resend failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!resendDisabled) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendDisabled]);

  return (
    <div>
      <div className="text-center mb-4">
        <span className="text-sm text-[var(--text-secondary)]">Sent to </span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {email ?? "your email"}
        </span>
      </div>
      <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-2">
        <div className="flex flex-col gap-4">
          <Form.Item
            name="otp"
            className="!mb-0"
            rules={[
              {
                validator: () =>
                  otp.some((digit) => digit === "")
                    ? Promise.reject("Please enter all 6 digits.")
                    : Promise.resolve(),
              },
            ]}
          >
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  maxLength={1}
                  inputMode="numeric"
                  pattern="\d*"
                  value={digit}
                  className="!w-11 !h-12 text-center !rounded-[8px] text-lg font-bold !border !border-[var(--border)] focus:!border-[var(--primary)]"
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                />
              ))}
            </div>
          </Form.Item>

          <div className="flex justify-between items-center text-xs font-medium px-1">
            <span className="text-[var(--error)]">
              Expires in {formatTime(timer)}
            </span>
            <button
              type="button"
              onClick={onResendFinish}
              disabled={resendDisabled}
              className={`font-medium ${
                resendDisabled
                  ? "text-[var(--text-muted)] cursor-not-allowed"
                  : "text-[var(--primary)] hover:underline cursor-pointer"
              }`}
            >
              Resend Code
            </button>
          </div>
        </div>

        <Form.Item className="!mb-0 !mt-5">
          <CommonButton
            text="Verify Code"
            loading={loading}
            className="w-full !h-[44px] !text-[15px] font-medium !rounded-[8px]"
          />
        </Form.Item>
      </Form>

      <div className="text-center border-t border-[var(--border)] pt-4 text-sm text-[var(--text-secondary)] mt-5">
        Back to{" "}
        <CommonLink text="Login" className="font-semibold text-[var(--primary)] hover:underline" onClick={onSignin} />
      </div>
    </div>
  );
};

export default OtpVerification;
