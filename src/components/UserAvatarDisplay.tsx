import React, { useState } from "react";
import Image from "next/image";
import { UserAvatarDisplayProps } from "@/utils/interface";
import { getImageUrl, getRandomBgColor, isValidUrl } from "@/utils/comman";


const UserAvatarDisplay: React.FC<UserAvatarDisplayProps> = ({
  user,
  textClass,
  showNameNextToAvatar = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const initial = user.name?.charAt(0)?.toUpperCase() || "?";
  const randomColor = getRandomBgColor();

  const avatarUrl = getImageUrl(user?.image);

  const showFallback = !user?.image || imgError || !isValidUrl(avatarUrl);

  return (
    <div className="flex items-center gap-[4px]">
      {showFallback ? (
        <div
          className="min-w-8 min-h-8 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: randomColor }}
        >
          {initial}
        </div>
      ) : (
        <Image
          src={avatarUrl}
          alt="user"
          width={32}
          height={32}
          unoptimized
          className="w-8 h-8 rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      {showNameNextToAvatar && (
        <p className={`capitalize ${textClass}`}>{user?.name}</p>
      )}
    </div>
  );
};

export default UserAvatarDisplay;
