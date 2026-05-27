import { ReactNode } from "react";

export interface InfoCardProps {
  image: ReactNode;
  text: string;
  count: string;
  bg?: string;
}

const InfoCard = ({ image, text, count, bg = "#f0f0f0" }: InfoCardProps) => {
  return (
    <div className="flex flex-col !border-none gap-[12px] bg-white rounded-[12px] p-5">
      <div
        className="w-[48px] h-[48px] flex justify-center items-center rounded-full"
        style={{ backgroundColor: bg }}
      >
        {image}
      </div>
      <p className="text-[16px] text-[#9A9A9A] leading-[150%]">{text}</p>
      <h3 className="text-[32px] plus-jakarta-sans font-bold">{count}</h3>
    </div>
  );
};

export default InfoCard;
