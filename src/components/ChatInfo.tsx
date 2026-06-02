"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CardImage } from "@/utils/images";
import { ChatInfoIcon } from "@/utils/icons";
import { SearchOutlined } from "@ant-design/icons";
import TabSwitcher from "./TabSwitcher";
import { ChatTabEnum } from "@/utils/enums";
import { ChatTabOptions } from "@/utils/constant";
import { Switch } from "antd";

interface ContactCardProps {
  isGroup: boolean;
  isInstructor?: boolean;
}

const ChatInfo: React.FC<ContactCardProps> = ({
  isGroup,
  isInstructor = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>(ChatTabEnum?.MEMBERS);
  const [switchOn, setSwitchOn] = useState(false);
  return (
    <div className="bg-white rounded-2xl pb-4 flex flex-col gap-3 w-full">
      <h1 className="text-lg font-bold text-black p-4 bg-white sticky top-0">
        Contact Detail
      </h1>

      <div className="flex flex-col items-center justify-between text-center gap-2">
        <Image
          src={CardImage}
          alt="contact"
          width={100}
          height={100}
          className="rounded-full object-cover !min-w-[100px] !min-h-[100px]"
        />
        <p className="text-[18px] font-[700]">
          {isGroup ? "AI Class Group" : "Courtney Henry"}
        </p>

        {isInstructor && (
          <div>
            <TabSwitcher
              tabs={ChatTabOptions}
              activeKey={activeTab}
              onChange={setActiveTab}
              className="!bg-[#F7F7F7]"
              minWidth="120px"
            />
          </div>
        )}

        {activeTab === ChatTabEnum?.MEMBERS &&
          (isGroup ? (
            <div className="flex flex-col gap-2 items-start w-full px-2">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm font-[600] text-[#111111]">20 Members</p>
                {isInstructor && (
                  <div
                    className="rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: "rgba(120, 120, 128, 0.12)" }}
                  >
                    <SearchOutlined />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 w-full overflow-auto">
                {[
                  "Leslie Alexander",
                  "Robert Fox",
                  "Jenny Wilson",
                  "Theresa Webb",
                  "Floyd Miles",
                  "Marvin McKinney",
                  "Cody Fisher",
                ].map((name, index) => (
                  <div
                    key={index}
                    className="flex justify-between cursor-pointer items-center border-b border-[#C8C8C8] py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={CardImage}
                        alt="contact"
                        width={32}
                        height={32}
                        className="rounded-full object-cover !min-w-[32px] !min-h-[32px]"
                      />
                      <div className="flex flex-col items-start">
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-gray-400">Student</p>
                      </div>
                    </div>
                    <ChatInfoIcon />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-[#0E0E0E]">
                willie.jennings@example.com
              </p>
              <p className="text-xs text-secondary">(Organization name)</p>
              <p className="text-xs text-gray-400">AI Developer</p>
            </div>
          ))}

        {activeTab === ChatTabEnum?.SETTINGS && (
          <div className="flex flex-col gap-1 items-start px-4">
            <h1 className="text-[14px] font-[500] leading-[150%]">
              Teachers-Only Messaging
            </h1>
            <div className="flex justify-between items-center text-start">
              <p className="text-[12px] font-[400] leading-[140%] text-[#7E7E7E]">
                Enable this to allow only teachers and admins to post in the
                chat.
              </p>
              <Switch
                value={switchOn}
                onChange={() => setSwitchOn((prev) => !prev)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInfo;
