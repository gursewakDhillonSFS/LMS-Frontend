"use client";
import InstructorHeader from "@/components/InstructorHeader";
import { resetCreateCourse } from "@/redux/slices/CreateCourseSlice";
import { resetAnnouncementTab } from "@/redux/tabslice/AnnouncementTabSlice";
import { resetInstructorCourseTab } from "@/redux/tabslice/InstructorCourseTabSlice";
import { resetInstructorStudentTab } from "@/redux/tabslice/InstructorStudentTabSlice";
import { RoutePaths } from "@/utils/enums";
import {
  AssignmentIcon,
  CourseIcon,
  DashboardIcon,
  EarPhoneIcon,
  HeaderLogoIcon,
  HeaderSmallLogo,
  LiveIcon,
  QuizIcon,
  ScheduleIcon,
  SettingIcon,
  StudentIcon,
  TeacherIcon,
} from "@/utils/icons";
import { Layout, Menu } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "@/context/I18nContext";
import { DashboardThemeProvider } from "@/context/DashboardThemeContext";
import SidebarPromoCard from "@/components/dashboard/SidebarPromoCard";

interface PublicLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const menuKeys = [
      "instructor-panel",
      "courses",
      "teachers",
      "students",
      "live-classes",
      "schedule",
      "assignments",
      "quizzes",
      "announcements",
      "settings",
    ];

    if (pathname) {
      const matchedKey = menuKeys.find((key) => pathname.includes(key));
      if (matchedKey) {
        setActiveTab(matchedKey);
      }
      if (pathname !== `${RoutePaths.Courses}/create-course`) {
        dispatch(resetCreateCourse());
      }
      if (pathname !== `${RoutePaths.Announcements}`) {
        dispatch(resetAnnouncementTab());
      }
      if (!pathname.includes(`${RoutePaths?.Courses}/course-details`)) {
        dispatch(resetInstructorCourseTab());
      }
      if (!pathname.includes(`${RoutePaths?.Students}/student-details`)) {
        dispatch(resetInstructorStudentTab());
      }
    }
  }, [pathname]);

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
              className="bg-[var(--dash-sidebar-bg)] cursor-pointer flex items-center justify-center py-[16px] px-[16px] border-b border-[var(--dash-sidebar-border)] sticky top-0 z-50 transition-colors"
            >
              {collapsed ? (
                <HeaderSmallLogo />
              ) : (
                <HeaderLogoIcon textColor="#0B192C" />
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
                  key: "instructor-panel",
                  icon: <DashboardIcon />,
                  label: t("dashboard.tabs.dashboard", { defaultValue: "Dashboard" }),
                  onClick: () => router.push("/instructor-panel"),
                },
                {
                  key: "courses",
                  icon: <CourseIcon />,
                  label: t("dashboard.tabs.courses", { defaultValue: "Courses" }),
                  onClick: () => router.push("/courses"),
                },
                {
                  key: "teachers",
                  icon: <TeacherIcon />,
                  label: t("dashboard.tabs.teachers", { defaultValue: "Teachers" }),
                  onClick: () => router.push("/teachers"),
                },
                {
                  key: "students",
                  icon: <StudentIcon />,
                  label: t("dashboard.tabs.students", { defaultValue: "Students" }),
                  onClick: () => router.push("/students"),
                },
                {
                  key: "live-classes",
                  icon: <LiveIcon />,
                  label: t("dashboard.tabs.liveClasses", { defaultValue: "Live Classes" }),
                  onClick: () => router.push("/live-classes"),
                },
                {
                  key: "schedule",
                  icon: <ScheduleIcon />,
                  label: t("dashboard.tabs.mySchedule", { defaultValue: "My Schedule" }),
                  onClick: () => router.push("/schedule"),
                },
                {
                  key: "assignments",
                  icon: <AssignmentIcon />,
                  label: t("dashboard.tabs.assignments", { defaultValue: "Assignments" }),
                  onClick: () => router.push("/assignments"),
                },
                {
                  key: "quizzes",
                  icon: <QuizIcon />,
                  label: t("dashboard.tabs.quizzes", { defaultValue: "Quizzes" }),
                  onClick: () => router.push("/quizzes"),
                },
                {
                  key: "announcements",
                  icon: <EarPhoneIcon />,
                  label: t("dashboard.tabs.announcements", { defaultValue: "Announcement" }),
                  onClick: () => router.push("/announcements"),
                },
                {
                  key: "settings",
                  icon: <SettingIcon />,
                  label: t("dashboard.tabs.settings", { defaultValue: "Settings" }),
                  onClick: () => router.push("/settings"),
                },
              ]}
            />

            {/* Bottom Promo Card */}
            <SidebarPromoCard
              collapsed={collapsed}
              createCoursePath={`${RoutePaths.Courses}/create-course`}
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

export default UserLayout;
