import { DeleteIcon, EditIcon } from "@/utils/icons";
import dayjs from "dayjs";
import React from "react";
import Image from "next/image";
import { Fallback } from "@/utils/images";
import { getImageUrl } from "@/utils/comman";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";

interface AnnouncementCardProps {
  data: AnnouncementPayload;
  onEdit?: (data: AnnouncementPayload) => void;
  onDelete?: (id: string) => void;
  setSelectedData: (data: AnnouncementPayload) => void;
  setInfoModal: (open: boolean) => void;
  activeKey?: string;
  isStudentView?: boolean;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  data,
  onEdit,
  onDelete,
  setSelectedData,
  setInfoModal,
  isStudentView = false,
}) => {
  const avatarUrl = getImageUrl(data.instructorAvatar);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      {/* Header Info */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200">
              <Image
                src={avatarUrl || Fallback}
                alt={data.instructorName || "Instructor"}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-800">
                {data.instructorName || "Instructor"}
              </h4>
              <p className="text-[10px] text-slate-400">
                {data.publishedAt
                  ? dayjs(data.publishedAt).format("DD MMM, YYYY [at] h:mm A")
                  : dayjs(data.createdAt).format("DD MMM, YYYY [at] h:mm A")}
              </p>
            </div>
          </div>

          {/* Action icons (only for instructor view) */}
          {!isStudentView && (
            <div className="flex gap-2">
              {data.status === "draft" && onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(data);
                  }}
                  className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors text-indigo-600 cursor-pointer"
                  title="Edit Draft"
                >
                  <EditIcon />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(data._id);
                  }}
                  className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors text-red-600 cursor-pointer"
                  title="Delete Announcement"
                >
                  <DeleteIcon />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="mt-2">
          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {data.courseName}
          </span>
          <span className="ml-2 text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {data.batchName || "All Batches"}
          </span>
          {data.status === "draft" && (
            <span className="ml-2 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Scheduled: {data.scheduledAt || "Draft"}
            </span>
          )}

          <h3 className="text-sm font-bold text-slate-800 mt-2 line-clamp-1">
            {data.title || "No Title"}
          </h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-3">
            {data.message}
          </p>
        </div>
      </div>

      {/* Details Link */}
      <div className="flex justify-between items-center border-t border-slate-50 pt-3 mt-1">
        <button
          onClick={() => {
            setSelectedData(data);
            setInfoModal(true);
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
        >
          See Full Details &rarr;
        </button>
      </div>
    </div>
  );
};

export default AnnouncementCard;
