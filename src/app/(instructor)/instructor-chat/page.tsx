"use client";

import React from "react";
import ChatContainer from "@/modules/chat/ChatContainer";

export default function InstructorChatPage() {
  return (
    <div className="w-full">
      <ChatContainer role="instructor" />
    </div>
  );
}
