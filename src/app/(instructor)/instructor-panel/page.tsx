"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getDashboardStatsApi, getAllCoursesApi } from "@/services/collections";
import { useDashboardTheme } from "@/context/DashboardThemeContext";
import DashboardWelcomeBanner from "@/components/dashboard/DashboardWelcomeBanner";
import DashboardKpiCards, {
  DashboardKpiStats,
} from "@/components/dashboard/DashboardKpiCards";
import RevenueOverviewChart from "@/components/dashboard/RevenueOverviewChart";
import ActiveStudentsBarChart from "@/components/dashboard/ActiveStudentsBarChart";
import TopCoursesShowcase, {
  CourseItem,
} from "@/components/dashboard/TopCoursesShowcase";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";

const InstructorPanel: React.FC = () => {
  const { theme, toggleTheme } = useDashboardTheme();
  const userData = useSelector((state: RootState) => state?.userdata);
  const fullName =
    userData?.full_name ||
    (userData?.first_name ? `${userData.first_name} ${userData.last_name || ""}` : "Instructor");

  const [stats, setStats] = useState<DashboardKpiStats>({
    courseCount: 0,
    studentCount: 0,
    upcomingLiveClasses: 0,
    pendingAssignmentsToGrade: 0,
  });

  const [realCourses, setRealCourses] = useState<CourseItem[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 1. Fetch KPI stats
    (async () => {
      try {
        const res = await getDashboardStatsApi();
        if (res?.status && res.data) {
          setStats({
            courseCount: res.data.courseCount ?? 0,
            studentCount: res.data.studentCount ?? 0,
            upcomingLiveClasses: res.data.upcomingLiveClasses ?? 0,
            pendingAssignmentsToGrade: res.data.pendingAssignmentsToGrade ?? 0,
          });
        }
      } catch (err) {
        console.warn("Failed to load dashboard stats:", err);
      }
    })();

    // 2. Fetch Top Courses
    (async () => {
      try {
        const param = new URLSearchParams();
        param.append("page", "1");
        param.append("size", "4");
        const res = await getAllCoursesApi(param);
        const courseData = res?.data?.courses || res?.data || [];
        if (Array.isArray(courseData) && courseData.length > 0) {
          const tags = ["Most Enrolled", "Highest Rating", "Trending", "New"];
          const tagColors = [
            "bg-[#3B66FF] text-white",
            "bg-[#8B5CF6] text-white",
            "bg-[#10B981] text-white",
            "bg-slate-700 text-white",
          ];

          const mapped: CourseItem[] = courseData.slice(0, 4).map((c: any, index: number) => ({
            id: String(c.course_id || c._id || index),
            title: c.course_name || "Untitled Course",
            tag: tags[index % tags.length],
            tagColor: tagColors[index % tagColors.length],
            thumbnail:
              c.course_image_url ||
              "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
            instructorName: fullName,
            instructorAvatar: userData?.profile_img || undefined,
            studentsCount: `${c.student_count || c.enrolled_count || (index + 1) * 120} students`,
            rating: c.rating ? Number(c.rating) : 4.8 - index * 0.1,
            price: c.course_price,
          }));
          setRealCourses(mapped);
        }
      } catch (err) {
        console.warn("Failed to fetch courses for dashboard:", err);
      }
    })();
  }, [fullName, userData?.profile_img]);

  return (
    <div className="flex flex-col gap-6 pb-12 w-full max-w-[1600px] mx-auto animate-fadeIn">
      {/* 1. Header Greeting & Controls */}
      <DashboardWelcomeBanner
        userName={fullName}
        theme={theme}
        onToggleTheme={toggleTheme}
        dateRangeLabel="Last 30 days"
      />

      {/* 2. Top 4 Primary KPI Cards */}
      <DashboardKpiCards stats={stats} />

      {/* 3. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        {/* Left Column (Wider: ~68% width on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          {/* Revenue Overview (Interactive Area Chart) */}
          <RevenueOverviewChart />

          {/* Active Students (Bar Chart) */}
          <ActiveStudentsBarChart />

          {/* Top Performing Courses */}
          <TopCoursesShowcase
            courses={realCourses}
            instructorName={fullName}
          />
        </div>

        {/* Right Column (Sidebar: ~32% width on desktop) */}
        <div className="lg:col-span-1 flex flex-col gap-6 w-full">
          {/* Quick Actions */}
          <QuickActionsCard />

          {/* Recent Activity */}
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default InstructorPanel;
