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
    <Layout className="!min-h-screen">
      <div className={`bg-navcolor lg:px-[12px] `}>
        <Sider
          trigger={null}
          width={200}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          className="!sticky !top-0"
        >
          <div
            onClick={() => setCollapsed((prev) => !prev)}
            className="bg-navcolor cursor-pointer flex items-center justify-center py-[10px] border-b-1 border-[#818B9A] border-dashed !pb-[20px]"
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
      <Layout>
        <Header className="!p-0 !flex !bg-white !sticky !top-0 !z-50">
          <UserHeader />
        </Header>
        <Content className="!p-2 lg:!p-4">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
