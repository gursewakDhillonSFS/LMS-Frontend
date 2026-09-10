"use client";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import TabSwitcher from "@/components/TabSwitcher";
import Course from "@/modules/userCourseTab/Course";
import Evaluation from "@/modules/userCourseTab/Evaluation";
import { NotificationTab, UserInternalTab } from "@/utils/constant";
import {
  NotificationTabEnum,
  RoutePaths,
  UserCourseInternalTab,
} from "@/utils/enums";
import { EarPhoneIcon } from "@/utils/icons";
import { Breadcrumb, Spin, Empty } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import CourseAssignments from "@/modules/userCourseTab/CourseAssignments";
import CourseQuizzes from "@/modules/userCourseTab/CourseQuizzes";
import CourseLiveClasses from "@/modules/userCourseTab/CourseLiveClasses";
import { ChatConversation } from "@/utils/interface";
import ChatList from "@/components/ChatList";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setInternalTab } from "@/redux/tabslice/UserCourseInternalSlice";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import { userCourseList, getAnnouncementsByCourseApi, getCourseInfoApi } from "@/services/collections";
import { useAnnouncementSocket, AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import AnnouncementInfoModal from "@/components/modal/AnnouncementInfoModal";
import { toast } from "@/utils/toast";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";

interface CourseDetailItem {
  course_id: string;
  batch_id?: string;
  course_name?: string;
}

const mockChatData: ChatConversation[] = [
  {
    _id: "conv1",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    names: "Alex Johnson",
    lastMessage: {
      sender_id: "user123",
      message_type: "text",
      message: "Hey! Are we still on for the meeting?",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 60 },
    },
    unread_count: { user123: 2 },
  },
  {
    _id: "conv2",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    names: "Priya Sharma",
    lastMessage: {
      sender_id: "user456",
      message_type: "image",
      message: "image",
      message_time: { seconds: Math.floor(Date.now() / 1000) - 300 },
    },
    unread_count: { user123: 0 },
  },
];

