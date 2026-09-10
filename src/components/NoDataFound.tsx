import Image, { StaticImageData } from "next/image";
import React from "react";
import CommonButton from "./CommonButton";
import { InboxOutlined } from "@ant-design/icons";

interface NoDataFoundProps {
  height?: string | number;
  icon?: StaticImageData;
  title?: string;
  text?: string;
  handleClick?: () => void;
  subTitle?: string;
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
  height = "300px",
  icon,
  text,
  handleClick,
  title = "No data found",
  subTitle = "There is nothing to display at the moment.",
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 text-center px-6"
      style={{ height }}
    >
      {icon ? (
        <div className="relative w-[80px] h-[80px] opacity-40">
          <Image src={icon} fill unoptimized alt=" " />
        </div>
      ) : (
        <div className="w-[56px] h-[56px] rounded-[12px] bg-[var(--surface-subtle)] flex items-center justify-center">
          <InboxOutlined className="text-[24px] text-[var(--text-muted)]" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="font-[600] text-[16px] text-[var(--text-primary)]">{title}</div>
        <div className="text-[14px] text-[var(--text-secondary)] max-w-[320px]">{subTitle}</div>
      </div>
      {text && handleClick && (
        <CommonButton
          text={text}
          onClick={handleClick}
          className="!mt-2"
        />
      )}
    </div>
  );
};

export default NoDataFound;
