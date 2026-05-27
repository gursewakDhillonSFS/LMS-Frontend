"use client";
import React, { useState } from "react";
import SearchInput from "./SearchInput";
import {
  ChatIcon,
  DownArrowIcon,
  GlobeIcon,
  LogoutIcon,
  NotificationIcon,
} from "@/utils/icons";
import { Avatar, Drawer, Dropdown, MenuProps } from "antd";
import NotificationPanel from "./NotificationPanel";
import ChangePassword from "./modal/ChangePassword";
import ConfirmationModal from "./modal/ConfirmationModal";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetAllSlices } from "@/redux/resetSlice";
import { RootState } from "@/redux/store";

const InstructorHeader = () => {
  const full_name = useSelector(
    (state: RootState) => state.userdata?.full_name
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
          className="flex items-center gap-[6px] text-[14px] font-[400] p-[12px] rounded-[8px] hover:bg-primary hover:text-white transition-all"
        >
          <span>Change Password</span>
        </div>
      ),
    },
    {
      key: "logout",
      label: (
        <div className="flex items-center gap-[6px] text-[14px] font-[400] text-[#FF4D4F] p-[12px] rounded-[8px] hover:bg-[#FF4D4F] hover:text-white transition-all">
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
  const route = useRouter();
  const [changePassword, setChangePassword] = useState(false);
  const [notificationDrawer, setNotificationDrawer] = useState(false);

  const [logoutLoading, setLogOutLoading] = useState(false);

  const dispatch = useDispatch();

  const handleLogout = () => {
    setLogOutLoading(true);
    try {
      dispatch(resetAllSlices());
      route.push("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full flex items-center justify-between px-[20px] py-[16px]">
      {logoutModal && (
        <ConfirmationModal
          open={logoutModal}
          onCancel={() => setLogOutModal(false)}
          onSubmit={handleLogout}
          loading={logoutLoading}
          title="Logout"
          description="Are you sure you want to logout this account?"
          iconBG="#FB4A49"
          icon={<LogoutIcon />}
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
      <SearchInput
        search={search}
        onChange={(e) => setSearch(e.target.value)}
        className="!max-w-[150px] lg:!max-w-[472px]"
      />

      <div className="flex items-center gap-[12px] cursor-pointer">
        <div onClick={() => setNotificationDrawer(true)}>
          <NotificationIcon />
        </div>
        <div className="h-[23px] border-l-1 border-[#C8C8C8] "></div>
        <div onClick={() => route.push("/instructor-chat")}>
          <ChatIcon />
        </div>
        <div className="h-[23px] border-l-1 border-[#C8C8C8] "></div>
        <div className="flex items-center gap-[3px] justify-between">
          <GlobeIcon /> <span className="text-[14px] font-[500]">EN</span>
        </div>
        <Dropdown
          prefixCls="custom-dropdown-header"
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button className="flex items-center p-1 gap-[4px] h-[44px]  justify-between rounded-[40px] bg-[#F7F7FA] cursor-pointer">
            <div className="flex items-center justify-center gap-[8px]">
              <Avatar
                key={profile_img || "avatar"}
                size={36}
                src={
                  profile_img || "https://ui-avatars.com/api/?name=" + full_name
                }
              />

              <div className="flex flex-col items-start justify-center">
                <div className="text-[12px] font-[500] text-[#242424] whitespace-nowrap leading-[140%]">
                  {full_name}
                </div>
                <div className="capitalize text-[10px] bg-secondary text-white font-poppins px-[6px] rounded-[26px] leading-[14px]">
                  {role}
                </div>
              </div>
            </div>
            <span className="hidden xs:block p-[10px]">
              <DownArrowIcon color="#7B7F91" />
            </span>
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default InstructorHeader;
