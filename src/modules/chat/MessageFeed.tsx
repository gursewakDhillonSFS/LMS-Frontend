"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import {
  CheckOutlined,
  ArrowDownOutlined,
  FileZipOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { Tooltip, Popover } from "antd";

import { ChatMessageItem, ChatRoom } from "./types";
import {
  getInitials,
  getAvatarGradient,
  formatMessageTime,
  formatDateDivider,
  isSameDay,
} from "./chatUtils";

interface MessageFeedProps {
  room: ChatRoom;
  messages: ChatMessageItem[];
  currentUserId?: string;
  searchQuery?: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  className?: string;
}

const QUICK_REACTION_EMOJIS = ["👍", "❤️", "💡", "👏", "🔥", "🚀"];

export const MessageFeed: React.FC<MessageFeedProps> = ({
  room,
  messages,
  currentUserId,
  searchQuery = "",
  onAddReaction,
  className = "",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.message.toLowerCase().includes(q) ||
        (m.senderName && m.senderName.toLowerCase().includes(q))
    );
  }, [messages, searchQuery]);

  return (
    <div className={`relative flex-1 flex flex-col min-h-0 bg-[#FAFAFC] ${className}`}>
      {/* Messages Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {/* Welcome Card for Room */}
        <div className="mx-auto max-w-md p-5 rounded-2xl bg-white border border-[#E4E7EC] text-center shadow-2xs mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold mb-3 shadow-xs">
            {getInitials(room.names || room.name)}
          </div>
          <h3 className="text-base font-bold text-[#101828]">
            {room.names || room.name}
          </h3>
          <p className="text-xs text-[#667085] mt-1 leading-relaxed">
            {room.description ||
              "This is the start of this channel. Ask questions, collaborate with peers, and share learning resources."}
          </p>
        </div>

        {/* Messages List with Date Dividers */}
        {filteredMessages.map((msg, index) => {
          const prevMsg = filteredMessages[index - 1];
          const showDateDivider = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);
          const isMine = !!currentUserId && msg.senderId === currentUserId;
          const time = formatMessageTime(msg.createdAt);

          return (
            <React.Fragment key={msg._id || index}>
              {/* Date Divider */}
              {showDateDivider && (
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 rounded-full bg-white border border-[#E4E7EC] text-[11px] font-semibold text-[#667085] shadow-2xs">
                    {formatDateDivider(msg.createdAt)}
                  </span>
                </div>
              )}

              {/* Message Row */}
              <div
                className={`group flex items-end gap-2 relative ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                {/* Left Avatar for other participants */}
                {!isMine && (
                  <div className="shrink-0 mb-1">
                    {msg.senderAvatar ? (
                      <Image
                        src={msg.senderAvatar}
                        alt={msg.senderName || "User"}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                          msg.senderName || "User"
                        )} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}
                      >
                        {getInitials(msg.senderName || "User")}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble + Meta */}
                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                    isMine ? "items-end" : "items-start"
                  }`}
                >
                  {/* Sender Name & Role (only for others) */}
                  {!isMine && msg.senderName && (
                    <div className="flex items-center gap-1.5 ml-1 mb-1">
                      <span className="text-xs font-bold text-[#344054]">
                        {msg.senderName}
                      </span>
                      {msg.senderRole && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                            msg.senderRole === "instructor"
                              ? "bg-purple-100 text-purple-700"
                              : msg.senderRole === "ta"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {msg.senderRole.toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs break-words ${
                      isMine
                        ? "bg-[#315CFF] text-white rounded-br-xs"
                        : "bg-white text-[#101828] border border-[#E4E7EC] rounded-bl-xs"
                    }`}
                  >
                    {/* Attachment preview if present */}
                    {msg.attachmentName && (
                      <a
                        href={msg.attachmentUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-2.5 p-2.5 mb-2 rounded-xl border text-xs font-semibold transition-all ${
                          isMine
                            ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                            : "bg-[#F8FAFC] hover:bg-[#F2F4F7] border-[#E4E7EC] text-[#315CFF]"
                        }`}
                      >
                        {msg.attachmentType === "pdf" ? (
                          <FilePdfOutlined className="text-base text-red-500" />
                        ) : msg.attachmentType === "file" ? (
                          <FileZipOutlined className="text-base text-amber-500" />
                        ) : (
                          <FileTextOutlined className="text-base" />
                        )}
                        <span className="truncate flex-1">{msg.attachmentName}</span>
                      </a>
                    )}

                    {/* Message Body */}
                    <p className="whitespace-pre-wrap">{msg.message}</p>

                    {/* Timestamp & Read Receipts */}
                    <div
                      className={`flex items-center gap-1 justify-end mt-1 text-[10px] select-none ${
                        isMine ? "text-white/70" : "text-[#98A2B3]"
                      }`}
                    >
                      <span>{time}</span>
                      {isMine && (
                        <span className="flex items-center ml-0.5">
                          <CheckOutlined className="text-[10px]" />
                          {msg.isDelivered && (
                            <CheckOutlined className="text-[10px] -ml-1 text-emerald-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-1">
                      {msg.reactions.map((r, ri) => (
                        <button
                          key={ri}
                          type="button"
                          onClick={() => onAddReaction && onAddReaction(msg._id, r.emoji)}
                          className="px-2 py-0.5 rounded-full text-xs bg-white border border-[#E4E7EC] hover:border-[#315CFF] text-[#344054] flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                        >
                          <span>{r.emoji}</span>
                          <span className="font-semibold text-[11px]">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Reaction Popover on Hover */}
                {onAddReaction && (
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 ${
                      isMine ? "right-12" : "left-12"
                    } z-10`}
                  >
                    <div className="flex items-center gap-1 p-1 rounded-full bg-white border border-[#E4E7EC] shadow-md">
                      {QUICK_REACTION_EMOJIS.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onAddReaction(msg._id, emoji)}
                          className="w-6 h-6 rounded-full hover:bg-[#F2F4F7] flex items-center justify-center text-xs cursor-pointer transition-transform hover:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        <div ref={bottomAnchorRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-6 w-9 h-9 rounded-full bg-white border border-[#E4E7EC] text-[#344054] hover:text-[#315CFF] hover:border-[#315CFF] shadow-lg flex items-center justify-center cursor-pointer transition-all animate-bounce z-10"
          aria-label="Scroll to bottom"
        >
          <ArrowDownOutlined className="text-xs" />
        </button>
      )}
    </div>
  );
};

export default MessageFeed;
