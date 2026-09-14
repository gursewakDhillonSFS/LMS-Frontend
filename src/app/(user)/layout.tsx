"use client";
import UserHeader from "@/components/UserHeader";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import { resetInternalTab } from "@/redux/tabslice/UserCourseInternalSlice";
import { resetCourseTab } from "@/redux/tabslice/UserCourseTabSlice";
import { resetAllSlices } from "@/redux/resetSlice";
import { RoutePaths } from "@/utils/enums";
import {
  CertificationIcon,
  CourseIcon,
  DashboardIcon,
  ExploreIcon,
  HeaderLogoIcon,
  HeaderSmallLogo,
  HeartIcon,
  LogoutIcon,
  ScheduleIcon,
  SettingIcon,
} from "@/utils/icons";
import { Layout, Menu } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "@/context/I18nContext";
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
  const router = useRouter();
  const dispatch = useDispatch();

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
      "dashboard",
      "my-courses",
      "my-explore",
      "my-schedule",
      "my-certificate",
      "my-settings",
      "saved-courses",
    ];
    if (pathname) {
      const matchedKey = menuKeys.find((key) => pathname.includes(key));
      if (matchedKey) {
        setActiveTab(matchedKey);
      } else {
        setActiveTab("");
      }
      if (!pathname.includes(RoutePaths?.MyCourses)) {
        dispatch(resetCourseTab());
      }
      if (!pathname.includes(`${RoutePaths?.MyCourses}/course-details`)) {
        dispatch(resetInternalTab());
      }
    }
  }, [pathname, dispatch]);

  return (
    <Layout className="!min-h-screen !bg-[var(--bg)]">
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

      <div className="bg-white border-r border-[var(--border)] h-screen sticky top-0 flex flex-col">
        <Sider
          trigger={null}
          width={240}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          className="!sticky !top-0 !bg-white !h-full [&>.ant-layout-sider-children]:!flex [&>.ant-layout-sider-children]:!flex-col [&>.ant-layout-sider-children]:!justify-between [&>.ant-layout-sider-children]:!h-full"
          style={{ background: "#FFFFFF" }}
        >
          {/* Top Section: Logo & Navigation Menu */}
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-none">
            <div
              onClick={() => setCollapsed((prev) => !prev)}
              className="bg-white cursor-pointer flex items-center justify-center h-[64px] min-h-[64px] max-h-[64px] px-[16px] border-b border-[var(--border)] box-border sticky top-0 z-50 transition-colors"
            >
              {collapsed ? (
                <HeaderSmallLogo />
              ) : (
                <HeaderLogoIcon height="36" textColor="var(--text-primary)" />
              )}
            </div>
            <Menu
              prefixCls="custom-sidebar-menu"
              className="!bg-white !pt-[12px] !px-[8px] !flex !flex-col !items-stretch !border-none"
              theme="dark"
              mode="inline"
              selectedKeys={[activeTab]}
              items={[
                {
                  key: "dashboard",
                  icon: <DashboardIcon />,
                  label: t("dashboard.tabs.dashboard", { defaultValue: "Dashboard" }),
                  onClick: () => router.push("/dashboard"),
                },
                {
                  key: "my-courses",
                  icon: <CourseIcon />,
                  label: t("dashboard.tabs.myCourses", { defaultValue: "My Courses" }),
                  onClick: () => router.push("/my-courses"),
                },
                {
                  key: "saved-courses",
                  icon: <HeartIcon />,
                  label: t("common.nav.savedCourses", { defaultValue: "Saved Courses" }),
                  onClick: () => router.push("/saved-courses"),
                },
                {
                  key: "my-explore",
                  icon: <ExploreIcon />,
                  label: t("dashboard.tabs.explore", { defaultValue: "Explore" }),
                  onClick: () => router.push("/my-explore"),
                },
                {
                  key: "my-schedule",
                  icon: <ScheduleIcon />,
                  label: t("dashboard.tabs.mySchedule", { defaultValue: "Schedule" }),
                  onClick: () => router.push("/my-schedule"),
                },
                {
                  key: "my-certificate",
                  icon: <CertificationIcon />,
                  label: t("dashboard.tabs.certificate", { defaultValue: "Certificate" }),
                  onClick: () => router.push("/my-certificate"),
                },
                {
                  key: "my-settings",
                  icon: <SettingIcon />,
                  label: t("dashboard.tabs.settings", { defaultValue: "Settings" }),
                  onClick: () => router.push("/my-settings"),
                },
              ]}
            />
          </div>

          {/* Bottom Section: Dedicated Logout Button */}
          <div className="p-3 border-t border-[var(--border)] bg-white shrink-0">
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
      <Layout className="!bg-[var(--bg)]">
        <Header className="!p-0 !flex !bg-white !sticky !top-0 !z-50 !h-[64px] !border-b !border-[var(--border)]" style={{ lineHeight: 'normal' }}>
          <UserHeader />
        </Header>
        <Content className="!p-3 lg:!p-6">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout;

