import { EarPhoneIcon } from "@/utils/icons";
import { CloseOutlined } from "@ant-design/icons";
import React from "react";

interface AnnouncementPanelProp {
  onClose: () => void;
  isTeacher?: boolean;
}

import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import { getAnnouncementsByCoursesApi, getAnnouncementsByInstructorApi, userCourseList } from "@/services/collections";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";

const AnnouncementPanel: React.FC<AnnouncementPanelProp> = ({ onClose, isTeacher }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementPayload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        if (isTeacher) {
          const param = new URLSearchParams();
          param.append("page", "1");
          param.append("limit", "20");
          const res = await getAnnouncementsByInstructorApi(param);
          if (res?.status && res?.data?.announcements) {
            setAnnouncements(res.data.announcements);
          }
        } else {
          const param = new URLSearchParams();
          param.append("page", "1");
          param.append("limit", "10");
          const res = await userCourseList(param);
        
        if (res?.status && res?.data?.courses?.length > 0) {
          const coursesPayload = res.data.courses.map((c: any) => ({
            courseId: c.course_id,
            batchId: c.batch_id
          }));
          
          const annRes = await getAnnouncementsByCoursesApi({ courses: coursesPayload });
          if (annRes?.status && annRes?.data?.announcements) {
             setAnnouncements(annRes.data.announcements);
          }
        }
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center bg-[#F3F6FC] px-[24px] pt-[24px] pb-[10px]">
        <h2 className="text-lg text-[#0E0E0E] font-bold">Announcement</h2>
        <button
          onClick={onClose}
          className="cursor-pointer text-red-500 hover:text-red-700"
        >
          <CloseOutlined />
        </button>
      </div>
      <div className="flex flex-col gap-[12px] my-[12px] px-[24px] py-[10px]">
        {loading ? (
          <div className="flex justify-center p-4"><LoadingOutlined spin className="!text-2xl" /></div>
        ) : announcements.length > 0 ? (
          announcements.map((note, index) => (
            <div key={note._id || index} className="flex flex-col gap-[12px]">
              <div className="flex gap-[10px] p-[10px] rounded-[6px] bg-[#F9F9F9] border border-gray-100">
                <div className="bg-primary min-w-[44px] h-[44px] rounded-full flex items-center justify-center">
                  <EarPhoneIcon />
                </div>
                <div className="flex flex-col gap-[6px] w-full">
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                      <p className="font-[600] text-[16px] leading-[150%] text-gray-800">
                        {note.courseName}
                      </p>
                      <p className="text-[12px] leading-[140%] text-[#255BFF]">
                        {note.title}
                      </p>
                    </div>
                    <p className="text-[14px] text-[#A9A9A9] leading-[150%]">
                      {dayjs(note.publishedAt).format('DD MMM')}
                    </p>
                  </div>
                  <div className="text-[14px] font-poppins leading-[150%] text-gray-600">
                    <span dangerouslySetInnerHTML={{ __html: note.message.slice(0, 100) + (note.message.length > 100 ? '...' : '') }}></span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No announcements available.</p>
        )}
      </div>
    </div>
  );
};

export default AnnouncementPanel;
