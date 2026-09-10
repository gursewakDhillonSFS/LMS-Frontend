"use client";
import CommonButton from "@/components/CommonButton";
import LiveClassCard from "@/components/LiveClassCard";
import ScheduleLiveClassModal from "@/components/modal/ScheduleLiveClassModal";
import TabSwitcher from "@/components/TabSwitcher";
import { createScheduleApi, getSchedulesApi } from "@/services/collections";
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
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "@/utils/toast";

const LiveClasses = () => {
  const [activeTab, setActiveTab] = useState<string>(ClassTabEnum.UPCOMING);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [recordedClasses, setRecordedClasses] = useState<RecordedClass[]>([]);

  const fetchLive = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const params = new URLSearchParams();
      params.append("month", String(now.getMonth() + 1));
      params.append("year", String(now.getFullYear()));
      const res = await getSchedulesApi(params);
      const events = res?.data?.schedules || res?.data || [];
      const list = Array.isArray(events) ? events : [];

      const withLink = list.filter(
        (e: { meetingLink?: string }) =>
          e.meetingLink && String(e.meetingLink).trim() !== "",
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming: LiveClass[] = [];
      const past: RecordedClass[] = [];

      for (const e of withLink as {
        _id?: string;
        schedule_id?: string;
        title?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
        meetingLink?: string;
      }[]) {
        const eventDate = e.date ? new Date(e.date) : null;
        const id = e._id || e.schedule_id || String(Math.random());
        const startTime = e.startTime || "00:00";
        const isPast = eventDate ? eventDate < today : false;
        const meetingLink = e.meetingLink || "";

        if (isPast) {
          past.push({
            id,
            topic: e.title || "Live Class",
            thumbnail:
              "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
            isLive: false,
            streamedDate: eventDate
              ? `Streamed ${eventDate.toLocaleDateString()}`
              : "Past session",
            duration: `${startTime}${e.endTime ? ` - ${e.endTime}` : ""}`,
            watchLink: meetingLink,
            downloadLink: meetingLink,
          });
        } else {
          upcoming.push({
            id,
            topic: e.title || "Live Class",
            date: eventDate ? eventDate.toLocaleDateString() : undefined,
            startTime,
            endTime: e.endTime,
            isLive: false,
            joinLink: meetingLink,
          });
        }
      }

      setLiveClasses(upcoming);
      setRecordedClasses(past);
    } catch {
      toast.warning("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive();
  }, [fetchLive]);

  return (
    <div className="flex flex-col gap-3">
      <ScheduleLiveClassModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async (payload) => {
          try {
            const res = await createScheduleApi(payload);
            if (res?.status) {
              toast.success("Live class scheduled");
              setOpen(false);
              fetchLive();
            } else {
              toast.warning(res?.message || "Failed to schedule");
            }
          } catch {
            toast.warning("Failed to schedule live class");
          }
        }}
      />
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
          <Badge count={0} prefixCls="filterBadge">
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
          {loading ? (
            <p className="text-slate-500 py-8">Loading...</p>
          ) : liveClasses.length === 0 ? (
            <p className="text-slate-500 py-8">
              No upcoming live classes with meeting links.
            </p>
          ) : (
            liveClasses.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between w-full p-[12px] rounded-[12px] ${
                  item.isLive ? "bg-[#FFDEE6]" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-[12px]">
                  <Image alt="live" src={Live} />
                  <div>
                    <h1 className="text-[18px] font-[600] leading-[120%]">
                      {item.topic}
                    </h1>

                    {item.isLive ? (
                      <span className="text-[14px] font-[500] text-[#9A9A9A] leading-[150%] flex gap-1 items-center">
                        <ClockWheelIcon /> Start at: {item.startTime}
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-[500] text-[#9A9A9A] leading-[150%] flex gap-1 items-center">
                          <CalendarIcon /> {item.date}
                        </span>
                        <span className="text-[14px] font-[500] text-[#9A9A9A] leading-[150%] flex gap-1 items-center">
                          <ClockWheelIcon /> {item.startTime}
                          {item.endTime ? ` - ${item.endTime}` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!item.isLive && (
                  <CommonButton
                    text={"Start Now"}
                    className="!bg-[#FB4A49] text-white"
                    onClick={() => {
                      if (item.joinLink) window.open(item.joinLink, "_blank");
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
      {activeTab === ClassTabEnum.PAST && (
        <div className="grid grid-cols-2 lg:grid-cols-4 items-center">
          {recordedClasses.length === 0 ? (
            <p className="text-slate-500 py-8 col-span-full">
              No past live classes yet.
            </p>
          ) : (
            recordedClasses.map((item) => (
              <LiveClassCard isLive={false} key={item.id} data={item} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
