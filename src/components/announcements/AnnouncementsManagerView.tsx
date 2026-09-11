"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  NotificationOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AppstoreOutlined,
  TableOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  createAnnouncementApi,
  getAnnouncementsByInstructorApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
  getAllCoursesApi,
} from "@/services/collections";
import { useAnnouncementSocket, AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import { toast } from "@/utils/toast";
import CustomDropdown from "@/components/CustomDropdown";
import PostAnnouncementModal from "@/components/modal/PostAnnouncementModal";
import AnnouncementInfoModal from "@/components/modal/AnnouncementInfoModal";
import ConfirmationModal from "@/components/modal/ConfirmationModal";

interface CourseListItem {
  course_id: string;
  course_name: string;
}

interface AnnouncementsManagerViewProps {
  role?: "instructor" | "teacher";
}

const AnnouncementsManagerView: React.FC<AnnouncementsManagerViewProps> = ({ role = "instructor" }) => {
  const [activeTab, setActiveTab] = useState<"published" | "draft">("published");
  const [search, setSearch] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Modals
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [activeModalData, setActiveModalData] = useState<AnnouncementPayload | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editData, setEditData] = useState<AnnouncementPayload | null>(null);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Data & Loading
  const [announcements, setAnnouncements] = useState<AnnouncementPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 8;

  // Socket course subscriptions
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [subscribedCourseIds, setSubscribedCourseIds] = useState<string[]>([]);

  // Fetch courses for filter and socket subscriptions
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getAllCoursesApi();
        if (res?.status && res?.data?.course_list) {
          const list = res.data.course_list as CourseListItem[];
          setCourses(list);
          setSubscribedCourseIds(list.map((c) => c.course_id));
        }
      } catch (err) {
        console.error("Error fetching courses for announcements:", err);
      }
    };
    fetchCourses();
  }, []);

  // Real-time socket handlers
  const onAnnouncementNew = useCallback(
    (ann: AnnouncementPayload) => {
      const matchesTab =
        activeTab === "draft" ? ann.status === "draft" : ann.status === "published";
      if (matchesTab) {
        setAnnouncements((prev) => {
          if (prev.some((a) => a._id === ann._id)) return prev;
          return [ann, ...prev].slice(0, limit);
        });
        setTotal((prev) => prev + 1);
      }
    },
    [activeTab, limit]
  );

  const onAnnouncementDeleted = useCallback((id: string) => {
    setAnnouncements((prev) => {
      const filtered = prev.filter((a) => a._id !== id);
      if (filtered.length !== prev.length) {
        toast.warn("An announcement was removed in real-time.");
      }
      return filtered;
    });
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  useAnnouncementSocket({
    courseIds: subscribedCourseIds,
    batchIds: [],
    onAnnouncementNew,
    onAnnouncementDeleted,
  });

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("tab", activeTab === "draft" ? "draft" : "announcement");
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await getAnnouncementsByInstructorApi(params);
      if (res?.status && res?.data?.announcements) {
        setAnnouncements(res.data.announcements as AnnouncementPayload[]);
        setTotal(res.data.total || 0);
      } else {
        toast.error(res?.message || "Failed to load announcements");
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      toast.error("Internal Server Error fetching announcements");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Create or Update announcement submit
  const handlePostAnnouncement = async (
    payload: Record<string, unknown>,
    _status: "published" | "draft"
  ) => {
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
        setPostModalOpen(false);
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

  // Delete announcement
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

  // Client-side filters
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.message?.toLowerCase().includes(search.toLowerCase()) ||
        item.courseName?.toLowerCase().includes(search.toLowerCase()) ||
        item.batchName?.toLowerCase().includes(search.toLowerCase());

      const matchesCourse =
        selectedCourseFilter === "all" || item.courseId === selectedCourseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [announcements, search, selectedCourseFilter]);

  // Course dropdown options
  const courseDropdownOptions = useMemo(() => {
    return [
      { label: "All Courses", value: "all" },
      ...courses.map((c) => ({
        label: c.course_name,
        value: c.course_id,
      })),
    ];
  }, [courses]);

  // Strip HTML for card snippet
  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").trim();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <AnnouncementInfoModal
        infoModal={infoModalOpen}
        setInfoModal={setInfoModalOpen}
        activeDataModal={activeModalData}
      />

      <PostAnnouncementModal
        postAnnouncement={postModalOpen}
        setPostAnnouncement={(open) => {
          setPostModalOpen(open);
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
          title="Delete Announcement"
          description="Are you sure you want to delete this announcement? Students will no longer see this broadcast."
          iconBG="#FB4A49"
          icon={<DeleteOutlined className="text-3xl text-white" />}
        />
      )}

      <div className="space-y-6">
        {/* TOP 4 KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Broadcasts */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Total Broadcasts
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
                {loading ? "..." : total}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#315CFF] font-medium">
                <ArrowUpOutlined className="text-[10px]" />
                <span>Active campaigns</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#315CFF]/10 flex items-center justify-center text-[#315CFF] text-xl shrink-0">
              <NotificationOutlined />
            </div>
          </div>

          {/* Published Announcements */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Published
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
                {loading ? "..." : activeTab === "published" ? total : "Live"}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircleFilled className="text-[10px]" />
                <span>Visible to students</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl shrink-0">
              <CheckCircleFilled />
            </div>
          </div>

          {/* Drafts */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Drafts
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
                {loading ? "..." : activeTab === "draft" ? total : "Saved"}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <ClockCircleOutlined className="text-[10px]" />
                <span>Unpublished updates</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 text-xl shrink-0">
              <FileTextOutlined />
            </div>
          </div>

          {/* Target Reach / Courses */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Courses Reached
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
                {courses.length}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                <TeamOutlined className="text-[10px]" />
                <span>Enrolled audiences</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl shrink-0">
              <TeamOutlined />
            </div>
          </div>
        </div>

        {/* MAIN DATA SECTION CONTAINER */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden">
          {/* TOOLBAR HEADER WITH TABS, SEARCH, DROPDOWN, VIEW SWITCHER & PRIMARY CTA */}
          <div className="p-5 border-b border-[#F2F4F7] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Left: Tab Switcher (Published vs Drafts) */}
            <div className="flex items-center bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("published");
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "published"
                    ? "bg-[#315CFF] text-white shadow-xs"
                    : "text-[#667085] hover:text-[#101828]"
                }`}
              >
                <span>Published Updates</span>
                {activeTab === "published" && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                    {total}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("draft");
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "draft"
                    ? "bg-[#315CFF] text-white shadow-xs"
                    : "text-[#667085] hover:text-[#101828]"
                }`}
              >
                <span>Drafts</span>
                {activeTab === "draft" && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                    {total}
                  </span>
                )}
              </button>
            </div>

            {/* Right: Search, CustomDropdown, View Toggle, and Create CTA */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-[#E4E7EC] rounded-xl text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#315CFF] focus:ring-2 focus:ring-[#315CFF]/10 transition-all"
                />
              </div>

              {/* Course CustomDropdown Filter */}
              <CustomDropdown
                value={selectedCourseFilter}
                onChange={(val) => setSelectedCourseFilter(val)}
                options={courseDropdownOptions}
                placeholder="Filter by Course"
                className="w-[180px]"
              />

              {/* View Switcher */}
              <div className="flex items-center bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-white text-[#315CFF] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  <AppstoreOutlined />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-[#315CFF] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  <TableOutlined />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => {
                  setEditData(null);
                  setPostModalOpen(true);
                }}
                className="px-4 py-2 bg-[#315CFF] hover:bg-[#2547D0] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
              >
                <PlusOutlined className="text-xs" />
                <span>Post Announcement</span>
              </button>
            </div>
          </div>

          {/* CONTENT AREA */}
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse w-full" />
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
                <NotificationOutlined />
              </div>
              <h4 className="text-base font-bold text-[#101828]">
                No {activeTab === "draft" ? "draft" : "published"} announcements
              </h4>
              <p className="text-sm text-[#667085] mt-1 max-w-sm mx-auto">
                {search
                  ? "No announcements matched your search criteria."
                  : `Create and post your first ${
                      activeTab === "draft" ? "draft" : "announcement"
                    } to notify your students.`}
              </p>
            </div>
          ) : (
            <>
              {/* CARDS VIEW */}
              <div
                className={`${
                  viewMode === "cards" ? "block" : "hidden"
                } p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}
              >
                {filteredAnnouncements.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-[#E4E7EC] p-5 flex flex-col justify-between hover:shadow-md hover:border-[#315CFF]/30 transition-all group gap-4"
                  >
                    <div className="space-y-3">
                      {/* Tags Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#315CFF]/10 text-[#315CFF] truncate max-w-[150px]">
                          {item.courseName || "General"}
                        </span>
                        <span className="text-xs text-[#667085] flex items-center gap-1 shrink-0 font-medium">
                          <CalendarOutlined className="text-[11px]" />
                          {dayjs(item.publishedAt || item.createdAt).format("DD MMM, YYYY")}
                        </span>
                      </div>

                      {/* Title & Batch */}
                      <div>
                        <h4
                          onClick={() => {
                            setActiveModalData(item);
                            setInfoModalOpen(true);
                          }}
                          className="font-bold text-sm text-[#101828] group-hover:text-[#315CFF] transition-colors line-clamp-1 cursor-pointer"
                        >
                          {item.title}
                        </h4>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F2F4F7] text-[#475467]">
                          Batch: {item.batchName || "All Cohorts"}
                        </span>
                      </div>

                      {/* Content Snippet */}
                      <p className="text-xs text-[#667085] line-clamp-3 leading-relaxed">
                        {stripHtml(item.message)}
                      </p>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="pt-3 border-t border-[#F2F4F7] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalData(item);
                          setInfoModalOpen(true);
                        }}
                        className="text-xs font-semibold text-[#315CFF] hover:text-[#2547D0] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <EyeOutlined className="text-xs" />
                        <span>View Details</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditData(item);
                            setPostModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#315CFF] hover:bg-[#315CFF]/10 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <EditOutlined className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteId(item._id);
                            setDeleteModalVisible(true);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <DeleteOutlined className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TABLE VIEW */}
              <div className={`${viewMode === "table" ? "block" : "hidden"}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-xs font-bold text-[#475467] uppercase tracking-wider">
                        <th className="py-3.5 px-5">Title & Message</th>
                        <th className="py-3.5 px-4">Course</th>
                        <th className="py-3.5 px-4">Cohort / Batch</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F4F7] text-sm">
                      {filteredAnnouncements.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-[#F8FAFC] transition-colors group"
                        >
                          <td className="py-4 px-5 max-w-[280px]">
                            <div className="space-y-0.5">
                              <span
                                onClick={() => {
                                  setActiveModalData(item);
                                  setInfoModalOpen(true);
                                }}
                                className="font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors line-clamp-1 cursor-pointer"
                              >
                                {item.title}
                              </span>
                              <p className="text-xs text-[#667085] line-clamp-1">
                                {stripHtml(item.message)}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#315CFF]/10 text-[#315CFF]">
                              {item.courseName || "General"}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-xs font-medium text-[#475467]">
                            {item.batchName || "All Cohorts"}
                          </td>

                          <td className="py-4 px-4 text-xs text-[#667085]">
                            <div className="flex items-center gap-1.5">
                              <CalendarOutlined className="text-[#98A2B3]" />
                              <span>
                                {dayjs(item.publishedAt || item.createdAt).format("DD MMM, YYYY")}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                item.status === "draft"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              }`}
                            >
                              {item.status === "draft" ? "Draft" : "Published"}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveModalData(item);
                                  setInfoModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-[#315CFF] hover:bg-[#315CFF]/10 rounded-lg transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <EyeOutlined className="text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditData(item);
                                  setPostModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-[#315CFF] hover:bg-[#315CFF]/10 rounded-lg transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <EditOutlined className="text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteId(item._id);
                                  setDeleteModalVisible(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <DeleteOutlined className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CENTERED PAGINATION BAR */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-[#F2F4F7] flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#475467] hover:bg-slate-100 border border-[#E4E7EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                    .map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                          page === p
                            ? "bg-[#315CFF] text-white shadow-xs"
                            : "bg-white text-[#475467] hover:bg-[#F8FAFC] border border-[#E4E7EC]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#475467] hover:bg-slate-100 border border-[#E4E7EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AnnouncementsManagerView;