const CourseDetails = () => {
  const searchParams = useSearchParams();
  const urlCourseId = searchParams.get("course_id") || "";
  const urlBatchId = searchParams.get("batch_id") || "";

  const activeKey = useSelector(
    (state: RootState) => state.internaltab.activeInternalTab
  );
  const [activeTab, setActiveTab] = useState(activeKey);
  const [notificationTab, setNotificationTab] = useState<string>(
    NotificationTabEnum?.Announcement
  );
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [batchIds, setBatchIds] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementPayload | null>(null);
  const [courseName, setCourseName] = useState<string>("Course");
  
  const [activeCourseId, setActiveCourseId] = useState<string>(urlCourseId);
  const [activeBatchId, setActiveBatchId] = useState<string>(urlBatchId);

  const dispatch = useDispatch();

  const breadcrumbItems = [
    { title: "My Courses", href: RoutePaths?.MyCourses },
    { title: courseName },
  ];


  // Fetch Student's Enrolled Courses & Real-Time Announcements
  const initStudentData = async () => {
    setLoading(true);
    try {
      // If course_id is in URL, use it directly; otherwise fall back to enrolled courses
      const targetCourseId = urlCourseId;
      const targetBatchId = urlBatchId;

      if (targetCourseId) {
        setCourseIds([targetCourseId]);
        if (targetBatchId) setBatchIds([targetBatchId]);

        // Fetch announcements for this specific course
        const params = new URLSearchParams();
        if (targetBatchId) params.append("batchId", targetBatchId);
        const annRes = await getAnnouncementsByCourseApi(targetCourseId, params);
        if (annRes?.status && annRes?.data?.announcements) {
          setAnnouncements(annRes.data.announcements as AnnouncementPayload[]);
        }
      } else {
        // Fallback: load from enrolled courses list
        const res = await userCourseList(new URLSearchParams());
        if (res?.status && res?.data?.courses?.length > 0) {
          const enrolledCourses = res.data.courses as CourseDetailItem[];
          const cIds = enrolledCourses.map((c) => c.course_id);
          const bIds = enrolledCourses.map((c) => c.batch_id).filter((b): b is string => !!b);
          setCourseIds(cIds);
          setBatchIds(bIds);
          setCourseName(enrolledCourses[0]?.course_name || "Course");

          const activeCourse = enrolledCourses[0];
          setActiveCourseId(activeCourse.course_id);
          if (activeCourse.batch_id) {
            setActiveBatchId(activeCourse.batch_id);
          }
          
          const params = new URLSearchParams();
          if (activeCourse.batch_id) params.append("batchId", activeCourse.batch_id);
          const annRes = await getAnnouncementsByCourseApi(activeCourse.course_id, params);
          if (annRes?.status && annRes?.data?.announcements) {
            setAnnouncements(annRes.data.announcements as AnnouncementPayload[]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching student active courses / announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initStudentData();
  }, []);

  // Socket live notification callbacks
  const onAnnouncementNew = useCallback((ann: AnnouncementPayload) => {
    // Append to list dynamically if matching one of student's course rooms
    if (courseIds.includes(ann.courseId)) {
      setAnnouncements((prev) => {
        if (prev.some((a) => a._id === ann._id)) return prev;
        return [ann, ...prev];
      });
    }
  }, [courseIds]);

  const onAnnouncementDeleted = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a._id !== id));
  }, []);

  // Activate Socket Hook
  useAnnouncementSocket({
    courseIds,
    batchIds,
    onAnnouncementNew,
    onAnnouncementDeleted,
  });

  useEffect(() => {
    dispatch(setInternalTab(activeTab));
  }, [activeTab, dispatch]);

  return (
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={breadcrumbItems}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <AnnouncementInfoModal
        infoModal={infoModal}
        setInfoModal={setInfoModal}
        activeDataModal={selectedAnnouncement}
      />

      <div className="w-full flex gap-[12px]">
        {/* Left Side Tab Content */}
        <div className="w-2/3 flex flex-col gap-[24px]">
          <TabSwitcher
            activeKey={activeTab}
            onChange={setActiveTab}
            tabs={UserInternalTab}
          />

          {activeTab === UserCourseInternalTab?.COURSES && (
            <Course courseId={activeCourseId} batchId={activeBatchId} />
          )}
          {activeTab === UserCourseInternalTab?.ASSIGNMENTS && (
            <CourseAssignments courseId={activeCourseId} batchId={activeBatchId} />
          )}
          {activeTab === UserCourseInternalTab?.EVALUATIONS && <Evaluation />}
          {activeTab === UserCourseInternalTab?.LIVE_CLASSES && (
            <CourseLiveClasses />
          )}
          {activeTab === UserCourseInternalTab?.QUIZZES && (
            <CourseQuizzes courseId={activeCourseId} batchId={activeBatchId} />
          )}
        </div>

        {/* Right Side Sidebar Panel (Announcements & Chat) */}
        <div className="w-1/3 h-fit flex flex-col gap-[12px] rounded-[12px] p-4 bg-white shadow-sm border border-slate-100">
          <CustomTabSwitcher
            activeKey={notificationTab}
            onChange={setNotificationTab}
            tabs={NotificationTab}
            className="border-b border-[#818B9A]"
          />

          {notificationTab === NotificationTabEnum?.Announcement && (
            <div className="flex flex-col gap-[12px] my-[12px]">
              {loading ? (
                <div className="flex flex-col gap-2 justify-center items-center p-6">
                  <Spin size="small" />
                  <span className="text-slate-400 text-xs">Syncing live announcements...</span>
                </div>
              ) : announcements.length === 0 ? (
                <Empty description="No announcements posted yet." className="my-6" />
              ) : (
                <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {announcements.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => {
                        setSelectedAnnouncement(note);
                        setInfoModal(true);
                      }}
                      className="flex gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 cursor-pointer"
                    >
                      <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-600">
                        <EarPhoneIcon />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-slate-400">
                            {note.instructorName}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {dayjs(note.publishedAt).format("h:mm A")}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {note.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {note.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {notificationTab === NotificationTabEnum?.Chat && (
            <ChatList
              mobile={false}
              chat={mockChatData}
              onSelect={(chat) => console.log("Selected chat conversation:", chat)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
