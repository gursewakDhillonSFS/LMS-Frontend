"use client";
import ChatList from "@/components/ChatList";
import ChatUi from "@/components/ChatUi";
import { chatRoom, getChatMessagesApi } from "@/services/collections";
import { ChatConversation } from "@/utils/interface";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const ChatPage = () => {
  const userId = useSelector((s: RootState) => s.userdata?.user_id);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<
    {
      _id: string;
      message: string;
      senderId: string;
      senderName?: string;
      createdAt?: string;
    }[]
  >([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      const res = await chatRoom();
      if (res?.status) {
        setConversations(res.data || []);
      }
    } catch {
      toast.warning("Failed to load chat rooms");
    }
  }, []);

  useEffect(() => {
    loadRooms();
    const token = Cookies.get("token");
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";
    if (!token) return;
    const s = io(`${backendUrl}/communication`, {
      transports: ["websocket"],
      auth: { token },
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [loadRooms]);

  const openRoom = async (conv: ChatConversation) => {
    setSelected(conv);
    try {
      const res = await getChatMessagesApi(conv._id);
      if (res?.status) {
        setMessages(res.data?.messages || []);
      }
      socket?.emit("joinRoom", { groupId: conv._id });
    } catch {
      toast.warning("Failed to load messages");
    }
  };

  useEffect(() => {
    if (!socket || !selected) return;
    const handler = (msg: {
      _id: string;
      message: string;
      senderId: string;
      senderName?: string;
      groupId: string;
      createdAt?: string;
    }) => {
      if (msg.groupId === selected._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("newMessage", handler);
    return () => {
      socket.off("newMessage", handler);
    };
  }, [socket, selected]);

  const sendMessage = (text: string) => {
    if (!selected || !socket || !text.trim()) return;
    socket.emit("sendMessage", { groupId: selected._id, message: text });
  };

  return (
    <div className="flex gap-3 h-[calc(100vh-120px)]">
      <div className="w-1/3 bg-white rounded-xl overflow-hidden p-2">
        <h1 className="text-xl font-bold p-2">Messages</h1>
        <ChatList chat={conversations} onSelect={openRoom} />
      </div>
      <div className="w-2/3 bg-white rounded-xl overflow-hidden flex flex-col">
        {selected ? (
          <ChatUi
            selectedUser={selected}
            messages={messages}
            onSend={sendMessage}
            currentUserId={userId}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Select a chat room
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
