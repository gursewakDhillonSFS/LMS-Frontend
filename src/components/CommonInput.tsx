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

  const isActive = focused || Boolean(value);

  return (
    <div
      className={`relative flex flex-col justify-center items-start rounded-xl border bg-slate-50/60 hover:bg-white px-3.5 pt-4 pb-2 w-full transition-all duration-200 cursor-text ${
        focused
          ? "border-[#4F46E5] bg-white ring-3 ring-[#4F46E5]/15 shadow-sm"
          : "border-slate-300 hover:border-slate-400 shadow-2xs"
      } ${className}`}
      onClick={handleWrapperClick}
    >
      <label
        className={`absolute transition-all duration-150 pointer-events-none select-none font-medium ${
          isActive
            ? "text-[11px] top-1.5 font-semibold text-[#4F46E5]"
            : "text-sm top-3 text-slate-500"
        }`}
      >
        {label}
      </label>
      {isPassword ? (
        <Input.Password
          ref={inputRef}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (!value) setFocused(false);
          }}
          iconRender={(visible) =>
            visible ? (
              <EyeTwoTone
                twoToneColor="#4F46E5"
                className="text-base text-[#4F46E5] cursor-pointer p-0.5 transition-colors"
              />
            ) : (
              <EyeInvisibleOutlined className="text-base text-slate-600 hover:text-slate-900 cursor-pointer p-0.5 transition-colors" />
            )
          }
          className="!border-none !shadow-none !text-sm !p-0 bg-transparent !mt-1.5 !text-slate-900 font-medium w-full"
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
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (!value) setFocused(false);
          }}
          className="!border-none !shadow-none !text-sm !p-0 bg-transparent !mt-1.5 !text-slate-900 font-medium w-full"
        />
      )}
    </div>
  );
};

export default CommonInput;
