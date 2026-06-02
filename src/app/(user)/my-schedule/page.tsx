"use client";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import React from "react";

const MySchedule = () => {
  return (
    <div className="flex flex-col gap-[24px] w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-[700] leading-[120%]">My Schedule</h1>
      </div>

      <ScheduleCalendar />
    </div>
  );
};

export default MySchedule;
