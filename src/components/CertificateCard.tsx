import { DownloadIcon } from "@/utils/icons";
import { Certificate } from "@/utils/images";
import Image from "next/image";
import React from "react";

interface CertificateCardProps {
  title?: string;
  code?: string;
}

const CertificateCard = ({
  title = "Certificate Name",
  code,
}: CertificateCardProps) => {
  return (
    <div className="bg-white rounded-[12px] p-2 flex flex-col gap-2">
      <div className="w-full h-[180px] relative">
        <Image
          src={Certificate}
          alt={"certificate image"}
          unoptimized
          fill
          className="rounded-[12px] object-cover"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="plus-jakarta-sans font-bold text-sm">{title}</h1>
          {code && (
            <p className="text-xs text-slate-500 font-mono">{code}</p>
          )}
        </div>
        <div className="cursor-pointer">
          <DownloadIcon />
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
