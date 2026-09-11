"use client";
import InstructorHeader from "@/components/InstructorHeader";
import { resetCreateCourse } from "@/redux/slices/CreateCourseSlice";
import { resetInstructorCourseTab } from "@/redux/tabslice/InstructorCourseTabSlice";
import { resetInstructorStudentTab } from "@/redux/tabslice/InstructorStudentTabSlice";
import { RoutePaths } from "@/utils/enums";
import {
  AssignmentIcon,
  CourseIcon,
  DashboardIcon,
  HeaderLogoIcon,
  HeaderSmallLogo,
  LiveIcon,
  QuizIcon,
  ScheduleIcon,
  SettingIcon,
  StudentIcon,
} from "@/utils/icons";
import { NotificationOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "@/context/I18nContext";

import { DashboardThemeProvider } from "@/context/DashboardThemeContext";
import SidebarPromoCard from "@/components/dashboard/SidebarPromoCard";

interface TeacherLayoutProps {
  children: ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const menuKeys = [
      "dashboard",
      "courses",
      "students",
      "live-classes",
      "schedule",
      "assignments",
      "quizzes",
      "announcements",
      "earnings",
      "settings",
    ];

    if (pathname) {
      // Match the sub-segment, handling the prepended '/teacher'
      const matchedKey = menuKeys.find((key) => pathname.includes(`/teacher/${key}`));
      if (matchedKey) {
        setActiveTab(matchedKey);
      } else if (pathname === "/teacher/dashboard") {
        setActiveTab("dashboard");
      }
      
      if (pathname !== `${RoutePaths.TeacherCourses}/create-course`) {
        dispatch(resetCreateCourse());
      }
      if (!pathname.includes(`${RoutePaths?.TeacherCourses}/course-details`)) {
        dispatch(resetInstructorCourseTab());
      }
      if (!pathname.includes(`${RoutePaths?.TeacherStudents}/student-details`)) {
        dispatch(resetInstructorStudentTab());
      }
    }
  }, [pathname, dispatch]);

  return (
    <DashboardThemeProvider>
      <Layout className="!min-h-screen !bg-[var(--dash-bg)] transition-colors duration-200">
        <div className="bg-[var(--dash-sidebar-bg)] border-r border-[var(--dash-sidebar-border)] transition-colors duration-200">
          <Sider
            trigger={null}
            width={240}
            collapsible
            collapsed={collapsed}
            breakpoint="xl"
            onBreakpoint={(broken) => {
              setCollapsed(broken);
            }}
            className="!sticky !top-0 !max-h-screen scrollbar-hide !overflow-y-auto !bg-[var(--dash-sidebar-bg)] transition-colors duration-200"
            style={{ background: "var(--dash-sidebar-bg)" }}
          >
            <div
              onClick={() => setCollapsed((prev) => !prev)}
              className="bg-white cursor-pointer flex items-center justify-center h-[64px] min-h-[64px] max-h-[64px] px-[16px] border-b border-[#E4E7EC] sticky top-0 z-50 transition-colors"
            >
              {collapsed ? (
                <HeaderSmallLogo />
              ) : (
                <HeaderLogoIcon height="36" textColor="#0B192C" />
              )}
            </div>
            <Menu
              prefixCls="custom-sidebar-menu"
              className="!bg-transparent !pt-[12px] !px-[8px] !flex !flex-col !items-stretch"
              theme="dark"
              mode="inline"
              selectedKeys={[activeTab]}
              items={[
                {
                  key: "dashboard",
                  icon: <DashboardIcon />,
                  label: t("dashboard.tabs.dashboard", { defaultValue: "Dashboard" }),
                  onClick: () => router.push("/teacher/dashboard"),
                },
                {
                  key: "courses",
                  icon: <CourseIcon />,
                  label: t("dashboard.tabs.courses", { defaultValue: "Courses" }),
                  onClick: () => router.push("/teacher/courses"),
                },
                {
                  key: "students",
                  icon: <StudentIcon />,
                  label: t("dashboard.tabs.students", { defaultValue: "Students" }),
                  onClick: () => router.push("/teacher/students"),
                },
                {
                  key: "live-classes",
                  icon: <LiveIcon />,
                  label: t("dashboard.tabs.liveClasses", { defaultValue: "Live Classes" }),
                  onClick: () => router.push("/teacher/live-classes"),
                },
                {
                  key: "schedule",
                  icon: <ScheduleIcon />,
                  label: t("dashboard.tabs.mySchedule", { defaultValue: "My Schedule" }),
                  onClick: () => router.push("/teacher/schedule"),
                },
                {
                  key: "assignments",
                  icon: <AssignmentIcon />,
                  label: t("dashboard.tabs.assignments", { defaultValue: "Assignments" }),
                  onClick: () => router.push("/teacher/assignments"),
                },
                {
                  key: "quizzes",
                  icon: <QuizIcon />,
                  label: t("dashboard.tabs.quizzes", { defaultValue: "Quizzes" }),
                  onClick: () => router.push("/teacher/quizzes"),
                },
                {
                  key: "announcements",
                  icon: <NotificationOutlined style={{ fontSize: "20px" }} />,
                  label: t("dashboard.tabs.announcements", { defaultValue: "Announcements" }),
                  onClick: () => router.push("/teacher/announcements"),
                },
                {
                  key: "earnings",
                  icon: <DollarCircleOutlined style={{ fontSize: "20px" }} />,
                  label: "Earnings",
                  onClick: () => router.push("/teacher/earnings"),
                },
                {
                  key: "settings",
                  icon: <SettingIcon />,
                  label: t("dashboard.tabs.settings", { defaultValue: "Settings" }),
                  onClick: () => router.push("/teacher/settings"),
                },
              ]}
            />

            {/* Bottom Promo Card */}
            <SidebarPromoCard
              collapsed={collapsed}
              createCoursePath={`${RoutePaths.TeacherCourses}/create-course`}
            />
          </Sider>
        </div>
        <Layout className="!bg-[var(--dash-bg)] transition-colors duration-200">
          <Header
            className="!p-0 !flex !bg-[var(--dash-header-bg)] !sticky !top-0 !z-50 !h-[64px] !border-b !border-[var(--dash-header-border)] transition-colors duration-200"
            style={{ lineHeight: "normal" }}
          >
            <InstructorHeader />
          </Header>
          <Content className="!p-4 lg:!p-6 !overflow-y-auto">{children}</Content>
        </Layout>
      </Layout>
    </DashboardThemeProvider>
  );
};

export default TeacherLayout;
