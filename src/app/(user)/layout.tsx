"use client";
import UserHeader from "@/components/UserHeader";
import { resetInternalTab } from "@/redux/tabslice/UserCourseInternalSlice";
import { resetCourseTab } from "@/redux/tabslice/UserCourseTabSlice";
import { RoutePaths } from "@/utils/enums";
import {
  CertificationIcon,
  CourseIcon,
  DashboardIcon,
  ExploreIcon,
  HeaderLogoIcon,
  HeaderSmallLogo,
  HeartIcon,
  ScheduleIcon,
  SettingIcon,
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
  const router = useRouter();
  const dispatch = useDispatch();

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
      <div className="bg-white border-r border-[var(--border)]">
        <Sider
          trigger={null}
          width={240}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          className="!sticky !top-0 !bg-white !max-h-screen"
          style={{ background: "#FFFFFF" }}
        >
          <div
            onClick={() => setCollapsed((prev) => !prev)}
            className="bg-white cursor-pointer flex items-center justify-center py-[16px] px-[16px] border-b border-[var(--border)]"
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
                key: "dashboard",
                icon: <DashboardIcon />,
                label: "Dashboard",
                onClick: () => router.push("/dashboard"),
              },
              {
                key: "my-courses",
                icon: <CourseIcon />,
                label: "My Courses",
                onClick: () => router.push("/my-courses"),
              },
              {
                key: "saved-courses",
                icon: <HeartIcon />,
                label: "Saved Courses",
                onClick: () => router.push("/saved-courses"),
              },
              {
                key: "my-explore",
                icon: <ExploreIcon />,
                label: "Explore",
                onClick: () => router.push("/my-explore"),
              },
              {
                key: "my-schedule",
                icon: <ScheduleIcon />,
                label: "Schedule",
                onClick: () => router.push("/my-schedule"),
              },
              {
                key: "my-certificate",
                icon: <CertificationIcon />,
                label: "Certificate",
                onClick: () => router.push("/my-certificate"),
              },
              {
                key: "my-settings",
                icon: <SettingIcon />,
                label: "Settings",
                onClick: () => router.push("/my-settings"),
              },
            ]}
          />
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
