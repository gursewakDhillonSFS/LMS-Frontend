"use client";

import { EarPhoneIcon } from "@/utils/icons";
import { CloseOutlined, LoadingOutlined, SoundOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import { getMyAnnouncementsApi } from "@/services/collections";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import dayjs from "dayjs";
import { useTranslation } from "@/context/I18nContext";

interface AnnouncementPanelProp {
  onClose: () => void;
  isTeacher?: boolean;
}

const AnnouncementPanel: React.FC<AnnouncementPanelProp> = ({ onClose }) => {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<AnnouncementPayload[]>([]);
  const [loading, setLoading] = useState(true);

  const user_id = useSelector((state: RootState) => state.userdata?.user_id);
  const recentRealtime = useSelector(
    (state: RootState) => state.announcement?.recentAnnouncements || []
  );

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const param = new URLSearchParams();
      param.append("page", "1");
      param.append("limit", "30");
      param.append("excludeSelf", "true");
      const res = await getMyAnnouncementsApi(param);
      if (res?.status && res?.data?.announcements) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // When real-time announcements arrive while panel is open, prepend them if not already in list
  useEffect(() => {
    if (recentRealtime.length > 0) {
      setAnnouncements((prev) => {
        const prevIds = new Set(prev.map((a) => a._id));
        const newItems = recentRealtime.filter(
          (a) =>
            !prevIds.has(a._id) &&
            (!user_id || String(a.instructorId) !== String(user_id))
        );
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev];
      });
    }
  }, [recentRealtime, user_id]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
            <SoundOutlined className="text-base" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {t("common.panels.announcementsTitle", { defaultValue: "Announcements" })}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#315CFF]/10 text-[#315CFF]">
              {announcements.length}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close announcements panel"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>

      {/* Announcements List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 text-slate-400 gap-2">
            <LoadingOutlined spin className="!text-3xl text-[#315CFF]" />
            <span className="text-xs font-medium">Loading broadcasts...</span>
          </div>
        ) : announcements.length > 0 ? (
          announcements.map((note) => (
            <div
              key={note._id}
              className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-[#315CFF]/40 hover:shadow-xs transition-all duration-200 flex flex-col gap-2.5"
            >
              {/* Card Top: Course & Date */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#315CFF] bg-blue-50/80 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                  {note.courseName || "General Announcement"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                  <CalendarOutlined className="text-[10px]" />
                  {dayjs(note.publishedAt || note.createdAt).format("DD MMM, YYYY")}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {note.title}
              </h4>

              {/* Message Content */}
              <div
                className="text-[13px] text-slate-600 line-clamp-3 leading-relaxed [&_p]:mb-1 last:[&_p]:mb-0"
                dangerouslySetInnerHTML={{
                  __html: note.message,
                }}
              />

              {/* Footer Meta */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {note.batchName || t("common.panels.allBatches", { defaultValue: "All Batches" })}
                </span>
                {note.instructorName && (
                  <span className="inline-flex items-center gap-1 text-slate-400 truncate">
                    <UserOutlined className="text-[10px]" />
                    <span className="truncate">{note.instructorName}</span>
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <SoundOutlined className="text-xl" />
            </div>
            <p className="text-sm font-bold text-slate-800">No announcements yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              When instructors post broadcasts or updates, they will appear right here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementPanel;
