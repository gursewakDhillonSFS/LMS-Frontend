"use client";

import { Dispatch, SetStateAction, useState, useMemo } from "react";
import Image from "next/image";
import { ChatConversation, MessageProp } from "@/utils/interface";
import SearchInput from "./SearchInput";
import { formattedTimeForChatList } from "@/utils/comman";
import { PlusOutlined } from "@ant-design/icons";

interface ChatListProps {
  isChat?: boolean;
  onSelect: (conv: ChatConversation) => void;
  mobile?: boolean;
  chat?: ChatConversation[];
  setMessages?: Dispatch<SetStateAction<MessageProp[]>> | undefined;
  setLastVisible?:
    | Dispatch<SetStateAction<MessageProp | null>>
    | null
    | undefined;
}

const ChatList: React.FC<ChatListProps> = ({
  isChat = false,
  onSelect,
  mobile = false,
  chat,
  setMessages,
  setLastVisible,
}) => {
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredChat = useMemo(() => {
    if (!chat) return [];
    if (!search.trim()) return chat;
    const q = search.toLowerCase();
    return chat.filter(
      (conv) =>
        (conv.names || conv.name || "").toLowerCase().includes(q) ||
        (conv.lastMessage?.message || "").toLowerCase().includes(q)
    );
  }, [chat, search]);

  return (
    <div
      className={`flex flex-col gap-3 bg-white rounded-[15px] p-2 ${
        mobile ? "h-full w-full" : "w-[270px] lg:w-full"
      }`}
    >
      <div className="sticky top-0 z-50 flex w-full gap-2">
        <SearchInput
          search={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!bg-[#F8FAFC] !border-[#E4E7EC] !rounded-xl"
        />
        {isChat && (
          <PlusOutlined className="!bg-[#315CFF] !text-white p-3 !cursor-pointer !rounded-[12px]" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredChat.map((conv) => (
          <div
            key={conv._id}
            onClick={() => {
              setActive(conv._id);
              onSelect(conv);
              if (setMessages) {
                setMessages([]);
              }
              if (setLastVisible) {
                setLastVisible(null as unknown as MessageProp);
              }
            }}
            className={`flex items-center p-3 rounded-xl cursor-pointer relative transition-all ${
              conv._id === active
                ? "bg-[#315CFF] text-white shadow-xs"
                : "hover:bg-[#F8FAFC] text-[#101828]"
            }`}
          >
            <div className="relative shrink-0">
              <Image
                src={conv?.avatar || "/fallback.png"}
                alt="Profile"
                width={40}
                unoptimized
                height={40}
                className="rounded-xl w-10 h-10 object-cover"
              />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p
                  className={`font-semibold text-sm truncate ${
                    conv._id === active ? "text-white" : "text-[#101828]"
                  }`}
                >
                  {conv.names || conv.name}
                </p>
                <span
                  className={`text-[11px] shrink-0 ml-1 ${
                    conv._id === active ? "text-white/80" : "text-[#98A2B3]"
                  }`}
                >
                  {conv?.lastMessage?.message_time?.seconds &&
                    formattedTimeForChatList(
                      conv?.lastMessage?.message_time?.seconds
                    )}
                </span>
              </div>
              <p
                className={`text-xs truncate ${
                  conv._id === active ? "text-white/80" : "text-[#667085]"
                }`}
              >
                {conv.lastMessage?.message_type === "text"
                  ? conv.lastMessage?.message
                  : conv.lastMessage?.message_type || "No messages yet"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
