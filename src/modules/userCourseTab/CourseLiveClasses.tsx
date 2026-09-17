"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  VideoCameraOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  LinkOutlined,
  CheckCircleFilled,
  ReloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { getSchedulesApi } from "@/services/collections";
import { toast } from "@/utils/toast";

interface CourseLiveClassesProps {
  courseId?: string;
  batchId?: string;
}

interface ScheduleItem {
  id: string;
  topic: string;
  courseName?: string;
  batchName?: string;
  date?: string;
  startTime: string;
  endTime?: string;
  meetingLink?: string;
  recordingUrl?: string;
  recordingName?: string;
  description?: string;
  isPast: boolean;
  isLiveNow: boolean;
}

const isSessionLiveNow = (dateStr?: string, startTime?: string, endTime?: string): boolean => {
  if (!dateStr || !startTime) return false;
  try {
    const sessionDate = new Date(dateStr);
    const now = new Date();

    const isSameDay =
      sessionDate.getFullYear() === now.getFullYear() &&
      sessionDate.getMonth() === now.getMonth() &&
      sessionDate.getDate() === now.getDate();

    if (!isSameDay) return false;

    const [startH, startM] = startTime.split(":").map(Number);
    const startMinutes = (startH || 0) * 60 + (startM || 0);

    let endMinutes: number;
    if (endTime) {
      const [endH, endM] = endTime.split(":").map(Number);
      endMinutes = (endH || 0) * 60 + (endM || 0);
    } else {
      endMinutes = startMinutes + 90; // Default 90 min window
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= startMinutes - 15 && currentMinutes <= endMinutes;
  } catch {
    return false;
  }
};

const CourseLiveClasses: React.FC<CourseLiveClassesProps> = ({ courseId, batchId }) => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute for real-time join availability
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveClasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Only filter by calendar month if viewing generic schedule without a specific course
      if (!courseId) {
        const now = new Date();
        params.append("month", String(now.getMonth() + 1));
        params.append("year", String(now.getFullYear()));
      }
      if (courseId) params.append("courseId", courseId);
      if (batchId) params.append("batchId", batchId);

      const res = await getSchedulesApi(params);
      const events = res?.data?.schedules || res?.data || [];
      const list = Array.isArray(events) ? events : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mapped: ScheduleItem[] = list.map((e: any) => {
        const eventDate = e.date ? new Date(e.date) : null;
        const checkDate = eventDate ? new Date(eventDate) : null;
        if (checkDate) checkDate.setHours(0, 0, 0, 0);

        const id = e._id || e.schedule_id || String(Math.random());
        const startTime = e.startTime || "00:00";
        const endTime = e.endTime;
        const isPast = checkDate ? checkDate.getTime() < today.getTime() : false;
        const isLiveNow = !isPast && isSessionLiveNow(e.date, startTime, endTime);

        return {
          id,
          topic: e.title || "Live Interactive Class",
          courseName: e.courseId?.course_name || e.courseName,
          batchName: e.batchId?.batchName || e.batchName,
          date: e.date,
          startTime,
          endTime,
          meetingLink: e.meetingLink || "",
          recordingUrl: e.recordingUrl || "",
          recordingName: e.recordingName || "",
          description: e.description || "",
          isPast,
          isLiveNow,
        };
      });

      setSchedules(mapped);
    } catch (err) {
      console.error("Failed to load live classes:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, batchId]);

  useEffect(() => {
    fetchLiveClasses();
  }, [fetchLiveClasses]);

  // Recalculate isLiveNow when currentTime changes
  const processedSchedules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return schedules.map((item) => {
      const eventDate = item.date ? new Date(item.date) : null;
      const checkDate = eventDate ? new Date(eventDate) : null;
      if (checkDate) checkDate.setHours(0, 0, 0, 0);
      const isPast = checkDate ? checkDate.getTime() < today.getTime() : false;
      const isLiveNow = !isPast && isSessionLiveNow(item.date, item.startTime, item.endTime);
      return { ...item, isPast, isLiveNow };
    });
  }, [schedules, currentTime]);

  const upcomingAndLive = useMemo(() => {
    return processedSchedules
      .filter((s) => !s.isPast)
      .sort((a, b) => {
        if (a.isLiveNow && !b.isLiveNow) return -1;
        if (!a.isLiveNow && b.isLiveNow) return 1;
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });
  }, [processedSchedules]);

  const pastAndRecordings = useMemo(() => {
    return processedSchedules
      .filter((s) => s.isPast || s.recordingUrl)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
  }, [processedSchedules]);

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      {/* 1. Live & Upcoming Sessions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <VideoCameraOutlined className="text-lg" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#0E0E0E]">Live & Scheduled Classes</h2>
              <p className="text-xs text-gray-500">
                Join live interactive video sessions with your instructor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchLiveClasses}
            className="text-xs text-gray-500 hover:text-secondary flex items-center gap-1 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-gray-100"
          >
            <ReloadOutlined spin={loading} className="text-xs" />
            <span>Refresh</span>
          </button>
        </div>

        {loading && schedules.length === 0 ? (
          <div className="p-8 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-xs">
            <LoadingOutlined spin className="text-secondary text-2xl" />
          </div>
        ) : upcomingAndLive.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <VideoCameraOutlined className="text-xl" />
            </div>
            <p className="font-semibold text-sm text-gray-700">No Upcoming Live Sessions</p>
            <p className="text-xs text-gray-400 max-w-sm">
              Your instructor hasn't scheduled any upcoming live classes for this week. Notifications will appear when a class is scheduled.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingAndLive.map((item) => {
              const formattedDate = item.date
                ? new Date(item.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                : "Upcoming";

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.isLiveNow
                      ? "bg-gradient-to-r from-red-50/80 via-white to-red-50/40 border-red-200 shadow-md shadow-red-100/50"
                      : "bg-white border-gray-200/80 hover:border-blue-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Icon / Status badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        item.isLiveNow
                          ? "bg-red-500 text-white border-red-400 animate-pulse shadow-sm"
                          : "bg-blue-50 text-secondary border-blue-100"
                      }`}
                    >
                      <VideoCameraOutlined className="text-xl" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.isLiveNow && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-xs animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            LIVE NOW
                          </span>
                        )}
                        <h3 className="font-bold text-base text-gray-900 leading-snug">
                          {item.topic}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarOutlined className="text-gray-400" />
                          {formattedDate}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <ClockCircleOutlined className="text-gray-400" />
                          {item.startTime}
                          {item.endTime ? ` - ${item.endTime}` : ""}
                        </span>
                        {item.batchName && (
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium text-[10px]">
                            {item.batchName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {item.isLiveNow ? (
                      item.meetingLink ? (
                        <button
                          type="button"
                          onClick={() => window.open(item.meetingLink, "_blank")}
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-200 transition-transform active:scale-95 cursor-pointer"
                        >
                          <PlayCircleOutlined className="text-base" />
                          <span>Join Class Now</span>
                        </button>
                      ) : (
                        <span className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                          Live (Link pending)
                        </span>
                      )
                    ) : (
                      <>
                        {item.meetingLink ? (
                          <button
                            type="button"
                            onClick={() => window.open(item.meetingLink, "_blank")}
                            className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <PlayCircleOutlined className="text-sm" />
                            <span>Join Session</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            Starts at {item.startTime}
                          </span>
                        )}
                        {item.meetingLink && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(item.meetingLink || "");
                              toast.success("Meeting link copied to clipboard!");
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                            title="Copy Meeting Link"
                          >
                            <LinkOutlined className="text-xs" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Recorded Classes Library */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <PlayCircleOutlined className="text-lg" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#0E0E0E]">Recorded Sessions Library</h2>
              <p className="text-xs text-gray-500">
                Rewatch past lectures, interactive discussions, and Q&A sessions
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {pastAndRecordings.length} {pastAndRecordings.length === 1 ? "Session" : "Sessions"}
          </span>
        </div>

        {pastAndRecordings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
              <PlayCircleOutlined className="text-xl" />
            </div>
            <p className="font-semibold text-sm text-gray-700">No Recorded Classes Yet</p>
            <p className="text-xs text-gray-400 max-w-sm">
              Recorded sessions will appear here after live classes conclude so you can review them at any time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastAndRecordings.map((item) => {
              const formattedDate = item.date
                ? new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Past Session";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col justify-between gap-3.5 hover:shadow-md hover:border-purple-200 transition-all group"
                >
                  {/* Thumbnail / Video header card */}
                  <div className="relative w-full h-32 rounded-xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center overflow-hidden group-hover:scale-[1.01] transition-transform">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl border border-white/30 group-hover:bg-purple-600 transition-colors">
                      <PlayCircleOutlined />
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                        <CheckCircleFilled className="text-emerald-400 text-[9px]" />
                        Recorded
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2.5">
                      <span className="text-[11px] font-medium text-white/90 drop-shadow">
                        {item.startTime}
                        {item.endTime ? ` - ${item.endTime}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {item.recordingName || item.topic}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarOutlined className="text-gray-400" />
                        {formattedDate}
                      </span>
                      {item.batchName && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                          {item.batchName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Watch Button */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    {item.recordingUrl ? (
                      <button
                        type="button"
                        onClick={() => window.open(item.recordingUrl, "_blank")}
                        className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <PlayCircleOutlined className="text-sm" />
                        <span>Watch Recording</span>
                      </button>
                    ) : item.meetingLink ? (
                      <button
                        type="button"
                        onClick={() => window.open(item.meetingLink, "_blank")}
                        className="w-full py-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PlayCircleOutlined className="text-sm" />
                        <span>Open Session Link</span>
                      </button>
                    ) : (
                      <span className="w-full text-center text-xs text-gray-400 py-1">
                        Recording processing
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLiveClasses;
