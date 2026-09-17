"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { MessageOutlined, WechatOutlined, SmileOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";

import { RootState } from "@/redux/store";
import { toast } from "@/utils/toast";
import {
  chatRoom,
  getChatMessagesApi,
  sendChatMessageApi,
  addChatMessageReactionApi,
} from "@/services/collections";

import { ChatRoom, ChatMessageItem, ChatMessageReaction } from "./types";
import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./ChatHeader";
import MessageFeed from "./MessageFeed";
import MessageComposer from "./MessageComposer";
import ChatRoomDrawer from "./ChatRoomDrawer";

interface ChatContainerProps {
  role?: "student" | "instructor";
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ role = "student" }) => {
  const currentUserId = useSelector((s: RootState) => s.userdata?.user_id) || "";
  const currentUserName =
    useSelector((s: RootState) => s.userdata?.full_name) ||
    useSelector((s: RootState) => s.userdata?.first_name) ||
    (role === "instructor" ? "Instructor" : "Student");

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Helper to fetch messages for a specific room
  const fetchMessagesForRoom = useCallback(async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const res = await getChatMessagesApi(roomId);
      const rawMessages = res?.data?.messages || res?.data || [];
      if (Array.isArray(rawMessages)) {
        const mapped = rawMessages.map((m: any) => ({
          _id: m._id || `msg-${Math.random()}`,
          message: m.message || "",
          senderId: m.senderId?._id || m.senderId || "",
          senderName: m.senderName || m.senderId?.fullName || "User",
          senderAvatar: m.senderAvatar || m.senderId?.avatar,
          senderRole: m.senderRole || m.senderId?.role || "student",
          groupId: m.groupId || roomId,
          createdAt: m.createdAt || new Date().toISOString(),
          isDelivered: true,
          isRead: true,
        }));
        setMessages(mapped);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to load room messages:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Load chat rooms from API
  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const res = await chatRoom();
      const rawData = res?.data?.rooms || res?.data || [];
      if (Array.isArray(rawData) && rawData.length > 0) {
        const mappedRooms: ChatRoom[] = rawData.map((r: any) => ({
          _id: r._id,
          name: r.names || r.name || "Course Chat Room",
          names: r.names || r.name,
          type: r.type || "course",
          courseTitle: r.courseTitle || r.courseId?.course_name,
          batchName: r.batchName || r.batchId?.batchName,
          avatar: r.avatar,
          memberCount: r.participants?.length || r.memberCount || 2,
          unreadCount: r.unreadCount || 0,
          description: r.description,
          participants: r.participants || [],
          lastMessage: r.lastMessage
            ? {
                message: r.lastMessage.message || "",
                senderName: r.lastMessage.senderName || "",
                createdAt: r.lastMessage.createdAt || new Date().toISOString(),
              }
            : undefined,
        }));

        setRooms(mappedRooms);
        setSelectedRoom(mappedRooms[0]);
        fetchMessagesForRoom(mappedRooms[0]._id);
      } else {
        setRooms([]);
        setSelectedRoom(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to load chat rooms:", err);
      setRooms([]);
      setSelectedRoom(null);
      setMessages([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [fetchMessagesForRoom]);

  // Socket connection
  useEffect(() => {
    loadRooms();
    const token = Cookies.get("token");
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";
    if (!token) return;

    try {
      const s = io(`${backendUrl}/communication`, {
        transports: ["websocket", "polling"],
        auth: { token },
      });
      setSocket(s);

      return () => {
        s.disconnect();
      };
    } catch (e) {
      console.error("Socket error:", e);
    }
  }, [loadRooms]);

  // Handle switching rooms
  const handleSelectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    setMobileView("chat");
    setIsSearching(false);
    setSearchQuery("");

    // Clear unread count locally
    setRooms((prev) =>
      prev.map((r) => (r._id === room._id ? { ...r, unreadCount: 0 } : r))
    );

    await fetchMessagesForRoom(room._id);
    socket?.emit("joinRoom", { groupId: room._id });
  };

  // Sync active room ID to sessionStorage for popup suppressing
  useEffect(() => {
    if (selectedRoom?._id) {
      sessionStorage.setItem("active_chat_room_id", selectedRoom._id);
    } else {
      sessionStorage.removeItem("active_chat_room_id");
    }
    return () => {
      sessionStorage.removeItem("active_chat_room_id");
    };
  }, [selectedRoom?._id]);

  // Support deep linking to a specific room via ?room= query param
  useEffect(() => {
    if (typeof window !== "undefined" && rooms.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const targetRoomId = urlParams.get("room");
      if (targetRoomId) {
        const found = rooms.find((r) => r._id === targetRoomId);
        if (found && selectedRoom?._id !== targetRoomId) {
          handleSelectRoom(found);
        }
      }
    }
  }, [rooms]);

  // Socket new message and reaction listeners
  useEffect(() => {
    if (!socket || !selectedRoom) return;

    const messageHandler = (msg: {
      _id: string;
      message: string;
      senderId: string;
      senderName?: string;
      senderAvatar?: string;
      groupId: string;
      createdAt?: string;
      reactions?: ChatMessageReaction[];
    }) => {
      if (msg.groupId === selectedRoom._id) {
        setMessages((prev) => {
          // If message is from current user, replace the optimistic temporary message
          if (String(msg.senderId) === String(currentUserId)) {
            const optIndex = prev.findIndex(
              (m) =>
                m._id.startsWith("msg-") &&
                m.message.trim() === msg.message.trim()
            );
            if (optIndex !== -1) {
              const updated = [...prev];
              updated[optIndex] = {
                _id: msg._id,
                message: msg.message,
                senderId: msg.senderId,
                senderName: msg.senderName || currentUserName,
                senderAvatar: msg.senderAvatar,
                groupId: msg.groupId,
                createdAt: msg.createdAt || new Date().toISOString(),
                isDelivered: true,
                isRead: true,
                reactions: msg.reactions || [],
              };
              return updated;
            }
          }

          // Avoid duplicate by ID
          if (prev.some((m) => m._id === msg._id)) {
            return prev;
          }

          return [
            ...prev,
            {
              _id: msg._id || `msg-${Date.now()}`,
              message: msg.message,
              senderId: msg.senderId,
              senderName: msg.senderName || "User",
              senderAvatar: msg.senderAvatar,
              groupId: msg.groupId,
              createdAt: msg.createdAt || new Date().toISOString(),
              isDelivered: true,
              isRead: true,
              reactions: msg.reactions || [],
            },
          ];
        });
      }

      // Update room's last message in the sidebar
      setRooms((prev) =>
        prev.map((r) => {
          if (r._id === msg.groupId) {
            return {
              ...r,
              lastMessage: {
                message: msg.message,
                senderName: msg.senderName || "User",
                createdAt: msg.createdAt || new Date().toISOString(),
              },
              unreadCount:
                r._id === selectedRoom._id
                  ? 0
                  : (r.unreadCount || 0) + 1,
            };
          }
          return r;
        })
      );
    };

    const reactionHandler = (payload: {
      messageId: string;
      groupId: string;
      reactions: ChatMessageReaction[];
    }) => {
      if (payload?.messageId) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === payload.messageId
              ? { ...m, reactions: payload.reactions || [] }
              : m
          )
        );
      }
    };

    socket.on("newMessage", messageHandler);
    socket.on("messageReaction", reactionHandler);

    return () => {
      socket.off("newMessage", messageHandler);
      socket.off("messageReaction", reactionHandler);
    };
  }, [socket, selectedRoom, currentUserId, currentUserName]);

  // Send message handler (Optimistic UI update + Socket emit + REST fallback)
  const handleSendMessage = async (text: string) => {
    if (!selectedRoom || !text.trim()) return;

    const tempId = `msg-${Date.now()}`;
    const newMsgItem: ChatMessageItem = {
      _id: tempId,
      message: text.trim(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: role === "instructor" ? "instructor" : "student",
      groupId: selectedRoom._id,
      createdAt: new Date().toISOString(),
      isDelivered: true,
      isRead: false,
      reactions: [],
    };

    // 1. Optimistic append
    setMessages((prev) => [...prev, newMsgItem]);

    // 2. Update room snippet in sidebar
    setRooms((prev) =>
      prev.map((r) =>
        r._id === selectedRoom._id
          ? {
              ...r,
              lastMessage: {
                message: text.trim(),
                senderName: currentUserName,
                createdAt: new Date().toISOString(),
              },
            }
          : r
      )
    );

    // 3. Emit through WebSocket if connected (avoids duplicate send)
    if (socket && socket.connected) {
      socket.emit("sendMessage", {
        groupId: selectedRoom._id,
        message: text.trim(),
      });
    } else {
      // 4. REST DB persistence fallback ONLY when socket is not connected
      try {
        await sendChatMessageApi(selectedRoom._id, text.trim());
      } catch (err) {
        console.warn("Message REST sync error:", err);
      }
    }
  };

  // Add emoji reaction
  const handleAddReaction = async (messageId: string, emoji: string) => {
    // 1. Optimistically toggle reaction locally
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== messageId) return m;
        const existing = m.reactions || [];
        const found = existing.find((r) => r.emoji === emoji);
        if (found) {
          const userHasReacted = found.users.includes(currentUserId);
          if (userHasReacted) {
            const updatedUsers = found.users.filter((u) => u !== currentUserId);
            if (updatedUsers.length === 0) {
              return {
                ...m,
                reactions: existing.filter((r) => r.emoji !== emoji),
              };
            }
            return {
              ...m,
              reactions: existing.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: Math.max(0, r.count - 1),
                      users: updatedUsers,
                    }
                  : r
              ),
            };
          } else {
            return {
              ...m,
              reactions: existing.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      users: [...r.users, currentUserId],
                    }
                  : r
              ),
            };
          }
        }
        return {
          ...m,
          reactions: [...existing, { emoji, count: 1, users: [currentUserId] }],
        };
      })
    );

    // 2. Broadcast via socket if connected, or fallback to REST
    if (socket && socket.connected) {
      socket.emit("addReaction", { messageId, emoji });
    } else {
      try {
        await addChatMessageReactionApi(messageId, emoji);
      } catch (err) {
        console.warn("Failed to submit message reaction via REST:", err);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] min-h-[580px] bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden flex shadow-xs">
      {/* 1. Left: Conversation Sidebar */}
      {loadingRooms ? (
        <div className="w-full lg:w-80 xl:w-88 p-4 border-r border-[#E4E7EC] space-y-4">
          <Skeleton.Input active block style={{ height: 40 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton.Avatar active size={44} shape="circle" />
              <div className="flex-1">
                <Skeleton active paragraph={{ rows: 1 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ConversationSidebar
          rooms={rooms}
          selectedRoomId={selectedRoom?._id || null}
          onSelectRoom={handleSelectRoom}
          className={`${
            mobileView === "list" ? "w-full lg:w-80 xl:w-88" : "hidden lg:flex lg:w-80 xl:w-88"
          }`}
        />
      )}

      {/* 2. Middle: Active Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#FAFAFC] ${
          mobileView === "chat" ? "flex" : "hidden lg:flex"
        }`}
      >
        {selectedRoom ? (
          <>
            {/* Header */}
            <ChatHeader
              room={selectedRoom}
              onBack={() => setMobileView("list")}
              onToggleSearch={() => {
                setIsSearching((prev) => !prev);
                if (isSearching) setSearchQuery("");
              }}
              isSearching={isSearching}
              onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
              isDrawerOpen={isDrawerOpen}
              onToggleMute={() => {
                setIsMuted((prev) => !prev);
                toast.info(isMuted ? "Notifications unmuted" : "Notifications muted for this room");
              }}
              isMuted={isMuted}
            />

            {/* In-Chat Search Bar */}
            {isSearching && (
              <div className="px-4 py-2 bg-white border-b border-[#E4E7EC] flex items-center gap-2 shrink-0 animate-fadeIn">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in this conversation..."
                  autoFocus
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#F8FAFC] border border-[#D0D5DD] text-xs sm:text-sm text-[#101828] focus:border-[#315CFF] focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-[#667085] hover:text-[#101828] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Message Feed */}
            {loadingMessages ? (
              <div className="flex-1 p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} active avatar paragraph={{ rows: 2 }} />
                ))}
              </div>
            ) : (
              <MessageFeed
                room={selectedRoom}
                messages={messages}
                currentUserId={currentUserId}
                searchQuery={searchQuery}
                onAddReaction={handleAddReaction}
              />
            )}

            {/* Message Composer */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              placeholder={`Message in ${selectedRoom.names || selectedRoom.name}...`}
            />
          </>
        ) : (
          /* Empty State when no room selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-16 h-16 rounded-3xl bg-[#F0F4FF] text-[#315CFF] flex items-center justify-center text-3xl mb-4 shadow-xs">
              <WechatOutlined />
            </div>
            <h3 className="text-lg font-bold text-[#101828]">
              {rooms.length === 0 ? "No Conversations Yet" : "Select a conversation"}
            </h3>
            <p className="text-xs sm:text-sm text-[#667085] max-w-sm mt-1">
              {rooms.length === 0
                ? "Chat rooms are automatically created for each course and batch you are enrolled in or assigned to teach."
                : "Choose a study group, course batch, or faculty advisor from the list on the left to start collaborating."}
            </p>
          </div>
        )}
      </div>

      {/* 3. Right: Collapsible Room Info Drawer */}
      {selectedRoom && (
        <ChatRoomDrawer
          room={selectedRoom}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatContainer;
