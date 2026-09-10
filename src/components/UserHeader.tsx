"use client";
import React, { useState } from "react";
import SearchInput from "./SearchInput";
import {
  CartIcon,
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
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetAllSlices } from "@/redux/resetSlice";
import { resetUnreadCount } from "@/redux/slices/AnnouncementSlice";
import { markAnnouncementsAsReadApi } from "@/services/collections";
import { RootState } from "@/redux/store";
import { RoutePaths } from "@/utils/enums";
import Cookies from "js-cookie";

const UserHeader = () => {
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
  const menuItems: MenuProps["items"] = [
    {
      key: "change-password",
      label: (
        <div
          onClick={() => setChangePassword(true)}
          className="flex items-center gap-[8px] text-[14px] font-[400] px-[12px] py-[8px] rounded-[8px] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-all duration-[150ms]"
        >
          <span>Change Password</span>
        </div>
      ),
    },
    {
      key: "logout",
      label: (
        <div className="flex items-center gap-[8px] text-[14px] font-[400] text-[var(--error)] px-[12px] py-[8px] rounded-[8px] hover:bg-[var(--error-light)] transition-all duration-[150ms]">
          <span>Log Out</span>
        </div>
      ),
      onClick: () => {
        setLogOutModal(true);
      },
    },
  ];
  const [search, setSearch] = useState("");
  const [logoutModal, setLogOutModal] = useState(false);
  const [logoutLoading, setLogOutLoading] = useState(false);
  const route = useRouter();
  const [changePassword, setChangePassword] = useState(false);
  const [notificationDrawer, setNotificationDrawer] = useState(false);
  const [announcementDrawer, setAnnouncementDrawer] = useState(false);
  const dispatch = useDispatch();
  const cartCount = useSelector(
    (state: RootState) => state.courseData.cartCount
  );

  const handleLogout = () => {
    setLogOutLoading(true);
    try {
      Cookies.remove("token");
      Cookies.remove("role_name");
      Cookies.remove("user_onboarding");
      Cookies.remove("instructor_onboarding");
      Cookies.remove("profileStatus");
      dispatch(resetAllSlices());
      if (typeof window !== "undefined") {
        window.location.href = "/homepage";
      }
    } catch (error) {
      console.log(error);
      if (typeof window !== "undefined") {
        window.location.href = "/homepage";
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
          title="Logout"
          description="Are you sure you want to logout this account?"
          iconBG="#FB4A49"
          icon={<LogoutIcon />}
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
      <SearchInput
        search={search}
        onChange={(e) => setSearch(e.target.value)}
        className="!max-w-[180px] xl:!max-w-[400px]"
        placeholder="Search..."
      />

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
        <Badge
          count={cartCount}
          onClick={() => route.push(RoutePaths?.Checkout)}
        >
          <button className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[var(--surface-subtle)] transition-all duration-[150ms]">
            <CartIcon />
          </button>
        </Badge>
        <div className="hidden sm:flex items-center gap-[4px] px-[4px]">
          <GlobeIcon /> <span className="text-[13px] font-[500] text-[var(--text-secondary)]">EN</span>
        </div>
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
