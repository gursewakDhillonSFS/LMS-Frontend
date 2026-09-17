"use client";

import React, { useState, useRef } from "react";
import {
  SendOutlined,
  SmileOutlined,
  PaperClipOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { Popover, Tooltip } from "antd";
import { toast } from "@/utils/toast";

interface MessageComposerProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const COMMON_EMOJIS = [
  "👍", "❤️", "🔥", "💡", "🙌", "🎉", "👏", "🚀",
  "📚", "✍️", "💻", "🎓", "⭐", "✅", "👀", "💯",
  "😄", "🤔", "🙋‍♂️", "🙋‍♀️", "👌", "✨", "📌", "🏆",
];

const SUGGESTION_CHIPS = [
  "👋 Hi everyone!",
  "❓ Question about today's topic",
  "📚 Can someone share the lecture slides?",
  "✅ Assignment submitted!",
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message... (Shift + Enter for new line)",
}) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-grow height up to 120px
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleFileClick = () => {
    toast.info("Attachment support: select any study note, code snippet, or PDF");
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Attached "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      setText((prev) => prev + (prev ? " " : "") + `[Attachment: ${file.name}]`);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-[#E4E7EC] shrink-0 space-y-2.5">
      {/* Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
        {SUGGESTION_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setText(chip);
              textareaRef.current?.focus();
            }}
            className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#F2F4F7] text-[11px] font-medium text-[#475467] hover:text-[#101828] border border-[#E4E7EC] whitespace-nowrap cursor-pointer transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box Bar */}
      <div className="relative rounded-2xl border border-[#D0D5DD] focus-within:border-[#315CFF] focus-within:ring-2 focus-within:ring-[#315CFF]/15 transition-all bg-white p-2 flex flex-col gap-2">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{ outline: "none", boxShadow: "none", border: "none" }}
          className="w-full resize-none max-h-32 text-xs sm:text-sm text-[#101828] placeholder-[#98A2B3] border-0 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 shadow-none px-2 pt-1 leading-relaxed bg-transparent"
        />

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between pt-1 border-t border-[#F2F4F7]">
          {/* Left: Attachments & Emojis */}
          <div className="flex items-center gap-1">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            <Tooltip title="Attach Study Material / File">
              <button
                type="button"
                onClick={handleFileClick}
                className="p-2 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] text-sm cursor-pointer transition-colors"
              >
                <PaperClipOutlined />
              </button>
            </Tooltip>

            <Tooltip title="Attach Screenshot / Image">
              <button
                type="button"
                onClick={handleFileClick}
                className="p-2 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] text-sm cursor-pointer transition-colors"
              >
                <PictureOutlined />
              </button>
            </Tooltip>

            {/* Emoji Picker Popover */}
            <Popover
              open={showEmojiPicker}
              onOpenChange={setShowEmojiPicker}
              trigger="click"
              placement="topLeft"
              content={
                <div className="w-56 p-2 grid grid-cols-6 gap-1.5 text-lg">
                  {COMMON_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => addEmoji(e)}
                      className="w-8 h-8 rounded-lg hover:bg-[#F2F4F7] flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              }
            >
              <button
                type="button"
                className="p-2 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] text-sm cursor-pointer transition-colors"
              >
                <SmileOutlined />
              </button>
            </Popover>
          </div>

          {/* Right: Hint + Send Button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] text-[#98A2B3] select-none">
              Press <kbd className="px-1 py-0.5 rounded bg-[#F2F4F7] text-[#475467] font-mono text-[10px]">Enter ↵</kbd> to send
            </span>

            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className="px-4 py-2 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] disabled:bg-[#E4E7EC] text-white disabled:text-[#98A2B3] text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <SendOutlined className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;
