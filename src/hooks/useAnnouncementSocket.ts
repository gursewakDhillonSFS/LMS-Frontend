import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

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
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";
    const token = Cookies.get("token");

    if (!token) {
      return;
    }

    const socket = io(`${backendUrl}/announcements`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { courseIds, batchIds });
    });

    socket.on("announcement:new", (payload: SocketNewPayload) => {
      if (payload?.data) {
        onAnnouncementNew(payload.data);
      }
    });

    socket.on("announcement:deleted", (payload: SocketDeletedPayload) => {
      if (payload?.data?._id) {
        onAnnouncementDeleted(payload.data._id);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [
    JSON.stringify(courseIds),
    JSON.stringify(batchIds),
    onAnnouncementNew,
    onAnnouncementDeleted,
  ]);

  return socketRef.current;
};
