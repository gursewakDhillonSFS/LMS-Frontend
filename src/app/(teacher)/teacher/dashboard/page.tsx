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
        <div className="text-[var(--primary)]">
          <CourseIcon />
        </div>
      ),
      text: "Assigned Courses",
      count: "4",
      bg: "#EEF2FF",
    },
    {
      image: (
        <div className="text-[var(--success)]">
          <StudentIcon />
        </div>
      ),
      text: "Your Students",
      count: "84",
      bg: "#ECFDF5",
    },
    {
      image: (
        <div className="text-[var(--error)]">
          <LiveIcon />
        </div>
      ),
      text: "Upcoming Live Classes",
      count: "01",
      bg: "#FEF2F2",
    },
    {
      image: (
        <div className="text-[var(--warning)]">
          <AssignmentIcon />
        </div>
      ),
      text: "Pending Gradings",
      count: "8",
      bg: "#FFFBEB",
    },
  ];
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Teacher Dashboard
        </h1>
        <div className="flex flex-wrap gap-2.5 items-center">
          <CommonButton
            text="Schedule Live Class"
            className="!bg-white !border !border-[var(--border)] !text-[var(--text-primary)] hover:!border-[var(--primary)] hover:!text-[var(--primary)] !h-9 !text-xs !px-3 shadow-2xs"
            onClick={() => route.push("/teacher/live-classes")}
          />
          <CommonButton
            text="View My Schedule"
            onClick={() => route.push("/teacher/schedule")}
            className="!h-9 !text-xs !px-4 shadow-xs"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {infoCardsData.map((card, index) => (
          <InfoCard key={index} {...card} />
        ))}
      </div>
      <InstructorStatistics />

      {/* Announcements Section */}
      <div className="w-full xl:w-1/2 bg-white border border-[var(--border)] rounded-[10px] p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-[16px] font-bold text-[var(--text-primary)] tracking-tight">
            Announcements
          </h2>
          {announcements.length > 0 && (
            <span className="text-xs bg-blue-50 text-[var(--primary)] px-2 py-0.5 rounded-full font-medium">
              {announcements.length}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto">
          {announcements.length > 0 ? (
            announcements.map((note, index) => (
              <div
                key={note._id || index}
                className="bg-[var(--surface-subtle)] border border-[var(--border)] rounded-[8px] p-3 flex flex-col gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-[var(--primary)]">
                    <EarPhoneIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-[var(--text-primary)] truncate">
                      {note.courseName}
                    </p>
                    <p className="text-xs text-[var(--primary)] font-medium truncate">
                      {note.title}
                    </p>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                    {dayjs(note.publishedAt).format("DD MMM")}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        note.message.slice(0, 70) +
                        (note.message.length > 70 ? "..." : ""),
                    }}
                  ></span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No announcements available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
