"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  CloseCircleFilled,
  MessageOutlined,
} from "@ant-design/icons";

import { ChatRoom, ChatFilterCategory } from "./types";
import { getInitials, getAvatarGradient, formatConversationTime } from "./chatUtils";

interface ConversationSidebarProps {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (room: ChatRoom) => void;
  className?: string;
}

const CATEGORY_TABS: { key: ChatFilterCategory; label: string; icon?: React.ReactNode }[] = [
  { key: "all", label: "All" },
  { key: "courses", label: "Courses", icon: <BookOutlined className="text-xs" /> },
  { key: "direct", label: "Direct", icon: <UserOutlined className="text-xs" /> },
  { key: "unread", label: "Unread" },
];

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ChatFilterCategory>("all");

  const totalUnreadCount = useMemo(() => {
    return rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Category filter
      if (activeCategory === "courses" && room.type !== "course") return false;
      if (activeCategory === "direct" && room.type !== "direct") return false;
      if (activeCategory === "unread" && (!room.unreadCount || room.unreadCount <= 0)) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = (room.names || room.name || "").toLowerCase().includes(q);
      const courseMatch = (room.courseTitle || "").toLowerCase().includes(q);
      const lastMsgMatch = (room.lastMessage?.message || "").toLowerCase().includes(q);
      return nameMatch || courseMatch || lastMsgMatch;
    });
  }, [rooms, activeCategory, searchQuery]);

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-[#E4E7EC] overflow-hidden ${className}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#F2F4F7]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#101828]">Messages</h2>
            {totalUnreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#315CFF] text-white">
                {totalUnreadCount}
              </span>
            )}
          </div>
          <span className="text-xs text-[#667085] font-medium">
            {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3] text-sm pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats, batches, or keywords..."
            className="w-full pl-9 pr-8 py-2 bg-[#F8FAFC] hover:bg-[#F2F4F7] focus:bg-white text-xs sm:text-sm text-[#101828] placeholder-[#98A2B3] rounded-xl border border-[#E4E7EC] focus:border-[#315CFF] focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#475467] text-xs cursor-pointer"
            >
              <CloseCircleFilled />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#101828] text-white shadow-xs"
                    : "bg-[#F8FAFC] hover:bg-[#F2F4F7] text-[#667085] hover:text-[#101828]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F2F4F7] p-2 space-y-1">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center text-[#98A2B3] text-lg mb-2">
              <MessageOutlined />
            </div>
            <p className="text-sm font-semibold text-[#101828]">No conversations found</p>
            <p className="text-xs text-[#667085] mt-0.5 max-w-[200px]">
              {searchQuery
                ? "Try searching with a different name or keyword"
                : "No messages in this category yet."}
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isSelected = room._id === selectedRoomId;
            const displayName = room.names || room.name || "Study Room";
            const isGroup = room.type === "course" || (room.memberCount && room.memberCount > 2);
            const timeFormatted = formatConversationTime(room.lastMessage?.createdAt);

            return (
              <div
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 relative ${
                  isSelected
                    ? "bg-[#F0F4FF] border border-[#315CFF]/30 shadow-xs"
                    : "hover:bg-[#F8FAFC] border border-transparent"
                }`}
              >
                {/* Avatar with Status Indicator */}
                <div className="relative shrink-0 mt-0.5">
                  {room.avatar ? (
                    <Image
                      src={room.avatar}
                      alt={displayName}
                      width={44}
                      height={44}
                      unoptimized
                      className="w-11 h-11 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                        displayName
                      )} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                    >
                      {getInitials(displayName)}
                    </div>
                  )}

                  {/* Icon Indicator for Group vs Direct */}
                  {isGroup ? (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[9px] text-white">
                      <TeamOutlined />
                    </span>
                  ) : room.isOnline ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  ) : null}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isSelected ? "text-[#315CFF]" : "text-[#101828]"
                      }`}
                    >
                      {displayName}
                    </h3>
                    {timeFormatted && (
                      <span className="text-[11px] font-medium text-[#98A2B3] shrink-0">
                        {timeFormatted}
                      </span>
                    )}
                  </div>

                  {/* Course Subtitle or Category Badge */}
                  {room.courseTitle && (
                    <p className="text-[11px] text-[#315CFF] font-medium truncate mb-1">
                      {room.courseTitle}
                    </p>
                  )}

                  {/* Last Message Snippet */}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate ${
                        room.unreadCount && room.unreadCount > 0
                          ? "font-semibold text-[#101828]"
                          : "text-[#667085]"
                      }`}
                    >
                      {room.lastMessage?.senderName && (
                        <span className="font-medium text-[#344054]">
                          {room.lastMessage.senderName.split(" ")[0]}:{" "}
                        </span>
                      )}
                      {room.lastMessage?.message || "No messages yet"}
                    </p>

                    {/* Unread Pill */}
                    {room.unreadCount && room.unreadCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#315CFF] text-white shrink-0">
                        {room.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ConversationSidebar;
