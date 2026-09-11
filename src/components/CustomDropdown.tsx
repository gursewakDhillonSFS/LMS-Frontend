"use client";

import React, { useState, useRef, useEffect } from "react";
import { DownOutlined, CheckOutlined } from "@ant-design/icons";

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefixIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  prefixIcon,
  disabled = false,
  className = "",
  dropdownClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left select-none ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`h-9 px-3 rounded-xl border bg-white text-xs sm:text-sm font-medium flex items-center justify-between gap-2.5 transition-all shadow-xs cursor-pointer ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-slate-50 border-[#E4E7EC] text-[#98A2B3]"
            : isOpen
            ? "border-[#315CFF] ring-2 ring-[#315CFF]/15 text-[#101828]"
            : "border-[#E4E7EC] text-[#475467] hover:border-[#D0D5DD] hover:text-[#101828]"
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {prefixIcon && <span className="text-xs text-[#98A2B3]">{prefixIcon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <DownOutlined
          className={`text-[10px] text-[#98A2B3] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#315CFF]" : ""
          }`}
        />
      </button>

      {/* Popup Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 min-w-[160px] max-h-60 overflow-y-auto rounded-xl bg-white border border-[#E4E7EC] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)] py-1.5 z-50 animate-fadeIn ${dropdownClassName}`}
        >
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-[#98A2B3] text-center">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 text-[#315CFF] font-semibold"
                      : "text-[#344054] hover:bg-[#F8FAFC] hover:text-[#101828]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span>{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>

                  {isSelected && (
                    <CheckOutlined className="text-xs text-[#315CFF] shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
