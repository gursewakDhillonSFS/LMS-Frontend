import Image, { StaticImageData } from "next/image";
import React from "react";
import CommonButton from "./CommonButton";

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
  title = "No Data Found",
  subTitle = "There is nothing to display at the moment.",
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 text-center"
      style={{ height }}
    >
      {icon && (
        <div className="relative w-[200px] h-[200px] ">
          <Image src={icon} fill unoptimized alt=" " />
        </div>
      )}
      <div className="flex flex-col">
        <div className="font-semibold text-xl font-plus-jakarta">{title}</div>
        <div className="text-sm font-plus-jakarta">{subTitle}</div>
      </div>
      {text && handleClick && (
        <CommonButton
          text={text}
          onClick={handleClick}
          className="!bg-secondary !text-white"
        />
      )}
    </div>
  );
};

export default NoDataFound;
