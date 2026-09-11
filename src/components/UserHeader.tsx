"use client";
import React, { useState } from "react";
import {
  ChatIcon,
  DownArrowIcon,
  EarPhoneIcon,
  GlobeIcon,
  LogoutIcon,
  NotificationIcon,
} from "@/utils/icons";
import { Avatar, Badge, Drawer, Dropdown, MenuProps } from "antd";
import ConfirmationModal from "./modal/ConfirmationModal";
import ChangePassword from "./modal/ChangePassword";
import NotificationPanel from "./NotificationPanel";
import AnnouncementPanel from "./AnnouncementPanel";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetAllSlices } from "@/redux/resetSlice";
import { resetUnreadCount } from "@/redux/slices/AnnouncementSlice";
import { markAnnouncementsAsReadApi } from "@/services/collections";
import { RootState } from "@/redux/store";
import { RoutePaths } from "@/utils/enums";
import Cookies from "js-cookie";
import { useTranslation } from "@/context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemePicker from "./ThemePicker";

const UserHeader = () => {
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

  const menuItems: MenuProps["items"] = [
    {
      key: "change-password",
      label: (
        <div
          onClick={() => setChangePassword(true)}
          className="flex items-center gap-[8px] text-[14px] font-[400] px-[12px] py-[8px] rounded-[8px] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-all duration-[150ms]"
        >
          <span>{t("auth.changePassword.title")}</span>
        </div>
      ),
    },
    {
      key: "logout",
      label: (
        <div className="flex items-center gap-[8px] text-[14px] font-[400] text-[var(--error)] px-[12px] py-[8px] rounded-[8px] hover:bg-[var(--error-light)] transition-all duration-[150ms]">
          <span>{t("common.nav.logout")}</span>
        </div>
      ),
      onClick: () => {
        setLogOutModal(true);
      },
    },
  ];
  const [logoutModal, setLogOutModal] = useState(false);
  const [logoutLoading, setLogOutLoading] = useState(false);
  const route = useRouter();
  const [changePassword, setChangePassword] = useState(false);
  const [notificationDrawer, setNotificationDrawer] = useState(false);
  const [announcementDrawer, setAnnouncementDrawer] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    setLogOutLoading(true);
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
      console.log(error);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };
  return (
    <div className="w-full flex items-center justify-between px-[16px] lg:px-[24px] py-[12px]">
      {logoutModal && (
        <ConfirmationModal
          open={logoutModal}
          onCancel={() => setLogOutModal(false)}
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

      {changePassword && (
        <ChangePassword
          open={changePassword}
          onCancel={() => setChangePassword(false)}
        />
      )}

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
        <Dropdown
          prefixCls="custom-dropdown-header"
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button className="flex items-center p-[4px] gap-[8px] h-[40px] rounded-[10px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] cursor-pointer transition-all duration-[150ms]">
            <Avatar
              key={profile_img || "avatar"}
              size={32}
              src={
                profile_img || "https://ui-avatars.com/api/?name=" + full_name
              }
              className="!flex-shrink-0"
            />
            <div className="hidden sm:flex flex-col items-start justify-center pr-[4px]">
              <div className="text-[13px] font-[500] whitespace-nowrap text-[var(--text-primary)] leading-[140%]">
                {full_name}
              </div>
              <div className="capitalize text-[10px] font-[500] text-[var(--primary)] leading-[14px]">
                {role}
              </div>
            </div>
            <span className="hidden sm:block pr-[8px]">
              <DownArrowIcon color="var(--text-muted)" />
            </span>
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default UserHeader;
