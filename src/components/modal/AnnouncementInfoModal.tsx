import { Modal } from "antd";
import React from "react";
import dayjs from "dayjs";
import { CloseIcon } from "@/utils/icons";
import Image from "next/image";
import { Fallback } from "@/utils/images";
import { getImageUrl } from "@/utils/comman";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";

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
      width={600}
      className="relative"
    >
      <button
        onClick={() => setInfoModal(false)}
        className="cursor-pointer absolute w-[30px] h-[30px] bg-slate-900 rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm hover:bg-slate-800 transition-colors shadow"
      >
        <CloseIcon />
      </button>

      <div className="p-2">
        <h2 className="font-bold text-2xl text-slate-800 mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
          📢 Announcement Details
        </h2>

        <div className="flex flex-col gap-6">
          {/* Top section: Course, Date, and Instructor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Course Name</span>
              <span className="font-semibold text-sm text-slate-800">
                {activeDataModal?.courseName || "General Course"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Published On</span>
              <span className="font-semibold text-sm text-slate-800">
                {activeDataModal?.publishedAt
                  ? dayjs(activeDataModal?.publishedAt).format("DD MMM, YYYY [at] h:mm A")
                  : activeDataModal?.createdAt
                  ? dayjs(activeDataModal?.createdAt).format("DD MMM, YYYY [at] h:mm A")
                  : ""}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Author / Instructor</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                  <Image
                    src={avatarUrl || Fallback}
                    alt={activeDataModal?.instructorName || "Instructor"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <span className="font-semibold text-sm text-slate-800">
                  {activeDataModal?.instructorName || "Instructor"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Target Audience</span>
              <span className="font-semibold text-sm text-indigo-600">
                {activeDataModal?.batchName || "All Batches"}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Subject / Title</span>
            <h3 className="font-bold text-lg text-slate-800 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
              {activeDataModal?.title || "No Title"}
            </h3>
          </div>

          {/* Detailed Message */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Message</span>
            <div className="min-h-[140px] border border-slate-200 bg-white rounded-xl p-4 text-slate-700 text-sm whitespace-pre-line leading-relaxed shadow-inner">
              {activeDataModal?.message}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AnnouncementInfoModal;
