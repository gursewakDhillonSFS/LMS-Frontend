"use client";

import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import {
  setUnreadCount,
  incrementUnreadCount,
  addRealtimeAnnouncement,
  removeRealtimeAnnouncement,
} from "@/redux/slices/AnnouncementSlice";
import { getUnreadAnnouncementCountApi } from "@/services/collections";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";

interface SocketNewPayload {
  data: AnnouncementPayload;
}

interface SocketDeletedPayload {
  data: {
    _id: string;
  };
}

const GlobalAnnouncementListener: React.FC = () => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // 1. Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const res = await getUnreadAnnouncementCountApi();
        if (res?.status && res?.data?.unreadCount !== undefined) {
          dispatch(setUnreadCount(res.data.unreadCount));
        }
      } catch (err) {
        console.error("Failed to fetch announcement unread count:", err);
      }
    };
    fetchUnreadCount();

    // 2. Connect to Announcement Socket.IO
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3288";

    const socket = io(`${backendUrl}/announcements`, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to global announcement socket");
    });

    socket.on("announcement:new", (payload: SocketNewPayload) => {
      if (payload?.data) {
        dispatch(incrementUnreadCount());
        dispatch(addRealtimeAnnouncement(payload.data));

        toast.info(
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm text-[#0E0E0E]">
              📢 {payload.data.title}
            </span>
            <span className="text-xs text-gray-500">
              {payload.data.courseName} • {payload.data.batchName || "All Batches"}
            </span>
          </div>,
          {
            autoClose: 5000,
          }
        );
      }
    });

    socket.on("announcement:deleted", (payload: SocketDeletedPayload) => {
      if (payload?.data?._id) {
        dispatch(removeRealtimeAnnouncement(payload.data._id));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [dispatch]);

  return null;
};

export default GlobalAnnouncementListener;
