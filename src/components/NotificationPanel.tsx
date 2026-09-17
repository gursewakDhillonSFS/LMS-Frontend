"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CloseOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  FileDoneOutlined,
  FormOutlined,
  VideoCameraOutlined,
  NotificationOutlined,
  MessageOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { Skeleton, Tooltip, message as antdMessage } from "antd";
import { useTranslation } from "@/context/I18nContext";
import {
  getMyNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "@/services/collections";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  is_read: boolean;
  createdAt: string;
  course_id?: {
    _id: string;
    course_name?: string;
  };
  sender_id?: {
    _id: string;
    fullName?: string;
    avatar?: string;
  };
}

export interface NotificationProps {
  onClose: () => void;
  onUpdateCount?: (count: number) => void;
}

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return "Recently";
  const now = new Date();
  const past = new Date(dateStr);
  const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getNotificationIcon = (type?: string) => {
  switch (type) {
    case "submission":
      return <FileDoneOutlined className="text-blue-600 text-sm" />;
    case "grade":
      return <CheckCircleTwoTone twoToneColor="#10B981" className="text-base" />;
    case "live_class":
    case "schedule":
      return <VideoCameraOutlined className="text-purple-600 text-sm" />;
    case "announcement":
      return <NotificationOutlined className="text-amber-600 text-sm" />;
    case "chat":
      return <MessageOutlined className="text-emerald-600 text-sm" />;
    default:
      return <BellOutlined className="text-blue-600 text-sm" />;
  }
};

const NotificationPanel: React.FC<NotificationProps> = ({ onClose, onUpdateCount }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyNotificationsApi();
      const list =
        res?.data?.notifications ||
        res?.data?.all ||
        (Array.isArray(res?.data) ? res.data : []);
      const safeList: NotificationItem[] = Array.isArray(list) ? list : [];
      setNotifications(safeList);

      const unreadCount =
        res?.unreadCount ?? safeList.filter((n) => !n.is_read).length;
      if (onUpdateCount) onUpdateCount(unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [onUpdateCount]);

  useEffect(() => {
    fetchNotifications();
    const handleRefresh = () => fetchNotifications();
    window.addEventListener("refresh_notifications", handleRefresh);
    return () => {
      window.removeEventListener("refresh_notifications", handleRefresh);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (e: React.MouseEvent, item: NotificationItem) => {
    e.stopPropagation();
    if (item.is_read) return;
    try {
      await markNotificationReadApi(item._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, is_read: true } : n))
      );
      const remainingUnread = notifications.filter((n) => n._id !== item._id && !n.is_read).length;
      if (onUpdateCount) onUpdateCount(remainingUnread);
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      if (onUpdateCount) onUpdateCount(0);
      antdMessage.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      try {
        await markNotificationReadApi(item._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, is_read: true } : n))
        );
      } catch {
        // ignore
      }
    }
    onClose();
    if (item.link) {
      router.push(item.link);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredList =
    activeFilter === "unread" ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
            <BellOutlined className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {t("common.panels.notificationsTitle", { defaultValue: "Notifications" })}
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#315CFF] text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer mr-1"
              >
                Mark all read
              </button>
            </Tooltip>
          )}
          <button
            onClick={onClose}
            aria-label="Close notification panel"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center px-4 pt-3 pb-1 border-b border-slate-100 gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "all"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("unread")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "unread"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Body List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-100 scrollbar-thin">
        {loading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton.Avatar active size={36} shape="circle" />
                <div className="flex-1">
                  <Skeleton active paragraph={{ rows: 1 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3">
              <CheckOutlined className="text-2xl text-emerald-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">You're all caught up!</h4>
            <p className="text-xs text-slate-500 max-w-[220px] mt-1">
              {activeFilter === "unread"
                ? "No unread notifications at this time."
                : "New assignments, grade reviews, and live class schedules will appear here."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 py-1">
            {filteredList.map((item) => {
              const isUnread = !item.is_read;
              return (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isUnread
                      ? "bg-blue-50/40 border-blue-200/70 hover:bg-blue-50/70"
                      : "border-transparent hover:border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                      {getNotificationIcon(item.type)}
                    </div>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#315CFF] border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                        <ClockCircleOutlined className="text-[9px]" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {item.course_id?.course_name && (
                      <div className="mt-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 truncate max-w-[240px]">
                          {item.course_id.course_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {isUnread && (
                    <Tooltip title="Mark as read">
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, item)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity p-1 cursor-pointer shrink-0"
                      >
                        <CheckOutlined className="text-xs" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
