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

interface PublicLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<PublicLayoutProps> = ({ children }) => {
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
    <Layout className="!min-h-screen !bg-[var(--bg)]">
      <div className="bg-white border-r border-[var(--border)]">
        <Sider
          trigger={null}
          width={240}
          collapsible
          collapsed={collapsed}
          breakpoint="xl"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          className="!sticky !top-0 !max-h-screen scrollbar-hide !overflow-y-auto !bg-white"
          style={{ background: "#FFFFFF" }}
        >
          <div
            onClick={() => setCollapsed((prev) => !prev)}
            className="bg-white cursor-pointer flex items-center justify-center py-[16px] px-[16px] border-b border-[var(--border)] sticky top-0 z-50"
          >
            {collapsed ? (
              <HeaderSmallLogo />
            ) : (
              <HeaderLogoIcon textColor="var(--text-primary)" />
            )}
          </div>
          <Menu
            prefixCls="custom-sidebar-menu"
            className="!bg-white !pt-[12px] !px-[8px] !flex !flex-col !items-stretch"
            theme="dark"
            mode="inline"
            selectedKeys={[activeTab]}
            items={[
              {
                key: "instructor-panel",
                icon: <DashboardIcon />,
                label: "Dashboard",
                onClick: () => router.push("/instructor-panel"),
              },
              {
                key: "courses",
                icon: <CourseIcon />,
                label: "Courses",
                onClick: () => router.push("/courses"),
              },
              {
                key: "teachers",
                icon: <TeacherIcon />,
                label: "Teachers",
                onClick: () => router.push("/teachers"),
              },
              {
                key: "students",
                icon: <StudentIcon />,
                label: "Students",
                onClick: () => router.push("/students"),
              },
              {
                key: "live-classes",
                icon: <LiveIcon />,
                label: "Live Classes",
                onClick: () => router.push("/live-classes"),
              },
              {
                key: "schedule",
                icon: <ScheduleIcon />,
                label: "My Schedule",
                onClick: () => router.push("/schedule"),
              },
              {
                key: "assignments",
                icon: <AssignmentIcon />,
                label: "Assignments",
                onClick: () => router.push("/assignments"),
              },
              {
                key: "quizzes",
                icon: <QuizIcon />,
                label: "Quizzes",
                onClick: () => router.push("/quizzes"),
              },
              {
                key: "announcements",
                icon: <EarPhoneIcon />,
                label: "Announcement",
                onClick: () => router.push("/announcements"),
              },
              {
                key: "settings",
                icon: <SettingIcon />,
                label: "Settings",
                onClick: () => router.push("/settings"),
              },
            ]}
          />
        </Sider>
      </div>
      <Layout className="!bg-[var(--bg)]">
        <Header className="!p-0 !flex !bg-white !sticky !top-0 !z-50 !h-[64px] !border-b !border-[var(--border)]" style={{ lineHeight: 'normal' }}>
          <InstructorHeader />
        </Header>
        <Content className="!p-4 lg:!p-6 !overflow-y-auto">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
