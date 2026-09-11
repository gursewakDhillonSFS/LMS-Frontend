"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getDashboardStatsApi,
  getAllCoursesApi,
  getAnnouncementsByInstructorApi,
} from "@/services/collections";
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
import RecentActivityFeed, {
  ActivityItem,
} from "@/components/dashboard/RecentActivityFeed";

const TeacherDashboard: React.FC = () => {
  const { theme, toggleTheme } = useDashboardTheme();
  const userData = useSelector((state: RootState) => state?.userdata);
  const fullName =
    userData?.full_name ||
    (userData?.first_name ? `${userData.first_name} ${userData.last_name || ""}` : "Teacher");

  const [stats, setStats] = useState<DashboardKpiStats>({
    courseCount: 4,
    studentCount: 84,
    upcomingLiveClasses: 1,
    pendingAssignmentsToGrade: 8,
  });

  const [realCourses, setRealCourses] = useState<CourseItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 1. Fetch KPI stats
    (async () => {
      try {
        const res = await getDashboardStatsApi();
        if (res?.status && res.data) {
          setStats({
            courseCount: res.data.courseCount ?? 4,
            studentCount: res.data.studentCount ?? 84,
            upcomingLiveClasses: res.data.upcomingLiveClasses ?? 1,
            pendingAssignmentsToGrade: res.data.pendingAssignmentsToGrade ?? 8,
          });
        }
      } catch (err) {
        console.warn("Failed to load teacher stats:", err);
      }
    })();

    // 2. Fetch Assigned Courses
    (async () => {
      try {
        const param = new URLSearchParams();
        param.append("page", "1");
        param.append("size", "4");
        const res = await getAllCoursesApi(param);
        const courseData = res?.data?.courses || res?.data || [];
        if (Array.isArray(courseData) && courseData.length > 0) {
          const tags = ["Assigned", "Active", "Trending", "Upcoming"];
          const tagColors = [
            "bg-[#3B66FF] text-white",
            "bg-[#10B981] text-white",
            "bg-[#8B5CF6] text-white",
            "bg-slate-700 text-white",
          ];

          const mapped: CourseItem[] = courseData.slice(0, 4).map((c: any, index: number) => ({
            id: String(c.course_id || c._id || index),
            title: c.course_name || "Assigned Course",
            tag: tags[index % tags.length],
            tagColor: tagColors[index % tagColors.length],
            thumbnail:
              c.course_image_url ||
              "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
            instructorName: fullName,
            instructorAvatar: userData?.profile_img || undefined,
            studentsCount: `${c.student_count || (index + 1) * 24} students`,
            rating: c.rating ? Number(c.rating) : 4.8,
            price: c.course_price,
          }));
          setRealCourses(mapped);
        }
      } catch (err) {
        console.warn("Failed to fetch teacher courses:", err);
      }
    })();

    // 3. Fetch announcements for recent activity feed
    (async () => {
      try {
        const param = new URLSearchParams();
        param.append("page", "1");
        param.append("limit", "4");
        const res = await getAnnouncementsByInstructorApi(param);
        if (res?.status && Array.isArray(res?.data?.announcements)) {
          const acts: ActivityItem[] = res.data.announcements.map((a: any, idx: number) => ({
            id: a._id || `act-${idx}`,
            type: "student_enrolled",
            title: a.title || "Course Announcement",
            detail: a.courseName || "General Course Update",
            timeAgo: "Recently",
          }));
          if (acts.length > 0) setActivities(acts);
        }
      } catch (err) {
        console.warn("Failed to fetch announcements:", err);
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
      <DashboardKpiCards stats={stats} rolePrefix="/teacher" />

      {/* 3. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        {/* Left Column (Wider: ~68% width on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          {/* Revenue Overview (Interactive Area Chart) */}
          <RevenueOverviewChart />

          {/* Active Students (Bar Chart) */}
          <ActiveStudentsBarChart rolePrefix="/teacher" />

          {/* Top Courses */}
          <TopCoursesShowcase
            courses={realCourses}
            instructorName={fullName}
            rolePrefix="/teacher"
          />
        </div>

        {/* Right Column (Sidebar: ~32% width on desktop) */}
        <div className="lg:col-span-1 flex flex-col gap-6 w-full">
          {/* Quick Actions */}
          <QuickActionsCard rolePrefix="/teacher" />

          {/* Recent Activity */}
          <RecentActivityFeed activities={activities} rolePrefix="/teacher" />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
