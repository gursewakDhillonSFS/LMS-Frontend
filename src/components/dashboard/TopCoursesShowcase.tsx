"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrophyOutlined,
  UserOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";

export interface CourseItem {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  thumbnail: string;
  instructorName: string;
  instructorAvatar?: string;
  studentsCount: string;
  rating: number;
  price?: number | string;
}

interface TopCoursesShowcaseProps {
  courses?: CourseItem[];
  instructorName?: string;
  rolePrefix?: string;
}

const defaultShowcaseCourses: CourseItem[] = [
  {
    id: "course-1",
    title: "Node.js & Express Backend Engineering",
    tag: "Most Enrolled",
    tagColor: "bg-[#3B66FF] text-white",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    instructorName: "Gursewak Singh",
    studentsCount: "12.4k students",
    rating: 4.8,
  },
  {
    id: "course-2",
    title: "React 19 & Next.js Masterclass",
    tag: "Highest Rating",
    tagColor: "bg-[#8B5CF6] text-white",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    instructorName: "Gursewak Singh",
    studentsCount: "8.7k students",
    rating: 4.9,
  },
  {
    id: "course-3",
    title: "Advanced TypeScript Patterns",
    tag: "Trending",
    tagColor: "bg-[#10B981] text-white",
    thumbnail:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
    instructorName: "Gursewak Singh",
    studentsCount: "6.3k students",
    rating: 4.7,
  },
  {
    id: "course-4",
    title: "Next.js 14 App Router Deep Dive",
    tag: "New",
    tagColor: "bg-slate-700 text-white",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    instructorName: "Gursewak Singh",
    studentsCount: "4.1k students",
    rating: 4.6,
  },
];

const TopCoursesShowcase: React.FC<TopCoursesShowcaseProps> = ({
  courses,
  instructorName = "Instructor",
  rolePrefix = "",
}) => {
  const displayCourses = (courses && courses.length > 0
    ? courses
    : defaultShowcaseCourses
  ).map((c) => ({
    ...c,
    instructorName: c.instructorName || instructorName,
  }));

  const viewAllCoursesUrl = rolePrefix ? `${rolePrefix}/courses` : "/courses";

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#E4E7EC] shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#315CFF] border border-blue-100 flex items-center justify-center shrink-0">
            <TrophyOutlined className="text-lg" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-[#101828] tracking-tight">
              Top Performing Courses
            </h2>
            <p className="text-xs text-[#667085]">
              Based on enrollment and completion rate
            </p>
          </div>
        </div>

        <Link
          href={viewAllCoursesUrl}
          className="text-xs font-bold text-[#315CFF] hover:underline flex items-center gap-1"
        >
          View All Courses
        </Link>
      </div>

      {/* Responsive Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-1">
        {displayCourses.slice(0, 4).map((course, idx) => (
          <div
            key={course.id || idx}
            className="group flex flex-col rounded-xl overflow-hidden bg-white border border-[#E4E7EC] hover:border-[#D0D5DD] hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {/* Image & Badge Overlay */}
            <div className="relative w-full h-36 bg-slate-900 overflow-hidden">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Badge */}
              <span
                className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-xs ${course.tagColor}`}
              >
                {course.tag}
              </span>
            </div>

            {/* Content Body */}
            <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-[#101828] line-clamp-2 leading-snug group-hover:text-[#315CFF] transition-colors">
                {course.title}
              </h3>

              <div className="flex flex-col gap-2 pt-1 border-t border-[#F2F4F7]">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] shrink-0 font-bold overflow-hidden border border-[#E4E7EC]">
                    {course.instructorAvatar ? (
                      <Image
                        src={course.instructorAvatar}
                        alt={course.instructorName}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <UserOutlined />
                    )}
                  </div>
                  <span className="text-xs text-[#475467] font-medium truncate">
                    {course.instructorName}
                  </span>
                </div>

                {/* Footer: Students + Star Rating */}
                <div className="flex items-center justify-between text-xs text-[#667085] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <TeamOutlined className="text-xs text-[#667085]" />
                    <span>{course.studentsCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <StarFilled className="text-xs" />
                    <span className="text-[#101828] font-bold">
                      {course.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCoursesShowcase;
