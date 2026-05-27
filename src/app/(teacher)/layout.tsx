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
import { Layout, Menu } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface TeacherLayoutProps {
  children: ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
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
                key: "dashboard",
                icon: <DashboardIcon />,
                label: "Dashboard",
                onClick: () => router.push("/teacher/dashboard"),
              },
              {
                key: "courses",
                icon: <CourseIcon />,
                label: "Courses",
                onClick: () => router.push("/teacher/courses"),
              },
              {
                key: "students",
                icon: <StudentIcon />,
                label: "Students",
                onClick: () => router.push("/teacher/students"),
              },
              {
                key: "live-classes",
                icon: <LiveIcon />,
                label: "Live Classes",
                onClick: () => router.push("/teacher/live-classes"),
              },
              {
                key: "schedule",
                icon: <ScheduleIcon />,
                label: "My Schedule",
                onClick: () => router.push("/teacher/schedule"),
              },
              {
                key: "assignments",
                icon: <AssignmentIcon />,
                label: "Assignments",
                onClick: () => router.push("/teacher/assignments"),
              },
              {
                key: "quizzes",
                icon: <QuizIcon />,
                label: "Quizzes",
                onClick: () => router.push("/teacher/quizzes"),
              },
              {
                key: "settings",
                icon: <SettingIcon />,
                label: "Settings",
                onClick: () => router.push("/teacher/settings"),
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

export default TeacherLayout;
