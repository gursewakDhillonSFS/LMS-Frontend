"use client";
import ChatInfo from "@/components/ChatInfo";
import ChatList from "@/components/ChatList";
import ChatUi from "@/components/ChatUi";
import { ChatConversation } from "@/utils/interface";
import React, { useState } from "react";

const mockChatData: ChatConversation[] = [
  {
    _id: "conv1",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    names: "Alex Johnson",
    lastMessage: {
      sender_id: "user123",
      message_type: "text",
      message: "Hey! Are we still on for the meeting?",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 60 }, // 1 min ago
    },
    unread_count: {
      user123: 2,
    },
  },
  {
    _id: "conv2",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    names: "Priya Sharma",
    lastMessage: {
      sender_id: "user456",
      message_type: "image",
      message: "image",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 300 }, // 5 mins ago
    },
    unread_count: {
      user123: 0,
    },
  },
  {
    _id: "conv3",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    names: "Michael Lee",
    lastMessage: {
      sender_id: "user123",
      message_type: "text",
      message: "I'll send the files shortly.",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 7200 }, // 2 hrs ago
    },
    unread_count: {
      user123: 1,
    },
  },
  {
    _id: "conv4",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    names: "Sara Khan",
    lastMessage: {
      sender_id: "user999",
      message_type: "text",
      message: "Thanks! Looking forward to it.",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 86400 }, // 1 day ago
    },
    unread_count: {
      user123: 0,
    },
  },
  {
    _id: "conv5",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    names: "Alex Johnson",
    lastMessage: {
      sender_id: "user123",
      message_type: "text",
      message: "Hey! Are we still on for the meeting?",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 60 }, // 1 min ago
    },
    unread_count: {
      user123: 2,
    },
  },
  {
    _id: "conv6",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    names: "Priya Sharma",
    lastMessage: {
      sender_id: "user456",
      message_type: "image",
      message: "image",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 300 }, // 5 mins ago
    },
    unread_count: {
      user123: 0,
    },
  },
  {
    _id: "conv36",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    names: "Michael Lee",
    lastMessage: {
      sender_id: "user123",
      message_type: "text",
      message: "I'll send the files shortly.",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 7200 }, // 2 hrs ago
    },
    unread_count: {
      user123: 1,
    },
  },
  {
    _id: "conv46",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    names: "Sara Khan",
    lastMessage: {
      sender_id: "user999",
      message_type: "text",
      message: "Thanks! Looking forward to it.",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 86400 }, // 1 day ago
    },
    unread_count: {
      user123: 0,
    },
  },
  {
    _id: "conv16",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    names: "Alex Johnson",
    lastMessage: {
      sender_id: "user123",
      message_type: "text",
      message: "Hey! Are we still on for the meeting?",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 60 }, // 1 min ago
    },
    unread_count: {
      user123: 2,
    },
  },
  {
    _id: "co6nv2",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    names: "Priya Sharma",
    lastMessage: {
      sender_id: "user456",
      message_type: "image",
      message: "image",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 300 }, // 5 mins ago
    },
    unread_count: {
      user123: 0,
    },
  },
  {
    _id: "co6nv3",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    names: "Michael Lee",
    lastMessage: {
      sender_id: "user123",
      message_type: "text",
      message: "I'll send the files shortly.",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 7200 }, // 2 hrs ago
    },
    unread_count: {
      user123: 1,
    },
  },
  {
    _id: "con6v4",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    names: "Sara Khan",
    lastMessage: {
      sender_id: "user999",
      message_type: "text",
      message: "Thanks! Looking forward to it.",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 86400 }, // 1 day ago
    },
    unread_count: {
      user123: 0,
    },
  },
];

const UserChat = () => {
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(
    null
  );
  console.log(selectedChat);
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[32px] font-[700]">Chat</h1>
      <div className="flex gap-2 w-full h-[calc(100vh-160px)] bg-[#EDF0F5] p-[10px] rounded-[15px]">
        <div className="w-[28%] bg-white rounded-[15px] overflow-auto scrollbar-hide">
          <ChatList
            isChat={true}
            mobile={false}
            chat={mockChatData}
            onSelect={setSelectedChat}
          />{" "}
        </div>
        <div className="w-[47%]">
          <ChatUi />
        </div>
        <div className="w-[25%] bg-white rounded-[15px] overflow-auto scrollbar-hide">
          <ChatInfo isGroup={false} />
        </div>
      </div>
    </div>
  );
};

export default UserChat;
