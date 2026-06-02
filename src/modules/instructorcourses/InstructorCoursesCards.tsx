"use client";
import React from "react";
import UserAvatarDisplay from "../../components/UserAvatarDisplay";
import { RequestedDemoProp } from "@/utils/interface";
import { Select } from "antd"; 

export const RequestedDemoCard: React.FC<{ data: RequestedDemoProp }> = ({
  data,
}) => {
  return (
    <div className="bg-white grid grid-cols-2 lg:grid-cols-4 gap-2 p-4 rounded-md">
      <div>
        <p className="text-[#7B7B7B] text-xs">Student</p>
        <UserAvatarDisplay textClass="font-medium" user={data.student} />
      </div>
      <div>
        <p className="text-[#7B7B7B] text-xs">Course</p>
        <div className="text-sm font-medium flex h-8 items-center">
          {data.course}
        </div>
      </div>
      <div>
        <p className="text-[#7B7B7B] text-xs">Time Slot</p>
        <div className="text-sm font-medium flex h-8 items-center">
          {data.timeSlot}
        </div>
      </div>
      <div>
        <p className="text-[#7B7B7B] text-xs">Assign To</p>
        <Select
          placeholder="Select Teacher"
          className="min-w-[200px]"
          options={[
            { label: "abc", key: "abc" },
            { label: "cba", key: "cba" },
          ]}
        />
      </div>
    </div>
  );
};
