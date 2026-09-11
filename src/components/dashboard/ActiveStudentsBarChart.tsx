"use client";
import React from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { UserOutlined } from "@ant-design/icons";

interface ActiveStudentsBarChartProps {
  rolePrefix?: string;
}

const studentsMonthlyData = [
  { month: "Apr 24", students: 120 },
  { month: "May 24", students: 210 },
  { month: "Jun 24", students: 75 },
  { month: "Jul 24", students: 260 },
  { month: "Aug 24", students: 180 },
  { month: "Sep 24", students: 90 },
  { month: "Oct 24", students: 175 },
  { month: "Nov 24", students: 210 },
  { month: "Dec 24", students: 95 },
  { month: "Jan 25", students: 200 },
  { month: "Feb 25", students: 85 },
  { month: "Mar 25", students: 240 },
];

const CustomBarTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#101827] border border-slate-700/80 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-1 z-50">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3B66FF]" />
          <span className="text-xs font-bold text-white">
            {Number(payload[0].value).toLocaleString()} Active Students
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const ActiveStudentsBarChart: React.FC<ActiveStudentsBarChartProps> = ({
  rolePrefix = "",
}) => {
  const studentsUrl = rolePrefix ? `${rolePrefix}/students` : "/students";

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#E4E7EC] shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <UserOutlined className="text-lg" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-[#101828] tracking-tight">
              Active Students
            </h2>
            <p className="text-xs text-[#667085]">
              Students actively learning in your courses
            </p>
          </div>
        </div>

        <Link
          href={studentsUrl}
          className="text-xs font-bold text-[#315CFF] hover:underline flex items-center gap-1"
        >
          View All
        </Link>
      </div>

      {/* Bar Chart Canvas */}
      <div className="w-full h-[240px] sm:h-[280px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={studentsMonthlyData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#315CFF" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F2F4F7"
              opacity={1}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: "#98A2B3" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: "#98A2B3" }}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar
              dataKey="students"
              fill="url(#barGradient)"
              radius={[6, 6, 2, 2]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActiveStudentsBarChart;
