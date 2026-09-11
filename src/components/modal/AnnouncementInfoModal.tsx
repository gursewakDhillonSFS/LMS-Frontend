"use client";

import { Modal } from "antd";
import React from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { Fallback } from "@/utils/images";
import { getImageUrl } from "@/utils/comman";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import { CloseOutlined, SoundOutlined, CalendarOutlined, BookOutlined } from "@ant-design/icons";

interface AnnouncementInfoModalProps {
  infoModal: boolean;
  setInfoModal: (open: boolean) => void;
  activeDataModal: AnnouncementPayload | null;
}

const AnnouncementInfoModal: React.FC<AnnouncementInfoModalProps> = ({
  infoModal,
  setInfoModal,
  activeDataModal,
}) => {
  const avatarUrl = getImageUrl(activeDataModal?.instructorAvatar);

  return (
    <Modal
      open={infoModal}
      onCancel={() => setInfoModal(false)}
      footer={false}
      closable={false}
      centered
      width={620}
      destroyOnClose
    >
      <div className="relative p-1">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#315CFF]">
              <SoundOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Announcement Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Broadcast notification overview
              </p>
            </div>
          </div>
          <button
            onClick={() => setInfoModal(false)}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-4">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <BookOutlined className="text-[10px]" /> Course
              </span>
              <span className="font-semibold text-sm text-slate-900 truncate">
                {activeDataModal?.courseName || "General Course"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <CalendarOutlined className="text-[10px]" /> Published On
              </span>
              <span className="font-semibold text-sm text-slate-800">
                {activeDataModal?.publishedAt
                  ? dayjs(activeDataModal?.publishedAt).format("DD MMM, YYYY [at] h:mm A")
                  : activeDataModal?.createdAt
                  ? dayjs(activeDataModal?.createdAt).format("DD MMM, YYYY [at] h:mm A")
                  : "N/A"}
              </span>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] uppercase font-bold text-slate-400">Author</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={avatarUrl || Fallback}
                    alt={activeDataModal?.instructorName || "Instructor"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <span className="font-semibold text-sm text-slate-800 truncate">
                  {activeDataModal?.instructorName || "Instructor"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] uppercase font-bold text-slate-400">Target Audience</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-[#315CFF] w-fit mt-0.5">
                {activeDataModal?.batchName || "All Batches"}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Subject</span>
            <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 font-bold text-base text-slate-900 leading-snug">
              {activeDataModal?.title || "No Title"}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Broadcast Message</span>
            <div
              className="p-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm leading-relaxed max-h-[240px] overflow-y-auto scrollbar-thin whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: activeDataModal?.message || "",
              }}
            />
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setInfoModal(false)}
              className="py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AnnouncementInfoModal;
