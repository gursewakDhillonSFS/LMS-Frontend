"use client";
import CommonButton from "@/components/CommonButton";
import InfoCard, { InfoCardProps } from "@/components/InfoCard";
import InstructorStatistics from "@/modules/instructorPanel/InstructorStatistics";
import { RoutePaths } from "@/utils/enums";
import {
  AssignmentIcon,
  CourseIcon,
  LiveIcon,
  StudentIcon,
} from "@/utils/icons";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { getAnnouncementsByInstructorApi } from "@/services/collections";
import dayjs from "dayjs";
import { EarPhoneIcon } from "@/utils/icons";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";

const TeacherDashboard = () => {
  const route = useRouter();
  const [announcements, setAnnouncements] = React.useState<AnnouncementPayload[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const param = new URLSearchParams();
        param.append("page", "1");
        param.append("limit", "10");
        const res = await getAnnouncementsByInstructorApi(param);
        if (res?.status && res?.data?.announcements) {
          setAnnouncements(res.data.announcements);
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };
    fetchAnnouncements();
  }, []);
  const infoCardsData: InfoCardProps[] = [
    {
      image: (
        <div className="text-secondary">
          <CourseIcon />
        </div>
      ),
      text: "Assigned Courses",
      count: "4",
      bg: "#D9D4FF",
    },
    {
      image: (
        <div className="text-[#5EB85C]">
          <StudentIcon />
        </div>
      ),
      text: "Your Students",
      count: "84",
      bg: "#EAFFDE",
    },
    {
      image: (
        <div className="text-[#FB4A49]">
          <LiveIcon />
        </div>
      ),
      text: "Upcoming Live Classes",
      count: "01",
      bg: "#FFDEE6",
    },
    {
      image: (
        <div className="text-[#FFC023]">
          <AssignmentIcon />
        </div>
      ),
      text: "Pending Gradings",
      count: "8",
      bg: "#FFF3DB",
    },
  ];
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold">Teacher Dashboard</h1>
        <div className="flex gap-[12px] items-center justify-center">
          <CommonButton
            text={"Schedule Live Class"}
            onClick={() => route.push("/teacher/live-classes")}
          />
          <CommonButton
            text={"View My Schedule"}
            onClick={() => route.push("/teacher/schedule")}
            className="!bg-secondary text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
        {infoCardsData.map((card, index) => (
          <InfoCard key={index} {...card} />
        ))}
      </div>
      <InstructorStatistics />

      {/* Announcements Section - Identical to User Dashboard */}
      <div className="w-full xl:w-1/3 h-[352px] p-6 bg-navcolor rounded-[12px] overflow-y-auto">
        <h1 className="text-[20px] text-white font-[700] leading-[120%] pb-[12px] border-b border-[#4C4C4C]">
          Announcement
        </h1>

        <div className="flex flex-col gap-[12px] my-[12px]">
          {announcements.length > 0 ? announcements.map((note, index) => (
            <div key={note._id || index} className="flex flex-col gap-[12px]">
              <div
                className="flex gap-[10px] p-[6px] rounded-[6px]"
                style={{ background: "rgba(255, 255, 255, 0.05)" }}
              >
                <div className="bg-primary min-w-[44px] h-[44px] rounded-full flex items-center justify-center">
                  <EarPhoneIcon />
                </div>
                <div className="flex flex-col gap-[6px] w-full">
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                      <p className="font-[600] text-[16px] leading-[150%] text-white">
                        {note.courseName}
                      </p>
                      <p className="text-[12px] leading-[140%] text-[#255BFF]">
                        {note.title}
                      </p>
                    </div>
                    <p className="text-[14px] text-[#A9A9A9] leading-[150%] flex-shrink-0">
                      {dayjs(note.publishedAt).format('DD MMM')}
                    </p>
                  </div>
                  <div className="text-[14px] font-poppins leading-[150%] text-white">
                    <span dangerouslySetInnerHTML={{ __html: note.message.slice(0, 50) + (note.message.length > 50 ? '...' : '') }}></span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-white text-sm">No announcements available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
