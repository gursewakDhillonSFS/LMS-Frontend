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

  const isActive = focused || !!value;

  return (
    <div
      className={`relative flex flex-col justify-center items-start rounded-[8px] border bg-white p-[10px] pt-[14px] w-full transition-all duration-[150ms] ${
        focused
          ? "border-[var(--primary)] shadow-[0_0_0_3px_rgba(49,92,255,0.12),0_1px_2px_rgba(16,24,40,0.04)]"
          : "border-[var(--border)] shadow-[0_1px_2px_rgba(16,24,40,0.03),inset_0_1px_1px_rgba(16,24,40,0.02)] hover:border-[var(--border-strong)]"
      } ${className}`}
      onClick={handleWrapperClick}
    >
      <div
        className={`absolute leading-[100%] transition-all duration-[150ms] z-[5] pointer-events-none ${
          isActive
            ? "text-[11px] top-[6px] text-[var(--text-muted)]"
            : "text-[14px] text-[var(--text-muted)]"
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
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (!value) setFocused(false);
          }}
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          className="!border-none !shadow-none !text-[14px] !px-0 bg-transparent !mt-1 !text-[var(--text-primary)]"
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
          className="!border-none !shadow-none !text-[14px] !px-0 bg-transparent !mt-1 !text-[var(--text-primary)]"
        />
      )}
    </div>
  );
};

export default CommonInput;
