"use client";
import React, { useState } from "react";
import {
  ChatIcon,
  GlobeIcon,
  NotificationIcon,
  EarPhoneIcon,
} from "@/utils/icons";
import { Avatar, Badge, Drawer } from "antd";
import NotificationPanel from "./NotificationPanel";
import AnnouncementPanel from "./AnnouncementPanel";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetUnreadCount } from "@/redux/slices/AnnouncementSlice";
import { markAnnouncementsAsReadApi } from "@/services/collections";
import { RootState } from "@/redux/store";
import { useTranslation } from "@/context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemePicker from "./ThemePicker";

const InstructorHeader = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
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

  const getSectionTitle = () => {
    if (!pathname) return t("dashboard.tabs.dashboard", { defaultValue: "Dashboard" });
    if (
      pathname.includes("/instructor-panel") ||
      pathname === "/teacher/dashboard" ||
      pathname === "/teacher"
    ) {
      return t("dashboard.tabs.dashboard", { defaultValue: "Dashboard" });
    }
    if (pathname.includes("/create-course")) {
      return t("dashboard.tabs.createCourse", { defaultValue: "Create Course" });
    }
    if (pathname.includes("/course-details") || pathname.includes("/course-detail")) {
      return t("dashboard.tabs.courseDetails", { defaultValue: "Course Details" });
    }
    if (pathname.includes("/courses")) {
      return t("dashboard.tabs.courses", { defaultValue: "Courses" });
    }
    if (pathname.includes("/teachers")) {
      return t("dashboard.tabs.teachers", { defaultValue: "Teachers" });
    }
    if (pathname.includes("/students")) {
      return t("dashboard.tabs.students", { defaultValue: "Students" });
    }
    if (pathname.includes("/live-classes")) {
      return t("dashboard.tabs.liveClasses", { defaultValue: "Live Classes" });
    }
    if (pathname.includes("/schedule")) {
      return t("dashboard.tabs.mySchedule", { defaultValue: "My Schedule" });
    }
    if (pathname.includes("/assignments")) {
      return t("dashboard.tabs.assignments", { defaultValue: "Assignments" });
    }
    if (pathname.includes("/quizzes")) {
      return t("dashboard.tabs.quizzes", { defaultValue: "Quizzes" });
    }
    if (pathname.includes("/announcements")) {
      return t("dashboard.tabs.announcements", { defaultValue: "Announcements" });
    }
    if (pathname.includes("/earnings")) {
      return "Earnings";
    }
    if (pathname.includes("/settings")) {
      return t("dashboard.tabs.settings", { defaultValue: "Settings" });
    }
    if (pathname.includes("/instructor-chat") || pathname.includes("/chat")) {
      return "Messages";
    }
    return t("dashboard.tabs.dashboard", { defaultValue: "Dashboard" });
  };

  const route = useRouter();
  const [notificationDrawer, setNotificationDrawer] = useState(false);
  const [announcementDrawer, setAnnouncementDrawer] = useState(false);
  const dispatch = useDispatch();

  return (
    <div className="w-full h-[64px] flex items-center justify-between px-[16px] lg:px-[24px]">
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
          className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center text-[#475467] hover:text-[#101828] hover:bg-[#F1F5F9] transition-all duration-[150ms] cursor-pointer"
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
          className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center text-[#475467] hover:text-[#101828] hover:bg-[#F1F5F9] transition-all duration-[150ms] cursor-pointer"
        >
          <NotificationIcon />
        </button>

        <button
          onClick={() => route.push("/instructor-chat")}
          className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center text-[#475467] hover:text-[#101828] hover:bg-[#F1F5F9] transition-all duration-[150ms] cursor-pointer"
        >
          <ChatIcon />
        </button>

        <ThemePicker variant="header" />
        <LanguageSwitcher variant="header" />

        <div className="w-[1px] h-[24px] bg-[#E4E7EC]"></div>

        <button
          onClick={() => {
            const settingsPath = pathname?.startsWith("/teacher")
              ? "/teacher/settings"
              : "/settings";
            route.push(settingsPath);
          }}
          className="flex items-center p-[4px] pr-[12px] gap-[8px] h-[40px] rounded-[10px] bg-white hover:bg-[#F8FAFC] border border-[#E4E7EC] cursor-pointer transition-all duration-[150ms]"
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
            <div className="text-[13px] font-[600] whitespace-nowrap text-[#101828] leading-[140%]">
              {full_name}
            </div>
            <div className="capitalize text-[10px] font-[600] text-[#315CFF] leading-[14px]">
              {role}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default InstructorHeader;
