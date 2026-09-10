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
  placeholder?: string;
}

const CommonInput: React.FC<CommonInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  name,
  isPassword = false,
  placeholder,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<InputRef>(null);

  const handleWrapperClick = () => {
    setFocused(true);
    inputRef.current?.focus();
  };

  const defaultPlaceholder = placeholder || `Enter ${label.toLowerCase()}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 select-none block leading-tight">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center rounded-xl border bg-white px-3.5 py-2.5 w-full transition-all duration-200 cursor-text ${
          focused
            ? "border-[#4F46E5] ring-3 ring-[#4F46E5]/15 shadow-sm"
            : "border-slate-300 hover:border-slate-400 shadow-2xs"
        }`}
        onClick={handleWrapperClick}
      >
        {isPassword ? (
          <Input.Password
            ref={inputRef}
            name={name}
            value={value}
            placeholder={defaultPlaceholder}
            onChange={(e) => {
              onChange(e);
              setFocused(true);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            iconRender={(visible) =>
              visible ? (
                <EyeTwoTone
                  twoToneColor="#4F46E5"
                  className="text-base text-[#4F46E5] cursor-pointer p-0.5 transition-colors"
                />
              ) : (
                <EyeInvisibleOutlined className="text-base text-slate-700 hover:text-slate-900 cursor-pointer p-0.5 transition-colors" />
              )
            }
            className="!border-none !shadow-none !text-sm !p-0 bg-transparent !text-slate-900 font-medium w-full placeholder:text-slate-400"
          />
        ) : (
          <Input
            type={type}
            ref={inputRef}
            name={name}
            value={value}
            placeholder={defaultPlaceholder}
            onChange={(e) => {
              onChange(e);
              setFocused(true);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="!border-none !shadow-none !text-sm !p-0 bg-transparent !text-slate-900 font-medium w-full placeholder:text-slate-400"
          />
        )}
      </div>
    </div>
  );
};

export default CommonInput;
