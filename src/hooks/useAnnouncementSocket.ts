import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface AnnouncementPayload {
  _id: string;
  title: string;
  message: string;
  courseId: string;
  courseName: string;
  batchId: string | null;
  batchName: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string | null;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface UseAnnouncementSocketProps {
  courseIds: string[];
  batchIds: string[];
  onAnnouncementNew: (announcement: AnnouncementPayload) => void;
  onAnnouncementDeleted: (announcementId: string) => void;
}

interface SocketNewPayload {
  data: AnnouncementPayload;
}

interface SocketDeletedPayload {
  data: {
    _id: string;
  };
}

export const useAnnouncementSocket = ({
  courseIds,
  batchIds,
  onAnnouncementNew,
  onAnnouncementDeleted,
}: UseAnnouncementSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Determine backend base URL from env
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3288";

    // Initialize Socket connection under the 'announcements' namespace
    const socket = io(`${backendUrl}/announcements`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to Announcements Real-time Gateway:", socket.id);
      
      // Join targeted course & batch rooms
      socket.emit("join", { courseIds, batchIds });
    });

    socket.on("announcement:new", (payload: SocketNewPayload) => {
      console.log("📢 Real-time Announcement Received:", payload);
      if (payload?.data) {
        onAnnouncementNew(payload.data);
      }
    });

    socket.on("announcement:deleted", (payload: SocketDeletedPayload) => {
      console.log("🗑️ Real-time Announcement Deleted:", payload);
      if (payload?.data?._id) {
        onAnnouncementDeleted(payload.data._id);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from Announcements Gateway:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("🔌 WebSocket Connection Error:", err);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [
    JSON.stringify(courseIds),
    JSON.stringify(batchIds),
    onAnnouncementNew,
    onAnnouncementDeleted,
  ]);

  return socketRef.current;
};
