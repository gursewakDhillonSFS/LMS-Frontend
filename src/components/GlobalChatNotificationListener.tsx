"use client";

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { toast } from "@/utils/toast";

interface IncomingChatMessage {
  _id: string;
  groupId: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  message: string;
  createdAt?: string;
}

const GlobalChatNotificationListener: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);

  const currentUserId = useSelector(
    (state: RootState) => state.userdata?.user_id
  );
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";

    const socket = io(`${backendUrl}/communication`, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // connected to communication socket
    });

    socket.on("newMessage", (msg: IncomingChatMessage) => {
      if (!msg || !msg.message) return;

      const myId = currentUserIdRef.current;
      // Do not notify for user's own sent message
      if (myId && String(msg.senderId) === String(myId)) {
        return;
      }

      // Check if user is currently inside this specific chat room
      const isChatPage =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/chat");
      const activeRoomId =
        typeof window !== "undefined"
          ? window.sessionStorage?.getItem("active_chat_room_id")
          : null;

      // Always dispatch refresh event so bell count and notification tab update in real-time
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("refresh_notifications"));
      }

      // If user is already actively reading this room, skip popup notification
      if (isChatPage && activeRoomId === msg.groupId) {
        return;
      }

      const senderTitle = msg.senderName ? msg.senderName : "New Message";
      const snippet =
        msg.message.length > 80 ? `${msg.message.slice(0, 77)}...` : msg.message;

      toast.info(
        <div
          className="flex items-start gap-2.5 cursor-pointer select-none"
          onClick={() => {
            window.location.href = `/chat?room=${msg.groupId}`;
          }}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
            💬
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs text-[#101828] truncate">
                {senderTitle}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold shrink-0">
                View →
              </span>
            </div>
            <p className="text-xs text-[#475467] line-clamp-2 m-0 leading-snug">
              {snippet}
            </p>
          </div>
        </div>,
        {
          autoClose: 5000,
          toastId: `chat-${msg._id || msg.groupId}`,
        }
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return null;
};

export default GlobalChatNotificationListener;
