"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { MessageOutlined, WechatOutlined } from "@ant-design/icons";

import { RootState } from "@/redux/store";
import { toast } from "@/utils/toast";
import { chatRoom, getChatMessagesApi } from "@/services/collections";

import { ChatRoom, ChatMessageItem } from "./types";
import { DEMO_CHAT_ROOMS, DEMO_MESSAGES } from "./demoData";
import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./ChatHeader";
import MessageFeed from "./MessageFeed";
import MessageComposer from "./MessageComposer";
import ChatRoomDrawer from "./ChatRoomDrawer";

interface ChatContainerProps {
  role?: "student" | "instructor";
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ role = "student" }) => {
  const currentUserId = useSelector((s: RootState) => s.userdata?.user_id) || "p-3";
  const currentUserName =
    useSelector((s: RootState) => s.userdata?.full_name) ||
    useSelector((s: RootState) => s.userdata?.first_name) ||
    (role === "instructor" ? "Instructor" : "Student");

  const [rooms, setRooms] = useState<ChatRoom[]>(DEMO_CHAT_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(DEMO_CHAT_ROOMS[0]);
  const [messages, setMessages] = useState<ChatMessageItem[]>(
    DEMO_MESSAGES["demo-room-1"] || []
  );

  const [socket, setSocket] = useState<Socket | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Load chat rooms from API with demo fallback
  const loadRooms = useCallback(async () => {
    try {
      const res = await chatRoom();
      if (res?.status && Array.isArray(res.data) && res.data.length > 0) {
        // Map backend chat room format to ChatRoom interface
        const mappedRooms: ChatRoom[] = res.data.map((r: any) => ({
          _id: r._id,
          name: r.names || r.name || "Course Chat Room",
          names: r.names || r.name,
          type: r.type || "course",
          courseTitle: r.courseTitle,
          batchName: r.batchName,
          avatar: r.avatar,
          memberCount: r.memberCount || 2,
          unreadCount: r.unreadCount || 0,
          description: r.description,
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
      }
    } catch {
      // Keep demo rooms active for seamless UI inspection
    }
  }, []);

  // Socket connection
  useEffect(() => {
    loadRooms();
    const token = Cookies.get("token");
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";
    if (!token) return;

    try {
      const s = io(`${backendUrl}/communication`, {
        transports: ["websocket"],
        auth: { token },
      });
      setSocket(s);

      return () => {
        s.disconnect();
      };
    } catch (e) {
      console.error("Socket error", e);
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

    // If it's a demo room, use demo messages
    if (DEMO_MESSAGES[room._id]) {
      setMessages(DEMO_MESSAGES[room._id]);
      socket?.emit("joinRoom", { groupId: room._id });
      return;
    }

    try {
      const res = await getChatMessagesApi(room._id);
      if (res?.status && res.data?.messages) {
        setMessages(res.data.messages);
      } else {
        setMessages([]);
      }
      socket?.emit("joinRoom", { groupId: room._id });
    } catch {
      setMessages(DEMO_MESSAGES[room._id] || []);
    }
  };

  // Socket new message listener
  useEffect(() => {
    if (!socket || !selectedRoom) return;

    const handler = (msg: {
      _id: string;
      message: string;
      senderId: string;
      senderName?: string;
      groupId: string;
      createdAt?: string;
    }) => {
      if (msg.groupId === selectedRoom._id) {
        setMessages((prev) => [...prev, { ...msg, isDelivered: true }]);
      }

      // Update room's last message in the sidebar
      setRooms((prev) =>
        prev.map((r) => {
          if (r._id === msg.groupId) {
            return {
              ...r,
              lastMessage: {
                message: msg.message,
                senderName: msg.senderName,
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

    socket.on("newMessage", handler);
    return () => {
      socket.off("newMessage", handler);
    };
  }, [socket, selectedRoom]);

  // Send message handler (Optimistic UI update + Socket emit)
  const handleSendMessage = (text: string) => {
    if (!selectedRoom || !text.trim()) return;

    const newMsgItem: ChatMessageItem = {
      _id: `msg-${Date.now()}`,
      message: text,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: role === "instructor" ? "instructor" : "student",
      groupId: selectedRoom._id,
      createdAt: new Date().toISOString(),
      isDelivered: true,
      isRead: false,
    };

    // 1. Optimistic append to current view
    setMessages((prev) => [...prev, newMsgItem]);

    // 2. Update room snippet in sidebar
    setRooms((prev) =>
      prev.map((r) =>
        r._id === selectedRoom._id
          ? {
              ...r,
              lastMessage: {
                message: text,
                senderName: currentUserName,
                createdAt: new Date().toISOString(),
              },
            }
          : r
      )
    );

    // 3. Emit through WebSocket
    if (socket) {
      socket.emit("sendMessage", {
        groupId: selectedRoom._id,
        message: text,
      });
    }
  };

  // Add emoji reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== messageId) return m;
        const existing = m.reactions || [];
        const found = existing.find((r) => r.emoji === emoji);
        if (found) {
          return {
            ...m,
            reactions: existing.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            ),
          };
        }
        return {
          ...m,
          reactions: [...existing, { emoji, count: 1, users: [currentUserId] }],
        };
      })
    );
  };

  return (
    <div className="h-[calc(100vh-100px)] min-h-[580px] bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden flex shadow-xs">
      {/* 1. Left: Conversation Sidebar (Full on mobile if view is 'list', else 340px) */}
      <ConversationSidebar
        rooms={rooms}
        selectedRoomId={selectedRoom?._id || null}
        onSelectRoom={handleSelectRoom}
        className={`${
          mobileView === "list" ? "w-full lg:w-80 xl:w-88" : "hidden lg:flex lg:w-80 xl:w-88"
        }`}
      />

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
            <MessageFeed
              room={selectedRoom}
              messages={messages}
              currentUserId={currentUserId}
              searchQuery={searchQuery}
              onAddReaction={handleAddReaction}
            />

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
            <h3 className="text-lg font-bold text-[#101828]">Select a conversation</h3>
            <p className="text-xs sm:text-sm text-[#667085] max-w-sm mt-1">
              Choose a study group, course batch, or faculty advisor from the list on the left to start collaborating.
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
