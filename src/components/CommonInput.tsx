import { Input, InputRef } from "antd";
import React, { useRef, useState } from "react";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

interface CommonInputProps {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  isPassword?: boolean;
}

const CommonInput: React.FC<CommonInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  name,
  isPassword = false,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<InputRef>(null);

  const handleWrapperClick = () => {
    setFocused(true);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`relative flex flex-col justify-center items-start gap-[50px] rounded-[10px] border border-[#A9A9A9] p-[8px] w-full transition-all ${className}`}
      onClick={handleWrapperClick}
    >
      <div
        className={`absolute leading-[100%] text-[#9F9F9F] transition-all duration-200 z-50 ${
          focused ? "text-[10px] top-2 " : "text-[16px]"
        }`}
      >
        {label}
      </div>
      {isPassword ? (
        <Input.Password
          ref={inputRef}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e);
            setFocused(true);
          }}
          onBlur={() => {
            if (!value) setFocused(false);
          }}
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          className={`!border-none !shadow-none !text-[16px] !px-0 bg-transparent !mt-1`}
        />
      ) : (
        <Input
          type={type}
          ref={inputRef}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e);
            setFocused(true);
          }}
          onBlur={() => {
            if (!value) setFocused(false);
          }}
          className={`!border-none !shadow-none !text-[16px] !px-0 bg-transparent !mt-1`}
        />
      )}
    </div>
  );
};

export default CommonInput;
