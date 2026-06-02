"use client";

import { Input } from "antd";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  CameraIcon,
  LeftArrowIcon,
  MicIcon,
  PaperClipIcon,
  SendButtonIcon,
} from "@/utils/icons";
import { Card1 } from "@/utils/images";
export interface ChatConversation {
  id: number;
  name?: string;
  names?: string;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isOwner: boolean;
}

interface ChatUiProps {
  selectedUser?: ChatConversation | null;
  onBack?: () => void;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "I was thinking the cafe downtown",
    time: "11:45 AM",
    isOwner: false,
  },
  {
    id: 4,
    text: "I was thinking the cafe downtown",
    time: "11:45 AM",
    isOwner: false,
  },
  {
    id: 5,
    text: "I was thinking the cafe downtown",
    time: "11:45 AM",
    isOwner: false,
  },
  {
    id: 2,
    text: "Pellentesque quis neque mattis sit venenatis viverra tortor. Dictum vivamus dictumst in urna turpis auctor gravida vel maecenas. Enim turpis fringilla molestie feugiat in pellentesque.",
    time: "11:31 AM",
    isOwner: true,
  },
  {
    id: 3,
    text: "Pellentesque quis neque mattis sit venenatis viverra tortor. Dictum vivamus dictumst in urna turpis auctor gravida vel maecenas. Enim turpis fringilla molestie feugiat in pellentesque.",
    time: "11:31 AM",
    isOwner: true,
  },
];

export default function ChatUi({ selectedUser, onBack }: ChatUiProps) {
  const [chatMessages, setChatMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log(chatMessages, "chatMessages");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const time = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const newMsgObj: Message = {
      id: Date.now(),
      text: newMessage,
      time,
      isOwner: true,
    };
    setChatMessages((prev) => [...prev, newMsgObj]);
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="flex flex-col justify-between h-full gap-2">
      {onBack && (
        <div className=" flex items-center justify-between gap-3 p-2 border-b border-[]">
          <button onClick={onBack} className="text-xl cursor-pointer">
            <LeftArrowIcon />
          </button>
          <div className="flex gap-3 items-center">
            <span className="font-semibold">
              {selectedUser?.names || selectedUser?.name || "Chat"}
            </span>
            <Image
              src={Card1}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full !min-h-[40px] !min-w-[40px]"
            />
          </div>
        </div>
      )}
      <div className="overflow-auto scrollbar-hide">
        <div className="text-center text-xs text-gray-500 sticky top-0">
          8/20/2020
        </div>
        <div className="overflow-y-auto gap-3 scrollbar-hide"></div>
        {chatMessages.map((message, index) => {
          const showAvatar =
            index === 0 || chatMessages[index - 1].isOwner !== message.isOwner;

          return (
            <div
              key={message.id}
              className={`flex w-full ${
                message?.isOwner
                  ? "items-start justify-end"
                  : "flex-row-reverse items-start justify-end"
              } gap-1 mt-3`}
            >
              <div className="text-right max-w-[calc(100%-85px)]">
                <div
                  className={`${
                    message?.isOwner
                      ? "bg-primary rounded-tr-none"
                      : "bg-white rounded-tl-none"
                  } text-start text-sm font-poppins px-4 py-2 rounded-[12px]`}
                >
                  {message.text}
                  <div className="text-xs text-[#666668] mt-1 text-right">
                    {message.time}
                  </div>
                </div>
              </div>
              {showAvatar ? (
                <Image
                  src={Card1}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full !min-w-10 !min-h-10"
                />
              ) : (
                <div className="min-w-[40px] min-h-[40px] rounded-full"></div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2 w-full">
        <Input
          placeholder="Write Your Message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          suffix={
            <div className="flex items-center gap-3 cursor-pointer">
              <PaperClipIcon />
              <CameraIcon />
              <MicIcon />
            </div>
          }
          onPressEnter={handleSend}
          className="w-full h-[44px] px-3 py-3 !rounded-[12px] !border-[#d9d9d9] !hover:border-[#d9d9d9] !focus:border-[#d9d9d9] !focus:shadow-none !active:shadow-none"
        />

        <button
          type="submit"
          onClick={handleSend}
          className="bg-secondary h-[44px] w-[44px] text-white rounded-[10px] flex justify-center items-center"
        >
          <SendButtonIcon />
        </button>
      </div>
    </div>
  );
}
