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
    <Layout className="!min-h-screen">
      <div className={`bg-navcolor lg:px-[16px] `}>
        <Sider
          trigger={null}
          width={200}
          collapsible
          collapsed={collapsed}
          breakpoint="xl"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          className="!sticky !top-0 !max-h-screen scrollbar-hide !overflow-y-auto"
        >
          <div
            onClick={() => setCollapsed((prev) => !prev)}
            className="bg-navcolor cursor-pointer flex items-center justify-center py-[10px] border-b-1 border-[#818B9A] border-dashed !pb-[20px] sticky top-0 z-50"
          >
            {collapsed ? (
              <HeaderSmallLogo />
            ) : (
              <HeaderLogoIcon textColor="white" />
            )}
          </div>
          <Menu
            prefixCls="custom-sidebar-menu"
            className="!bg-navcolor !pt-[15px] !flex !flex-col !items-center lg:gap-[10px]"
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
      <Layout>
        <Header className="!p-0 !flex !bg-white !sticky !top-0 !z-50">
          <InstructorHeader />
        </Header>
        <Content className="!p-4 !overflow-y-auto">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
