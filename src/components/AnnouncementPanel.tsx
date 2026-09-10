"use client";

import { EarPhoneIcon } from "@/utils/icons";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import { getMyAnnouncementsApi } from "@/services/collections";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import dayjs from "dayjs";

interface AnnouncementPanelProp {
  onClose: () => void;
  isTeacher?: boolean;
}

const AnnouncementPanel: React.FC<AnnouncementPanelProp> = ({ onClose }) => {
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
      <div className="flex justify-between items-center bg-[#F3F6FC] px-[24px] pt-[24px] pb-[16px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <EarPhoneIcon />
          </div>
          <h2 className="text-lg text-[#0E0E0E] font-bold">Announcements</h2>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
        >
          <CloseOutlined className="text-base" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[24px] py-[16px] flex flex-col gap-[12px]">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingOutlined spin className="!text-2xl text-primary" />
          </div>
        ) : announcements.length > 0 ? (
          announcements.map((note) => (
            <div
              key={note._id}
              className="flex gap-[12px] p-[14px] rounded-[10px] bg-[#F9F9FB] border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all shadow-sm"
            >
              <div className="bg-primary min-w-[40px] h-[40px] rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                <EarPhoneIcon />
              </div>
              <div className="flex flex-col gap-[6px] w-full min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[14px] text-gray-900 truncate">
                      {note.courseName}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {note.title}
                    </span>
                  </div>
                  <span className="text-[12px] text-gray-400 whitespace-nowrap shrink-0">
                    {dayjs(note.publishedAt || note.createdAt).format("DD MMM")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="bg-gray-200/80 text-gray-700 px-2 py-0.5 rounded font-medium">
                    {note.batchName || "All Batches"}
                  </span>
                  {note.instructorName && (
                    <span className="truncate">By {note.instructorName}</span>
                  )}
                </div>

                <div
                  className="text-[13px] font-normal text-gray-600 line-clamp-3 leading-relaxed mt-1"
                  dangerouslySetInnerHTML={{
                    __html: note.message,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <EarPhoneIcon />
            <p className="mt-3 text-sm font-medium">No announcements yet</p>
            <p className="text-xs text-gray-400">
              When new announcements are posted, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementPanel;
