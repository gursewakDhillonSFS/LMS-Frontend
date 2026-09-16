"use client";
import InstructorHeader from "@/components/InstructorHeader";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import { resetCreateCourse } from "@/redux/slices/CreateCourseSlice";
import { resetAnnouncementTab } from "@/redux/tabslice/AnnouncementTabSlice";
import { resetInstructorCourseTab } from "@/redux/tabslice/InstructorCourseTabSlice";
import { resetInstructorStudentTab } from "@/redux/tabslice/InstructorStudentTabSlice";
import { resetAllSlices } from "@/redux/resetSlice";
import { RoutePaths } from "@/utils/enums";
import {
  AssignmentIcon,
  CourseIcon,
  DashboardIcon,
  EarPhoneIcon,
  HeaderLogoIcon,
  HeaderSmallLogo,
  LiveIcon,
  LogoutIcon,
  QuizIcon,
  ScheduleIcon,
  SettingIcon,
  StudentIcon,
  TeacherIcon,
  EarningsNavIcon,
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
import Cookies from "js-cookie";

interface PublicLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [logoutModal, setLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    setLogoutLoading(true);
    try {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("role_name", { path: "/" });
      Cookies.remove("user_onboarding", { path: "/" });
      Cookies.remove("instructor_onboarding", { path: "/" });
      Cookies.remove("profileStatus", { path: "/" });
      dispatch(resetAllSlices());
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error(error);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

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
      "earnings",
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
        {logoutModal && (
          <ConfirmationModal
            open={logoutModal}
            onCancel={() => setLogoutModal(false)}
            onSubmit={handleLogout}
            title={t("common.modals.logoutTitle", { defaultValue: "Logout" })}
            description={t("common.modals.logoutConfirm", {
              defaultValue: "Are you sure you want to logout this account?",
            })}
            cancelText={t("common.actions.no", { defaultValue: "Cancel" })}
            submitText={t("common.modals.logoutConfirmBtn", { defaultValue: "Yes, Logout" })}
            iconBG="#FB4A49"
            icon={<LogoutIcon color="#FB4A49" />}
            loading={logoutLoading}
          />
        )}

        <div className="bg-[var(--dash-sidebar-bg)] border-r border-[var(--dash-sidebar-border)] h-screen sticky top-0 flex flex-col transition-colors duration-200">
          <Sider
            trigger={null}
            width={240}
            collapsible
            collapsed={collapsed}
            breakpoint="xl"
            onBreakpoint={(broken) => {
              setCollapsed(broken);
            }}
            className="!sticky !top-0 !bg-[var(--dash-sidebar-bg)] !h-full [&>.ant-layout-sider-children]:!flex [&>.ant-layout-sider-children]:!flex-col [&>.ant-layout-sider-children]:!justify-between [&>.ant-layout-sider-children]:!h-full transition-colors duration-200"
            style={{ background: "var(--dash-sidebar-bg)" }}
          >
            {/* Top Section: Logo, Navigation Menu, Promo Card */}
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-hide">
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
                    key: "earnings",
                    icon: <EarningsNavIcon />,
                    label: "Earnings",
                    onClick: () => router.push("/earnings"),
                  },
                  {
                    key: "settings",
                    icon: <SettingIcon />,
                    label: t("dashboard.tabs.settings", { defaultValue: "Settings" }),
                    onClick: () => router.push("/settings"),
                  },
                ]}
              />

              {/* Promo Card */}
              <SidebarPromoCard
                collapsed={collapsed}
                createCoursePath={`${RoutePaths.Courses}/create-course`}
              />
            </div>

            {/* Bottom Section: Dedicated Logout Button */}
            <div className="p-3 border-t border-[var(--dash-sidebar-border)] bg-[var(--dash-sidebar-bg)] shrink-0 transition-colors duration-200 mt-auto">
              <button
                type="button"
                onClick={() => setLogoutModal(true)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium text-sm cursor-pointer group ${
                  collapsed ? "justify-center !px-0" : ""
                }`}
                title={t("common.nav.logout", { defaultValue: "Logout" })}
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0 text-red-500 group-hover:scale-110 transition-transform">
                  <LogoutIcon color="#EF4444" />
                </span>
                {!collapsed && (
                  <span className="truncate text-xs font-semibold">
                    {t("common.nav.logout", { defaultValue: "Logout" })}
                  </span>
                )}
              </button>
            </div>
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
