"use client";
import React, { useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  TooltipProps,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

interface Custom3DBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: {
    [key: string]: string;
  };
}

interface RenderCenteredLabelProps {
  cx: number;
  cy: number;
  active?: boolean;
}
const revenueData = [
  { month: "Jun 24", revenue: 1500 },
  { month: "Jul 24", revenue: 1800 },
  { month: "Aug 24", revenue: 1200 },
  { month: "Sep 24", revenue: 1600 },
  { month: "Oct 24", revenue: 2300 },
  { month: "Nov 24", revenue: 2000 },
  { month: "Dec 24", revenue: 1700 },
  { month: "Jan 25", revenue: 3348 },
  { month: "Feb 25", revenue: 1600 },
  { month: "Mar 25", revenue: 1550 },
  { month: "Apr 25", revenue: 1300 },
  { month: "May 25", revenue: 2200 },
];

const revenueTypeData = [
  { name: "Course Prices", value: 30 },
  { name: "Learning + Pro", value: 70 },
];

const studentsData = [
  { month: "Apr, 24", students: 120 },
  { month: "May, 24", students: 210 },
  { month: "Jun, 24", students: 75 },
  { month: "Jul, 24", students: 260 },
  { month: "Aug, 24", students: 180 },
  { month: "Sep, 24", students: 90 },
  { month: "Oct, 24", students: 175 },
  { month: "Nov, 24", students: 210 },
  { month: "Dec, 24", students: 95 },
  { month: "Jan, 25", students: 200 },
  { month: "Feb, 25", students: 85 },
  { month: "Mar, 25", students: 240 },
];

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-medium">{`${label}`}</p>
        <p className="text-sm">{`$${(
          payload[0].value as number
        ).toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};
const CustomTooltipBarChart: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-medium">{`${label}`}</p>
        <p className="text-sm">{`Student ${(
          payload[0].value as number
        ).toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};
const Custom3DBar: React.FC<Custom3DBarProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
}) => {
  if (!payload || height <= 0) return null;

  const depth = 16;
  const topOffset = 8;

  return (
    <g>
      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - topOffset} ${
          x + width + depth
        },${y + height - topOffset} ${x + width},${y + height}`}
        fill="#5A9BD4"
        stroke="none"
      />
      <polygon
        points={`${x},${y} ${x + depth},${y - topOffset} ${x + width + depth},${
          y - topOffset
        } ${x + width},${y}`}
        fill="#B7DFFF"
        stroke="none"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="url(#studentGradient)"
        stroke="none"
      />
    </g>
  );
};

const InstructorStatistics = () => {
  const COLORS = ["var(--primary)", "var(--secondary)"];
  const [activeSegment, setActiveSegment] = useState(revenueTypeData[1]);

  const RenderCenteredLabel = ({
    cx,
    cy,
  }: RenderCenteredLabelProps): React.ReactElement => {
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} dy={-10} fill="#374151" fontSize={14} fontWeight={500}>
          {activeSegment?.name}
        </tspan>
        <tspan x={cx} dy={25} fill="#111827" fontSize={18} fontWeight={700}>
          {activeSegment?.value}%
        </tspan>
      </text>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <div className="bg-white p-4 rounded-xl col-span-2 flex flex-col gap-[12px]">
          <CommonHeader title={"Revenue by Month"} />
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={revenueData}
              margin={{ top: 10, right: 30, bottom: 10 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={20}
                padding={{ left: 10 }}
                tick={{ fontSize: 12, fill: "#1C1C1C" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 12, fill: "#7B7B7B" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00D991"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={{ fill: "#00D991", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  fill: "#00D991",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl md:col-span-2 lg:col-span-1">
          <CommonHeader title={"Revenue Type"} />
          <div className="relative flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  label={RenderCenteredLabel}
                  data={revenueTypeData}
                  dataKey="value"
                  labelLine={{ stroke: "transparent" }}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                  animationDuration={300}
                >
                  {revenueTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      onMouseEnter={() => setActiveSegment(entry)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* <div className="absolute text-center">
              <p className="text-[16px] text-[#9A9A9A] plus-jakarta-sans">
                Learning + Pro
              </p>
              <h3 className="text-[32px] font-bold plus-jakarta-sans">70%</h3>
            </div> */}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm text-[#9A9A9A]">Course Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-sm text-[#9A9A9A]">Learning + Pro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl flex flex-col gap-[12px]">
        <CommonHeader title={"Active Students"} />
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={studentsData} margin={{ right: 30, bottom: 5 }}>
            <defs>
              <linearGradient
                id="studentGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#B7DFFF" />
                <stop offset="50%" stopColor="#A1CAFF" />
                <stop offset="100%" stopColor="#72B4FF" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F3F3F3" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={20}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Tooltip content={<CustomTooltipBarChart />} />
            <Bar
              dataKey="students"
              shape={<Custom3DBar />}
              // fill="url(#studentGradient)"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CommonHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex flex-col items-start border-b border-[#E5E5EF] h-[64px]">
      <h3 className="text-[18px] text-[#767676] leading-[120%]">Statistics</h3>
      <h2 className="text-[20px] font-bold text-[#0C0925]">{title}</h2>
    </div>
  );
};

export default InstructorStatistics;
