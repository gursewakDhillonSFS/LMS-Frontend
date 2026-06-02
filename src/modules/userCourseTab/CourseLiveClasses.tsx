import CommonButton from "@/components/CommonButton";
import CommonLink from "@/components/CommonLink";
import LiveClassCard from "@/components/LiveClassCard";
import { ClockWheelIcon } from "@/utils/icons";
import { Live } from "@/utils/images";
import { LiveClass, RecordedClass } from "@/utils/interface";
import Image from "next/image";
import React from "react";

export const liveClasses: LiveClass[] = [
  {
    id: "1",
    topic: "UI Design Basics",
    startTime: "17:50",
    isLive: true,
    joinLink: "https://example.com/live-class/ui-design",
  },
  {
    id: "2",
    topic: "React Fundamentals",
    startTime: "18:00",
    endTime: "18:45",
    isLive: false,
  },
  {
    id: "3",
    topic: "TypeScript Deep Dive",
    startTime: "19:00",
    endTime: "19:45",
    isLive: false,
  },
];

export const recordedClasses: RecordedClass[] = [
  {
    id: "2",
    topic: "Introduction to AI & Robotics",
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    isLive: true,
    streamedDate: "Streamed 8 days ago",
    duration: "01:50:32",
    watchLink: "https://example.com/watch/2",
    downloadLink: "https://example.com/download/2",
  },
  {
    id: "3",
    topic: "Human & Machine Interaction",
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    isLive: true,
    streamedDate: "Streamed 8 days ago",
    duration: "01:50:32",
    watchLink: "https://example.com/watch/3",
    downloadLink: "https://example.com/download/3",
  },
  {
    id: "4",
    topic: "Fundamentals of UX Design",
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    isLive: false,
    streamedDate: "Streamed 10 days ago",
    duration: "01:30:15",
    watchLink: "https://example.com/watch/4",
    downloadLink: "https://example.com/download/4",
  },
];

const CourseLiveClasses = () => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Live Classes</h1>
        <div className="flex flex-col gap-[12px] items-center">
          {liveClasses?.map((item) => (
            <div
              key={item?.id}
              className={`flex items-center justify-between w-full p-[12px] rounded-[12px] ${
                item?.isLive ? "bg-[#FFDEE6]" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-[12px]">
                <Image alt="live" src={Live} />
                <div>
                  <h1 className="text-[18px] font-[600] leading-[120%]">
                    {item?.topic}
                  </h1>
                  <span className="text-[14px] font-[500] text-[#9A9A9A] leading-[150%] flex gap-1 items-center">
                    <ClockWheelIcon /> Start at: {item?.startTime}
                  </span>
                </div>
              </div>
              {item?.isLive && (
                <CommonButton
                  text={"Join Live Class"}
                  className="!bg-[#FB4A49] text-white"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-[700] text-[24px] text-[#0E0E0E]">
            Classes Library
          </h1>
          <CommonLink text={"Explore More"} />
        </div>
        <div className="grid grid-cols-3 gap-[12px] items-center">
          {recordedClasses?.map((item) => (
            <LiveClassCard key={item?.id} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseLiveClasses;
