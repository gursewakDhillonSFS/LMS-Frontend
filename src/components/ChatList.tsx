"use client";

import { Dispatch, SetStateAction, useState } from "react";
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

  console.log("chat", chat);

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
          className="!bg-[#F7F7F7]  !border-none "
        />
        {isChat && (
          <PlusOutlined className="!bg-secondary !text-white p-3 !cursor-pointer !rounded-[12px]" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {chat?.map((conv) => (
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
            className={`flex items-center p-3 rounded-[12px] cursor-pointer relative my-2 ${
              conv._id === active ? "bg-secondary" : "hover:bg-blue-50"
            }`}
          >
            <div className="relative">
              <Image
                src={conv?.avatar || "/fallback.png"}
                alt="Profile"
                width={40}
                unoptimized
                height={40}
                className="rounded-full w-10 h-10 object-cover"
              />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between">
                <p
                  className={`font-semibold text-sm ${
                    conv._id === active ? "text-white" : "text-black"
                  }`}
                >
                  {conv.names || conv.name}
                </p>
                <span
                  className={`text-xs ${
                    conv._id === active ? "text-white" : "text-gray-500"
                  }`}
                >
                  {conv?.lastMessage?.message_time?.seconds &&
                    formattedTimeForChatList(
                      conv?.lastMessage?.message_time?.seconds
                    )}
                </span>
              </div>
              <p
                className={`text-sm ${
                  conv._id === active ? "text-white" : "text-gray-500"
                } max-w-[160px] lg:max-w-[200px] truncate`}
              >
                {conv.lastMessage?.message_type == "text"
                  ? conv.lastMessage?.message
                  : conv.lastMessage?.message_type}
              </p>
            </div>
            {/* {conv.unread_count?.[currentUser?._id] ? (
              <span className="absolute right-4 top-8 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conv.unread_count?.[currentUser?._id]}
              </span>
            ) : (
              ""
            )} */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
