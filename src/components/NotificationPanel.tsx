import React from "react";
import Image from "next/image";
import { CloseOutlined } from "@ant-design/icons";
import CommonLink from "./CommonLink";

const notifications = {
  new: [
    {
      course: "Finance & Quantitative Modeling for Analysts Course",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
      course: "Finance & Quantitative Modeling for Analysts Course",
      message: "Assignments due in",
      type: "12 hrs",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
  ],
  today: [
    {
      course: "Finance & Quantitative Modeling for Analysts Course",
      message: "Add the Quiz result",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    {
      course: "Finance & Quantitative Modeling for Analysts Course",
      message: "Add the Quiz result",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
  ],
  all: [
    {
      course: "Finance & Quantitative Modeling for Analysts",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Assignments due in",
      type: "12 hrs",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Assignments due in",
      type: "12 hrs",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    {
      course: "Data Analytics Course",
      message: "Start the",
      type: "Live Class",
      time: "5 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
  ],
};

type NotificationData = {
  course: string;
  avatar: string;
  message: string;
  type?: string;
  time: string;
};

const NotificationCard: React.FC<{ data: NotificationData }> = ({ data }) => (
  <div className="flex items-center gap-2 w-full">
    <div className="relative min-w-10">
      <Image
        unoptimized
        width={40}
        height={40}
        src={data.avatar}
        alt={data.course}
        className="!w-[40px] !h-[40px] rounded-full"
      />
      <div className="absolute top-0 bg-blue-500 rounded-full w-2 h-2"></div>
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm">
        <span className="font-[600]">{data.course}</span>{" "}
        <span>
          {data.message}{" "}
          {data.type && (
            <CommonLink text={`"${data.type}"`} className="text-[#FB4A49]" />
          )}
        </span>
      </p>
      <p className="text-xs text-[#8A8A8A] ">{data.time}</p>
    </div>
  </div>
);

export interface NotificationProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationProps> = ({ onClose }) => {
  const sections = Object.entries(notifications);

  return (
    <div>
      <div className="flex justify-between items-center bg-[#F3F6FC] px-[24px] pt-[24px] pb-[10px]">
        <h2 className="text-lg text-[#0E0E0E] font-bold">Notification</h2>
        <button
          onClick={onClose}
          className="cursor-pointer text-red-500 hover:text-red-700"
        >
          <CloseOutlined />
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-80px)] px-[24px] py-3 scrollbar-hide">
        {sections.map(([section, items], index) => (
          <div key={section} className="flex flex-col gap-3">
            <p className="text-sm font-bold text-[#0E0E0E] capitalize">
              {section === "all"
                ? "All Notification"
                : section === "new"
                ? "New"
                : section}
            </p>

            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <NotificationCard key={idx} data={item} />
              ))}
            </div>

            {/* Show border below section unless it's the last one */}
            {index < sections.length - 1 && <div className="border-b my-4" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
