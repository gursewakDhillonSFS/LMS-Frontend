"use client";
import CommonButton from "@/components/CommonButton";
import LiveClassCard from "@/components/LiveClassCard";
import ScheduleLiveClassModal from "@/components/modal/ScheduleLiveClassModal";
import TabSwitcher from "@/components/TabSwitcher";
import { classTabOptions } from "@/utils/constant";
import { ClassTabEnum } from "@/utils/enums";
import {
  CalendarIcon,
  CalendarIcon2,
  ClockWheelIcon,
  FilterIcon,
} from "@/utils/icons";
import { Live } from "@/utils/images";
import { LiveClass, RecordedClass } from "@/utils/interface";
import { Badge, DatePicker } from "antd";
import Image from "next/image";
import React, { useState } from "react";

const liveClasses: LiveClass[] = [
  {
    id: "1",
    topic: "Create Machine Learning Models in Microsoft Azure (Live Class)",
    startTime: "17:50",
    isLive: true,
    joinLink: "https://example.com/live-class/machine-learning",
  },
  {
    id: "2",
    topic: "UPSC Science Class Live Lesson(Batch 2)",
    date: "Today",
    startTime: "18:00",
    endTime: "18:45",
    isLive: false,
  },
];

const recordedClasses: RecordedClass[] = [
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
];

const TeacherLiveClasses = () => {
  const [activeTab, setActiveTab] = useState<string>(ClassTabEnum.UPCOMING);
  const [open, setOpen] = useState<boolean>(false);
  
  return (
    <div className="flex flex-col gap-3">
      <ScheduleLiveClassModal open={open} onClose={() => setOpen(false)} />
      <h1 className="text-[32px] font-bold">Live Classes</h1>
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
        <TabSwitcher
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={classTabOptions}
        />

        <div className="flex items-center gap-3">
          <DatePicker.RangePicker
            prefixCls="ant-rangepicker"
            allowClear={false}
            format={"YYYY-MM-DD"}
            prefix={<CalendarIcon2 color="var(--secondary)" />}
            suffixIcon={null}
          />
          <Badge count={2} prefixCls="filterBadge">
            <CommonButton
              text={"Filter"}
              icon={<FilterIcon />}
              className="!bg-white !flex-row-reverse"
            />
          </Badge>
          <CommonButton
            onClick={() => setOpen(true)}
            text="Schedule Live Class"
            className="!bg-secondary text-white"
          />
        </div>
      </div>

      {activeTab === ClassTabEnum.UPCOMING && (
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

                  {item?.isLive ? (
                    <span className="text-[14px] font-[500] text-[#9A9A9A] leading-[150%] flex gap-1 items-center">
                      <ClockWheelIcon /> Start at: {item?.startTime}
                    </span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-[500] text-[#9A9A9A] leading-[150%] flex gap-1 items-center">
                        <CalendarIcon /> {item?.date}
                      </span>
                      <span className="text-[14px] font-[500] text-[#9A9A9A] leading-[150%] flex gap-1 items-center">
                        <ClockWheelIcon /> {item?.startTime} - {item?.endTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!item?.isLive && (
                <CommonButton
                  text={"Start Now"}
                  className="!bg-[#FB4A49] text-white"
                  onClick={() => {
                    if (item?.joinLink) window.open(item.joinLink, "_blank");
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {activeTab === ClassTabEnum.PAST && (
        <div className="grid grid-cols-2 lg:grid-cols-4 items-center">
          {recordedClasses?.map((item) => (
            <LiveClassCard isLive={false} key={item?.id} data={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherLiveClasses;
