"use client";

import React from "react";
import ChatContainer from "@/modules/chat/ChatContainer";

export default function UserChatPage() {
  return (
    <div className="w-full">
      <ChatContainer role="student" />
    </div>
  );
}
