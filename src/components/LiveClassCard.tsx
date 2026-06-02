import { DownloadIcon } from "@/utils/icons";
import { Tooltip } from "antd";
import Image from "next/image";
import { FC } from "react";
import CommonButton from "./CommonButton";
import { RecordedClass } from "@/utils/interface";

export interface LiveClassCardProp {
  data: RecordedClass;
  className?: string;
  onClick?: () => void;
  isLive?: boolean;
}

const LiveClassCard: FC<LiveClassCardProp> = ({
  data,
  className = "",
  onClick,
  isLive = true,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        boxShadow: "0px 4px 35px rgba(0, 0, 0, 0.08)",
      }}
      className={`cursor-pointer flex flex-col rounded-[15px] p-[16px] gap-[12px] w-full text-white ${className}`}
    >
      <div className="flex flex-col gap-[12px]">
        <div className="w-full h-[180px] relative">
          <Image
            src={data?.thumbnail || ""}
            alt={"course"}
            unoptimized
            fill
            className="rounded-[12px] object-cover"
          />
          {isLive && (
            <div className="absolute top-2 right-2 flex gap-1 items-center justify-between bg-[#FB4A49] rounded-[4px] p-[6px]">
              <div className="w-[7px] h-[7px] bg-white rounded-full"></div>
              <div className="text-[10px] font-[500]">Live</div>
            </div>
          )}
          <div className="absolute text-[10px] font-[500] bottom-2 right-2 bg-black text-white rounded-[4px] p-[4px]">
            01:25:32
          </div>
        </div>
        <div className="flex flex-col gap-[6px]">
          <div
            className={`font-[600] text-[18px] leading-[120%] text-[#0E0E0E] plus-jakarta-sans truncate`}
          >
            <Tooltip placement="bottom" title={data?.topic}>
              {data?.topic}
            </Tooltip>
          </div>
          <div
            className={`font-[500] text-[14px] leading-[120%] text-[#9A9A9A] truncate`}
          >
            {data?.streamedDate}
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-between">
        <CommonButton
          text={"Watch"}
          className="!w-[85%] !bg-transparent border border-secondary !text-secondary"
        />
        <DownloadIcon />
      </div>
    </div>
  );
};

export default LiveClassCard;
