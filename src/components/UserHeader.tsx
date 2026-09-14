"use client";
import React, { useState } from "react";
import {
  ChatIcon,
  EarPhoneIcon,
  GlobeIcon,
  NotificationIcon,
} from "@/utils/icons";
import { Avatar, Badge, Drawer } from "antd";
import NotificationPanel from "./NotificationPanel";
import AnnouncementPanel from "./AnnouncementPanel";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetUnreadCount } from "@/redux/slices/AnnouncementSlice";
import { markAnnouncementsAsReadApi } from "@/services/collections";
import { RootState } from "@/redux/store";
import { useTranslation } from "@/context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemePicker from "./ThemePicker";

const UserHeader = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const route = useRouter();
  const dispatch = useDispatch();

  const full_name = useSelector(
    (state: RootState) => state.userdata?.full_name
  );
  const unreadAnnouncementCount = useSelector(
    (state: RootState) => state.announcement?.unreadCount || 0
  );
  const role = useSelector((state: RootState) => state.userdata?.role_name);
  const profile_img = useSelector(
    (state: RootState) => state.userdata?.profile_img
  );

  const [notificationDrawer, setNotificationDrawer] = useState(false);
  const [announcementDrawer, setAnnouncementDrawer] = useState(false);

  const getSectionTitle = () => {
    if (pathname.includes("/my-courses")) {
      return t("dashboard.tabs.myCourses", { defaultValue: "My Courses" });
    }
    if (pathname.includes("/my-explore")) {
      return t("dashboard.tabs.exploreCourses", { defaultValue: "Explore Courses" });
    }
    if (pathname.includes("/my-schedule")) {
      return t("dashboard.tabs.mySchedule", { defaultValue: "My Schedule" });
    }
    if (pathname.includes("/saved-courses")) {
      return t("dashboard.tabs.savedCourses", { defaultValue: "Saved Courses" });
    }
    if (pathname.includes("/my-certificate")) {
      return t("dashboard.tabs.myCertificate", { defaultValue: "Certificates" });
    }
    if (pathname.includes("/my-settings")) {
      return t("dashboard.tabs.settings", { defaultValue: "Settings" });
    }
    if (pathname.includes("/chat")) {
      return "Messages";
    }
    if (pathname.includes("/checkout")) {
      return "Checkout";
    }
    return t("dashboard.tabs.dashboard", { defaultValue: "Dashboard" });
  };

  return (
    <div className="w-full h-full flex items-center justify-between px-[16px] lg:px-[24px] box-border">

      {notificationDrawer && (
        <Drawer
          width={490}
          placement="right"
          prefixCls="drawer-style"
          closable={false}
          onClose={() => setNotificationDrawer(false)}
          open={notificationDrawer}
        >
          <NotificationPanel onClose={() => setNotificationDrawer(false)} />
        </Drawer>
      )}
      {announcementDrawer && (
        <Drawer
          width={490}
          placement="right"
          prefixCls="drawer-style"
          closable={false}
          onClose={() => setAnnouncementDrawer(false)}
          open={announcementDrawer}
        >
          <AnnouncementPanel onClose={() => setAnnouncementDrawer(false)} />
        </Drawer>
      )}

      {/* Left: Dynamic Section Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg lg:text-xl font-bold text-[#101828] tracking-tight m-0 leading-none">
          {getSectionTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-[8px] lg:gap-[12px]">
        <button
          onClick={() => {
            setAnnouncementDrawer(true);
            if (unreadAnnouncementCount > 0) {
              dispatch(resetUnreadCount());
              markAnnouncementsAsReadApi().catch(console.error);
            }
          }}
          className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[var(--surface-subtle)] transition-all duration-[150ms]"
        >
          <Badge
            count={unreadAnnouncementCount}
            overflowCount={99}
            size="small"
            offset={[-2, 2]}
          >
            <EarPhoneIcon />
          </Badge>
        </button>
        <button
          onClick={() => setNotificationDrawer(true)}
          className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[var(--surface-subtle)] transition-all duration-[150ms]"
        >
          <NotificationIcon />
        </button>
        <button
          onClick={() => route.push("/chat")}
          className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[var(--surface-subtle)] transition-all duration-[150ms]"
        >
          <ChatIcon />
        </button>

        <ThemePicker variant="header" />
        <LanguageSwitcher variant="header" />
        <div className="w-[1px] h-[24px] bg-[var(--border)]"></div>
        <button
          onClick={() => route.push("/my-settings")}
          className="flex items-center p-[4px] pr-[12px] gap-[8px] h-[40px] rounded-[10px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] cursor-pointer border border-transparent hover:border-[var(--border)] transition-all duration-[150ms]"
          title={t("dashboard.tabs.settings", { defaultValue: "Settings" })}
        >
          <Avatar
            key={profile_img || "avatar"}
            size={32}
            src={
              profile_img || "https://ui-avatars.com/api/?name=" + full_name
            }
            className="!flex-shrink-0"
          />
          <div className="hidden sm:flex flex-col items-start justify-center">
            <div className="text-[13px] font-[500] whitespace-nowrap text-[var(--text-primary)] leading-[140%]">
              {full_name}
            </div>
            <div className="capitalize text-[10px] font-[500] text-[var(--primary)] leading-[14px]">
              {role}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserHeader;
