export type ChatFilterCategory = "all" | "courses" | "direct" | "unread";

export interface ChatParticipant {
  id: string;
  name: string;
  role: "instructor" | "teacher" | "student" | "ta" | "admin";
  avatar?: string;
  isOnline?: boolean;
}

export interface ChatMessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatMessageItem {
  _id: string;
  message: string;
  senderId: string;
  senderName?: string;
  senderRole?: "instructor" | "teacher" | "student" | "ta";
  senderAvatar?: string;
  groupId?: string;
  createdAt?: string;
  isDelivered?: boolean;
  isRead?: boolean;
  reactions?: ChatMessageReaction[];
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: "image" | "pdf" | "file";
}

export interface ChatRoom {
  _id: string;
  name: string;
  names?: string;
  type: "course" | "direct" | "general";
  courseTitle?: string;
  batchName?: string;
  avatar?: string;
  isOnline?: boolean;
  memberCount?: number;
  unreadCount?: number;
  lastMessage?: {
    message: string;
    senderName?: string;
    createdAt?: string;
    message_type?: string;
  };
  participants?: ChatParticipant[];
  description?: string;
}
