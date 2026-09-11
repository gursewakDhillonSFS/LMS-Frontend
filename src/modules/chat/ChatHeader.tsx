"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  BellOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";

import { ChatRoom } from "./types";
import { getInitials, getAvatarGradient } from "./chatUtils";

interface ChatHeaderProps {
  room: ChatRoom;
  onBack?: () => void;
  onToggleSearch?: () => void;
  isSearching?: boolean;
  onToggleDrawer?: () => void;
  isDrawerOpen?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  onBack,
  onToggleSearch,
  isSearching = false,
  onToggleDrawer,
  isDrawerOpen = false,
  isMuted = false,
  onToggleMute,
}) => {
  const displayName = room.names || room.name || "Class Discussion";
  const isGroup = room.type === "course" || (room.memberCount && room.memberCount > 2);

  return (
    <header className="h-16 px-4 border-b border-[#E4E7EC] bg-white flex items-center justify-between shrink-0 z-20">
      {/* Left: Back Button + Room Details */}
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden p-2 -ml-1 text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors cursor-pointer"
            aria-label="Back to messages"
          >
            <ArrowLeftOutlined className="text-base" />
          </button>
        )}

        {/* Room Avatar */}
        <div className="relative shrink-0">
          {room.avatar ? (
            <Image
              src={room.avatar}
              alt={displayName}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                displayName
              )} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
            >
              {getInitials(displayName)}
            </div>
          )}

          {room.isOnline && !isGroup && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        {/* Title & Metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#101828] truncate">
              {displayName}
            </h2>
            {isGroup && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F2F4F7] text-[#475467]">
                <TeamOutlined className="text-[10px]" />
                <span>{room.memberCount || 3} members</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#667085] truncate">
            {room.courseTitle ? (
              <span>{room.courseTitle}</span>
            ) : isGroup ? (
              <span>Active Batch Discussion</span>
            ) : room.isOnline ? (
              <span className="text-emerald-600 font-medium">Online now</span>
            ) : (
              <span>Offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {onToggleSearch && (
          <Tooltip title={isSearching ? "Close Search" : "Search in conversation"}>
            <button
              type="button"
              onClick={onToggleSearch}
              className={`p-2 rounded-xl text-sm transition-colors cursor-pointer ${
                isSearching
                  ? "bg-[#315CFF] text-white"
                  : "text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7]"
              }`}
            >
              <SearchOutlined />
            </button>
          </Tooltip>
        )}

        {onToggleMute && (
          <Tooltip title={isMuted ? "Unmute Notifications" : "Mute Notifications"}>
            <button
              type="button"
              onClick={onToggleMute}
              className={`p-2 rounded-xl text-sm transition-colors cursor-pointer ${
                isMuted
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7]"
              }`}
            >
              <BellOutlined />
            </button>
          </Tooltip>
        )}

        {onToggleDrawer && (
          <Tooltip title={isDrawerOpen ? "Close Details" : "Room Information"}>
            <button
              type="button"
              onClick={onToggleDrawer}
              className={`p-2 rounded-xl text-sm transition-colors cursor-pointer ${
                isDrawerOpen
                  ? "bg-[#101828] text-white"
                  : "text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7]"
              }`}
            >
              <InfoCircleOutlined />
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
