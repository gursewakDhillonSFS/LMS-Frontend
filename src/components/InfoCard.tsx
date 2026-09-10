import { ReactNode } from "react";

export interface InfoCardProps {
  image: ReactNode;
  text: string;
  count: string;
  bg?: string;
}

const InfoCard = ({ image, text, count, bg = "#f0f0f0" }: InfoCardProps) => {
  return (
    <div className="flex flex-col gap-3 bg-white border border-[var(--border)] rounded-[10px] p-5 shadow-xs hover:border-[var(--border-strong)] transition-all duration-150">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{text}</span>
        <div
          className="w-10 h-10 flex justify-center items-center rounded-lg"
          style={{ backgroundColor: bg }}
        >
          {image}
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">{count}</h3>
    </div>
  );
};

export default InfoCard;
