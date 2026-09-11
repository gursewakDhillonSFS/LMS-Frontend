"use client";

import { Input } from "antd";
import { useState, useEffect, useRef } from "react";
import {
  LeftArrowIcon,
  SendButtonIcon,
} from "@/utils/icons";
import { CheckOutlined } from "@ant-design/icons";

export interface ChatConversationLite {
  id?: number;
  _id?: string;
  name?: string;
  names?: string;
  avatar?: string;
}

interface ExternalMessage {
  _id: string;
  message: string;
  senderId: string;
  senderName?: string;
  createdAt?: string;
}

interface ChatUiProps {
  selectedUser?: ChatConversationLite | null;
  onBack?: () => void;
  messages?: ExternalMessage[];
  onSend?: (text: string) => void;
  currentUserId?: string;
}

export default function ChatUi({
  selectedUser,
  onBack,
  messages,
  onSend,
  currentUserId,
}: ChatUiProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const displayMessages = messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    if (onSend) {
      onSend(newMessage.trim());
    }
    setNewMessage("");
  };

  const displayName = selectedUser?.names || selectedUser?.name || "Chat";

  return (
    <div className="flex flex-col h-full bg-white">
      {(selectedUser || onBack) && (
        <div className="flex items-center gap-3 p-3.5 border-b border-[#E4E7EC] bg-white">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-[#F2F4F7] text-[#475467] transition-colors cursor-pointer"
            >
              <LeftArrowIcon />
            </button>
          )}
          <div>
            <h3 className="font-bold text-sm text-[#101828]">{displayName}</h3>
            <span className="text-[11px] text-[#667085] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#FAFAFC]">
        {displayMessages.map((msg) => {
          const mine = !!currentUserId && msg.senderId === currentUserId;
          return (
            <div
              key={msg._id}
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs break-words ${
                mine
                  ? "self-end bg-[#315CFF] text-white rounded-br-xs"
                  : "self-start bg-white text-[#101828] border border-[#E4E7EC] rounded-bl-xs"
              }`}
            >
              {!mine && msg.senderName && (
                <div className="text-xs font-bold text-[#344054] mb-1">
                  {msg.senderName}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.message}</div>
              {msg.createdAt && (
                <div
                  className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${
                    mine ? "text-white/70" : "text-[#98A2B3]"
                  }`}
                >
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {mine && <CheckOutlined className="text-[10px]" />}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-[#E4E7EC] bg-white flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Type a message..."
          className="!py-2 !px-3.5 !rounded-xl !border-[#D0D5DD] hover:!border-[#315CFF] focus:!border-[#315CFF] text-sm"
        />
        <button
          type="button"
          onClick={handleSend}
          className="bg-[#315CFF] hover:bg-[#2547D0] text-white rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
        >
          <SendButtonIcon />
        </button>
      </div>
    </div>
  );
}
