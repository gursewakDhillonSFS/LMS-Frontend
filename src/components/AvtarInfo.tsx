import { getImageUrl, getRandomBgColor, isValidUrl } from "@/utils/comman";
import { Avatar } from "antd";
import React from "react";

interface AvtarInfoProps {
  imageUrl?: string | null;
  name: string | undefined;
  organization: string;
  size?: number;
}

const AvtarInfo: React.FC<AvtarInfoProps> = ({
  imageUrl,
  name,
  organization,
  size = 48,
}) => {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const bgColor = getRandomBgColor();

  const avatarUrl = getImageUrl(imageUrl || undefined);

  const showImage = imageUrl && isValidUrl(avatarUrl);

  return (
    <div className="flex items-center gap-2">
      {showImage ? (
        <Avatar size={size} src={avatarUrl} />
      ) : (
        <Avatar
          size={size}
          style={{
            backgroundColor: bgColor,
            verticalAlign: "middle",
            fontWeight: 600,
          }}
        >
          {initial}
        </Avatar>
      )}
      <div className="flex flex-col justify-center gap-[2px]">
        <div className="text-[18px] font-[500] text-[#0E0E0E] leading-[120%]">
          {name}
        </div>
        <div className="text-[#5C5C5C] text-[16px] leading-[150%]">
          {organization}
        </div>
      </div>
    </div>
  );
};

export default AvtarInfo;
