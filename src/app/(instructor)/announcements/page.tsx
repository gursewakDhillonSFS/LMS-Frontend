"use client";

import AnnouncementCard from "@/components/AnnouncementCard";
import CommonButton from "@/components/CommonButton";
import AnnouncementInfoModal from "@/components/modal/AnnouncementInfoModal";
import PostAnnouncementModal from "@/components/modal/PostAnnouncementModal";
import TabSwitcher from "@/components/TabSwitcher";
import { RootState } from "@/redux/store";
import { setAnnouncementTab } from "@/redux/tabslice/AnnouncementTabSlice";
import { InstructorAnnouncementTabs } from "@/utils/constant";
import { CalendarIcon2 } from "@/utils/icons";
import { DatePicker, Spin, Empty, Pagination, Modal } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { DeleteFilled } from "@ant-design/icons";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import { useDispatch, useSelector } from "react-redux";
import {
  createAnnouncementApi,
  getAnnouncementsByInstructorApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
  getAllCoursesApi,
} from "@/services/collections";
import { useAnnouncementSocket, AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import { toast } from "@/utils/toast";
import dayjs from "dayjs";

interface CourseListItem {
  course_id: string;
  course_name: string;
}

const Announcements = () => {
  const announcementActiveTab = useSelector(
    (state: RootState) => state.announcementTab.InstructorActiveTab
  );

  const [activeTab, setActiveTab] = useState<string>(announcementActiveTab || "announcement");
  const [infoModal, setInfoModal] = useState(false);
  const [postAnnouncementModal, setPostAnnouncementModal] = useState(false);
  const [activeDataModal, setActiveDataModal] = useState<AnnouncementPayload | null>(null);
  
  // Real CRUD states
  const [announcements, setAnnouncements] = useState<AnnouncementPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editData, setEditData] = useState<AnnouncementPayload | null>(null);
  
  // Delete Confirmation States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(8);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Dynamic Course/Batch IDs for socket room subscriptions
  const [subscribedCourseIds, setSubscribedCourseIds] = useState<string[]>([]);

  const dispatch = useDispatch();

  // Fetch Instructor's courses to join socket rooms
  useEffect(() => {
    const fetchSubscribedCourses = async () => {
      try {
        const res = await getAllCoursesApi();
        if (res?.status && res?.data?.course_list) {
          const courseList = res.data.course_list as CourseListItem[];
          const ids = courseList.map((c) => c.course_id);
          setSubscribedCourseIds(ids);
        }
      } catch (err) {
        console.error("Error fetching courses for room join:", err);
      }
    };
    fetchSubscribedCourses();
  }, []);

  // Real-time Socket Event Handlers
  const onAnnouncementNew = useCallback((ann: AnnouncementPayload) => {
    // If the new announcement matches our current tab filter, insert it
    const matchesTab =
      activeTab === "draft" ? ann.status === "draft" : ann.status === "published";
    
    if (matchesTab) {
      setAnnouncements((prev) => {
        // Prevent duplicate real-time cards
        if (prev.some((a) => a._id === ann._id)) return prev;
        return [ann, ...prev].slice(0, limit);
      });
      setTotal((prev) => prev + 1);
    }
  }, [activeTab, limit]);

  const onAnnouncementDeleted = useCallback((id: string) => {
    setAnnouncements((prev) => {
      const filtered = prev.filter((a) => a._id !== id);
      if (filtered.length !== prev.length) {
        toast.warn("🗑️ An announcement was deleted in real-time.");
      }
      return filtered;
    });
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  // Initialize Announcement Socket
  useAnnouncementSocket({
    courseIds: subscribedCourseIds,
    batchIds: [], // All batches
    onAnnouncementNew,
    onAnnouncementDeleted,
  });

  // Fetch Announcements from Backend API
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("tab", activeTab === "draft" ? "draft" : "announcement");
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.append("startDate", dateRange[0].format("YYYY-MM-DD"));
        params.append("endDate", dateRange[1].format("YYYY-MM-DD"));
      }

      const res = await getAnnouncementsByInstructorApi(params);
      if (res?.status && res?.data?.announcements) {
        setAnnouncements(res.data.announcements as AnnouncementPayload[]);
        setTotal(res.data.total);
      } else {
        toast.error(res?.message || "Failed to load announcements");
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      toast.error("Internal Server Error fetching announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [activeTab, page, dateRange]);

  useEffect(() => {
    dispatch(setAnnouncementTab(activeTab));
  }, [activeTab, dispatch]);

  // Create / Update Announcement Submit Handler
  const handlePostAnnouncement = async (payload: Record<string, unknown>, status: "published" | "draft") => {
    setSubmitLoading(true);
    try {
      let res;
      if (editData) {
        res = await updateAnnouncementApi(editData._id, payload);
      } else {
        res = await createAnnouncementApi(payload);
      }

      if (res?.status) {
        toast.success(res.message || "Announcement saved successfully");
        setPostAnnouncementModal(false);
        setEditData(null);
        fetchAnnouncements();
      } else {
        toast.error(res?.message || "Failed to save announcement");
      }
    } catch (err) {
      console.error("Error saving announcement:", err);
      toast.error("Failed to save announcement");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Confirm Delete Announcement
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteAnnouncementApi(deleteId);
      if (res?.status) {
        toast.success("Announcement deleted successfully");
        fetchAnnouncements();
      } else {
        toast.error(res?.message || "Failed to delete announcement");
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast.error("Failed to delete announcement");
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setDeleteId(null);
    }
  };

  // Delete Announcement Trigger
  const handleDeleteAnnouncement = (id: string) => {
    setDeleteId(id);
    setDeleteModalVisible(true);
  };

  // Open Edit Mode
  const handleOpenEdit = (data: AnnouncementPayload) => {
    setEditData(data);
    setPostAnnouncementModal(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <AnnouncementInfoModal
        infoModal={infoModal}
        setInfoModal={setInfoModal}
        activeDataModal={activeDataModal}
      />

      <PostAnnouncementModal
        postAnnouncement={postAnnouncementModal}
        setPostAnnouncement={(open) => {
          setPostAnnouncementModal(open);
          if (!open) setEditData(null);
        }}
        handlePostAnnouncement={handlePostAnnouncement}
        loading={submitLoading}
        editData={editData}
      />

      {deleteModalVisible && (
        <ConfirmationModal
          open={deleteModalVisible}
          onCancel={() => {
            setDeleteModalVisible(false);
            setDeleteId(null);
          }}
          onSubmit={handleConfirmDelete}
          loading={deleteLoading}
          title="Delete"
          description="Are you sure you want to delete this Announcement?"
          iconBG="#FB4A49"
          icon={<DeleteFilled className="text-4xl !text-white" />}
        />
      )}

      <h1 className="text-[32px] font-[700] text-[#0E0E0E]">Announcements</h1>

      {/* Header controls */}
      <div className="flex justify-between flex-col lg:flex-row gap-3 w-full items-center">
        <TabSwitcher
          activeKey={activeTab}
          onChange={(val) => {
            setActiveTab(val);
            setPage(1);
          }}
          tabs={InstructorAnnouncementTabs}
        />

        <div className="flex items-center gap-3">
          <DatePicker.RangePicker
            allowClear={true}
            format={"YYYY-MM-DD"}
            prefix={<CalendarIcon2 color="var(--secondary)" />}
            suffixIcon={null}
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0], dates[1]]);
              } else {
                setDateRange(null);
              }
              setPage(1);
            }}
          />
          <CommonButton
            onClick={() => {
              setEditData(null);
              setPostAnnouncementModal(true);
            }}
            text={"Post Announcement"}
            className="!bg-secondary text-white"
          />
        </div>
      </div>

      {/* Announcements Cards Listing */}
      {loading ? (
        <div className="flex flex-col gap-3 justify-center items-center h-64">
          <Spin size="large" />
          <span className="text-slate-500 text-sm font-medium">Loading announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-slate-100 flex justify-center items-center">
          <Empty description={`No ${activeTab}s found.`} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {announcements.map((item) => (
              <AnnouncementCard
                key={item._id}
                data={item}
                activeKey={activeTab}
                setSelectedData={setActiveDataModal}
                setInfoModal={setInfoModal}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteAnnouncement}
              />
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-end mt-4">
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Announcements;
