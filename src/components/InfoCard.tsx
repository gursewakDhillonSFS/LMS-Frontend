import { ReactNode } from "react";

export interface InfoCardProps {
  image: ReactNode;
  text: string;
  count: string;
  bg?: string;
}

const InfoCard = ({ image, text, count, bg = "#f0f0f0" }: InfoCardProps) => {
  return (
    <div className="flex flex-col gap-3 bg-white border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08),0_12px_24px_-4px_rgba(49,92,255,0.08)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] transition-all duration-150">
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
