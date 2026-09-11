"use client";
import React, { useState } from "react";
import {
  AreaChart,
  Area,
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
import { DollarOutlined } from "@ant-design/icons";

type TimeRange = "7D" | "30D" | "3M" | "6M" | "1Y";

const timeRangeData: Record<
  TimeRange,
  Array<{ name: string; coursePrices: number; learningPro: number }>
> = {
  "7D": [
    { name: "Mon", coursePrices: 420, learningPro: 580 },
    { name: "Tue", coursePrices: 680, learningPro: 820 },
    { name: "Wed", coursePrices: 540, learningPro: 710 },
    { name: "Thu", coursePrices: 890, learningPro: 1100 },
    { name: "Fri", coursePrices: 1200, learningPro: 1450 },
    { name: "Sat", coursePrices: 950, learningPro: 1300 },
    { name: "Sun", coursePrices: 1150, learningPro: 1600 },
  ],
  "30D": [
    { name: "Jun 24", coursePrices: 1250, learningPro: 1420 },
    { name: "Jul 24", coursePrices: 1400, learningPro: 1680 },
    { name: "Aug 24", coursePrices: 950, learningPro: 1200 },
    { name: "Sep 24", coursePrices: 1300, learningPro: 1580 },
    { name: "Oct 24", coursePrices: 1950, learningPro: 2320 },
    { name: "Nov 24", coursePrices: 1700, learningPro: 2050 },
    { name: "Dec 24", coursePrices: 1450, learningPro: 1800 },
    { name: "Jan 25", coursePrices: 2850, learningPro: 3348 },
    { name: "Feb 25", coursePrices: 1350, learningPro: 1650 },
    { name: "Mar 25", coursePrices: 1400, learningPro: 1700 },
    { name: "Apr 25", coursePrices: 1100, learningPro: 1450 },
    { name: "May 25", coursePrices: 1950, learningPro: 2450 },
  ],
  "3M": [
    { name: "Mar 25", coursePrices: 1400, learningPro: 1700 },
    { name: "Apr 25", coursePrices: 1100, learningPro: 1450 },
    { name: "May 25", coursePrices: 1950, learningPro: 2450 },
  ],
  "6M": [
    { name: "Dec 24", coursePrices: 1450, learningPro: 1800 },
    { name: "Jan 25", coursePrices: 2850, learningPro: 3348 },
    { name: "Feb 25", coursePrices: 1350, learningPro: 1650 },
    { name: "Mar 25", coursePrices: 1400, learningPro: 1700 },
    { name: "Apr 25", coursePrices: 1100, learningPro: 1450 },
    { name: "May 25", coursePrices: 1950, learningPro: 2450 },
  ],
  "1Y": [
    { name: "Q1 24", coursePrices: 3400, learningPro: 4200 },
    { name: "Q2 24", coursePrices: 4200, learningPro: 5100 },
    { name: "Q3 24", coursePrices: 4800, learningPro: 5900 },
    { name: "Q4 24", coursePrices: 6100, learningPro: 7800 },
    { name: "Q1 25", coursePrices: 5600, learningPro: 6700 },
    { name: "Q2 25", coursePrices: 6800, learningPro: 8400 },
  ],
};

const CustomChartTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#101827] border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-1.5 min-w-[170px] z-50">
        <span className="text-xs font-semibold text-slate-400 border-b border-slate-800 pb-1">
          {label}
        </span>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 capitalize">
                {item.name === "learningPro" ? "Learning + Pro" : "Course Prices"}
              </span>
            </div>
            <span className="font-bold text-white">
              ${(item.value as number).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueOverviewChart: React.FC = () => {
  const [range, setRange] = useState<TimeRange>("30D");
  const data = timeRangeData[range];

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-[var(--dash-surface-card)] border border-[var(--dash-border)] shadow-xs w-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B66FF]/10 text-[#3B66FF] border border-[#3B66FF]/20 flex items-center justify-center shrink-0">
            <DollarOutlined className="text-lg" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-[var(--dash-text-primary)] tracking-tight">
              Revenue Overview
            </h2>
            <p className="text-xs text-[var(--dash-text-muted)]">
              Monthly revenue from courses and learning + pro
            </p>
          </div>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--dash-surface-subtle)] border border-[var(--dash-border)] self-start sm:self-auto">
          {(["7D", "30D", "3M", "6M", "1Y"] as TimeRange[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRange(tab)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                range === tab
                  ? "bg-[#3B66FF] text-white shadow-xs"
                  : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Indicators */}
      <div className="flex items-center justify-end gap-5 text-xs font-medium text-[var(--dash-text-secondary)] pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B66FF]" />
          <span>Course Prices</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          <span>Learning + Pro</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[280px] sm:h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCoursePrices" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B66FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B66FF" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorLearningPro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--dash-border)"
              opacity={0.6}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: "var(--dash-text-muted)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: "var(--dash-text-muted)" }}
              tickFormatter={(val) => `$${val.toLocaleString()}`}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Area
              type="monotone"
              dataKey="learningPro"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorLearningPro)"
            />
            <Area
              type="monotone"
              dataKey="coursePrices"
              stroke="#3B66FF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorCoursePrices)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueOverviewChart;
