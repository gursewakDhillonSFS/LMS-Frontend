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
import { toast } from "react-toastify";
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
          errors: ["Please enter a valid OTP."],
        },
      ]);
      return;
    }
    const finalOtp = otp.join("");
    console.log("OTP:", finalOtp);
    try {
      setLoading(true);
      const response = await verifyOtpApi({
        otp: finalOtp,
      });
      if (response?.status) {
        dispatch(setToken(response?.data?.token));
        dispatch(setuserId(response?.data?.user_id));
        dispatch(setOtpVerify(false));
        dispatch(setChangePass(true));
      } else {
        toast.warning(response?.message ?? "Something Went Wrong");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
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
        if (response?.status) {
          toast.success(response?.message ?? "Something Went Wrong");
          setTimer(60);
          setResendDisabled(true);
        } else {
          toast.warning(response?.message ?? "Something Went Wrong");
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
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
      <CommonLink
        text={email ?? "debbie.baker@example.com"}
        className="text-center w-full text-[16px] underline"
      />
      <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-6">
        <div className="flex flex-col gap-[6px]">
          <div className="flex flex-col gap-4">
            <Form.Item
              name="otp"
              className="!mb-0"
              rules={[
                {
                  validator: () =>
                    otp.some((digit) => digit === "")
                      ? Promise.reject("Please enter the complete OTP.")
                      : Promise.resolve(),
                },
              ]}
            >
              <Row gutter={10} justify="center">
                {otp.map((digit, index) => (
                  <Col key={index} span={4} className="flex gap-2">
                    <Input
                      maxLength={1}
                      inputMode="numeric"
                      pattern="\d*"
                      value={digit}
                      className="w-[50px] h-[50px] text-center rounded-md text-lg font-semibold border border-[#ccc]"
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Item>
          </div>

          <div className="flex justify-between text-sm mt-2 font-medium">
            <span className="text-[#F53131] text-[] font-medium">
              {formatTime(timer)}
            </span>
            <button
              type="button"
              onClick={onResendFinish}
              disabled={resendDisabled}
              className={`font-semibold text-secondary ${
                resendDisabled ? "opacity-40" : "hover:underline cursor-pointer"
              }`}
            >
              Resend
            </button>
          </div>
        </div>

        <Form.Item className="!mb-0 ">
          <CommonButton
            text={"Reset Password"}
            loading={loading}
            className="w-full h-[56px] text-[16px] text-md my-5"
          />
        </Form.Item>
      </Form>

      <div className="text-center border-t-1 border-[#E0E0E0] pt-3 text-[14px] text-[#2D2D2D] mt-3">
        Back to{" "}
        <CommonLink text={"Login"} className="underline" onClick={onSignin} />
      </div>
    </div>
  );
};

export default OtpVerification;
