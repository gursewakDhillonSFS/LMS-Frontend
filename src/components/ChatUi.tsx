"use client";

import { Input } from "antd";
import { useState, useEffect, useRef } from "react";
import {
  LeftArrowIcon,
  SendButtonIcon,
} from "@/utils/icons";

export interface ChatConversationLite {
  id?: number;
  _id?: string;
  name?: string;
  names?: string;
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

  return (
    <div className="flex flex-col h-full">
      {(selectedUser || onBack) && (
        <div className="flex items-center gap-2 p-3 border-b">
          {onBack && (
            <button type="button" onClick={onBack}>
              <LeftArrowIcon />
            </button>
          )}
          <span className="font-semibold">
            {selectedUser?.names || selectedUser?.name || "Chat"}
          </span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {displayMessages.map((msg) => {
          const mine = !!currentUserId && msg.senderId === currentUserId;
          return (
            <div
              key={msg._id}
              className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                mine
                  ? "self-end bg-secondary text-white"
                  : "self-start bg-[#F4F4F4] text-black"
              }`}
            >
              {!mine && msg.senderName && (
                <div className="text-xs font-semibold mb-1">{msg.senderName}</div>
              )}
              <div>{msg.message}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Type a message..."
        />
        <button
          type="button"
          onClick={handleSend}
          className="bg-secondary text-white rounded-xl px-3"
        >
          <SendButtonIcon />
        </button>
      </div>
    </div>
  );
}
