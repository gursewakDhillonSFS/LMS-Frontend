"use client";

import React from "react";
import Image from "next/image";
import {
  CloseOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  BellOutlined,
  LockOutlined,
} from "@ant-design/icons";

import { ChatRoom } from "./types";
import { getInitials, getAvatarGradient } from "./chatUtils";

interface ChatRoomDrawerProps {
  room: ChatRoom;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ChatRoomDrawer: React.FC<ChatRoomDrawerProps> = ({
  room,
  isOpen,
  onClose,
  className = "",
}) => {
  if (!isOpen) return null;

  const displayName = room.names || room.name || "Class Discussion";
  const participants = room.participants || [];

  return (
    <aside
      className={`w-72 sm:w-80 h-full bg-white border-l border-[#E4E7EC] flex flex-col shrink-0 overflow-y-auto ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#F2F4F7] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#101828]">Room Details</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg cursor-pointer transition-colors"
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>

      {/* Profile / Channel Overview */}
      <div className="p-5 text-center border-b border-[#F2F4F7] space-y-3">
        <div className="relative mx-auto w-16 h-16">
          {room.avatar ? (
            <Image
              src={room.avatar}
              alt={displayName}
              width={64}
              height={64}
              unoptimized
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                displayName
              )} text-white flex items-center justify-center font-bold text-xl shadow-xs`}
            >
              {getInitials(displayName)}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-base font-bold text-[#101828]">{displayName}</h4>
          {room.courseTitle && (
            <p className="text-xs text-[#315CFF] font-medium mt-0.5">{room.courseTitle}</p>
          )}
          {room.batchName && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F2F4F7] text-[#475467]">
              {room.batchName}
            </span>
          )}
        </div>

        {room.description && (
          <p className="text-xs text-[#667085] leading-relaxed text-left bg-[#F8FAFC] p-3 rounded-xl border border-[#E4E7EC]">
            {room.description}
          </p>
        )}
      </div>

      {/* Quick Info Stats */}
      <div className="p-4 border-b border-[#F2F4F7] grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC]">
          <span className="text-[11px] text-[#667085] font-medium block">Members</span>
          <span className="text-base font-bold text-[#101828]">{room.memberCount || participants.length || 2}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC]">
          <span className="text-[11px] text-[#667085] font-medium block">Room Type</span>
          <span className="text-xs font-bold text-[#315CFF] capitalize">{room.type}</span>
        </div>
      </div>

      {/* Participants List */}
      <div className="p-4 flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-[#344054] uppercase tracking-wider">
            Participants ({participants.length || (room.memberCount || 2)})
          </h5>
          <TeamOutlined className="text-xs text-[#98A2B3]" />
        </div>

        <div className="space-y-2">
          {participants.length > 0 ? (
            participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${getAvatarGradient(
                        p.name
                      )} text-white flex items-center justify-center font-bold text-xs`}
                    >
                      {getInitials(p.name)}
                    </div>
                    {p.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#101828] truncate">{p.name}</p>
                    <span
                      className={`text-[10px] font-medium px-1 rounded-sm ${
                        p.role === "instructor"
                          ? "bg-purple-100 text-purple-700"
                          : p.role === "ta"
                          ? "bg-amber-100 text-amber-700"
                          : "text-[#667085]"
                      }`}
                    >
                      {p.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#98A2B3] italic">Group members active in this batch.</p>
          )}
        </div>
      </div>

      {/* Security notice footer */}
      <div className="p-4 border-t border-[#F2F4F7] text-[11px] text-[#98A2B3] flex items-center gap-1.5 justify-center">
        <LockOutlined />
        <span>End-to-end LMS course communication</span>
      </div>
    </aside>
  );
};

export default ChatRoomDrawer;
