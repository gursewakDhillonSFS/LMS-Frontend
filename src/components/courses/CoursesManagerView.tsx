"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  FileDoneOutlined,
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  DeleteFilled,
  PlusOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { Dropdown, MenuProps } from "antd";

import { courseData, RequestedDemoProp } from "@/utils/interface";
import { Fallback } from "@/utils/images";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { RootState } from "@/redux/store";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import {
  resetCreateCourse,
  setCreateCourseData,
  setCourseFormData,
  updateCurrentStep,
} from "@/redux/slices/CreateCourseSlice";
import {
  getAllCoursesApi,
  deleteCourseApi,
  getCourseInfoApi,
  getDashboardStatsApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import { RequestedDemoCard } from "@/modules/instructorcourses/InstructorCoursesCards";
import CustomDropdown from "@/components/CustomDropdown";

const scheduleData: RequestedDemoProp[] = [
  {
    student: { name: "Floyd Miles", image: null },
    course: "Digital Marketing Specialist",
    timeSlot: "Monday 25 May 04:30 PM",
  },
  {
    student: { name: "Floyd Miles", image: null },
    course: "Digital Marketing Specialist",
    timeSlot: "Monday 25 May 04:30 PM",
  },
  {
    student: { name: "Savannah Nguyen", image: null },
    course: "UX/UI Design Fundamentals",
    timeSlot: "Tuesday 26 May 10:00 AM",
  },
  {
    student: { name: "Theresa Webb", image: null },
    course: "Data Analytics",
    timeSlot: "Wednesday 27 May 02:00 PM",
  },
  {
    student: { name: "Ronald Richards", image: null },
    course: "Machine Learning for Business",
    timeSlot: "Thursday 28 May 03:30 PM",
  },
];

interface CoursesManagerViewProps {
  rolePrefix?: string; // "" for instructor, "/teacher" for teacher
  createCoursePath: string;
  detailsPath: string;
}

export const CoursesManagerView: React.FC<CoursesManagerViewProps> = ({
  rolePrefix = "",
  createCoursePath,
  detailsPath,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );
  const fullName = useSelector(
    (state: RootState) => state.userdata?.full_name || "Instructor"
  );

  // Active tab: 'courses' | 'requested_demo'
  const [activeTab, setActiveTab] = useState<"courses" | "requested_demo">("courses");

  // Courses list state
  const [courses, setCourses] = useState<courseData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // KPI stats
  const [kpiStats, setKpiStats] = useState({
    courseCount: 0,
    studentCount: 0,
    upcomingLiveClasses: 0,
    pendingAssignmentsToGrade: 0,
  });

  // Fetch KPI stats
  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboardStatsApi();
        if (res?.status && res.data) {
          setKpiStats({
            courseCount: res.data.courseCount ?? 0,
            studentCount: res.data.studentCount ?? 0,
            upcomingLiveClasses: res.data.upcomingLiveClasses ?? 0,
            pendingAssignmentsToGrade: res.data.pendingAssignmentsToGrade ?? 0,
          });
        }
      } catch (err) {
        console.warn("Failed to fetch KPI stats for courses page:", err);
      }
    })();
  }, []);

  // Fetch Course Data
  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", String(limit));
      params.append("page", String(page));
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }

      const response = await getAllCoursesApi(params);
      if (response?.status === true) {
        setCourses(response?.data?.course_list || []);
        setTotal(response?.data?.total_courses || 0);
      }
    } catch (err) {
      console.error("Failed to fetch Courses:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, page, organization_id]);

  useEffect(() => {
    if (activeTab === "courses") {
      fetchCourseData();
    }
  }, [activeTab, page, fetchCourseData]);

  // Filtered courses based on search and status
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const nameMatch =
        !searchQuery ||
        c.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.head_teacher_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const status = (c.course_status || c.status || "").toLowerCase();
      const statusMatch =
        statusFilter === "all"
          ? true
          : statusFilter === "published"
            ? status === "published" || status === "publish"
            : status === "draft" || status === "unpublish";

      return nameMatch && statusMatch;
    });
  }, [courses, searchQuery, statusFilter]);

  // Course actions
  const handleRedirect = (value: courseData) => {
    router.push(detailsPath);
    dispatch(setCourseData(value));
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedCourseId(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourseId) return;
    setDeleteLoading(true);
    setActionLoading(true);
    try {
      const res = await deleteCourseApi(selectedCourseId);
      if (res?.status) {
        toast.success(res?.message || "Course deleted successfully!");
        setDeleteModalVisible(false);
        fetchCourseData();
      } else {
        toast.error(res?.message || "Failed to delete course.");
      }
    } catch (error) {
      toast.error("Error deleting course.");
    } finally {
      setDeleteLoading(false);
      setActionLoading(false);
    }
  };

  const handleEdit = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const response = await getCourseInfoApi(id);
      if (response?.status && response?.data) {
        const c = response.data;
        dispatch(resetCreateCourse());
        dispatch(setCreateCourseData(c.course_id));

        dispatch(
          setCourseFormData({
            course_name: c.course_name,
            head_teacher: c.head_teacher_id,
            duration: c.course_duration,
            course_type: c.course_price === 0 ? "free" : "paid",
            course_price: c.course_price,
            demo_class: c.demo_classes ?? false,
            category_id: c.category_id,
            course_schedule: c.course_schedule,
            live_classes: c.live_classes,
            about_course: c.about_course,
            instructor_id: c.instructor_id,
            description: c.description,
            learning_points: c.course_learning_points || [],
            skills_you_gain: c.skills_you_gain || [],
            course_image_url: c.course_image_url,
            batch: c.batch || [],
            overview: c.overview,
            teacher_revenue_percent: c.teacherRevenuePercent ?? 20,
          })
        );

        dispatch(updateCurrentStep(0));
        router.push(createCoursePath);
      } else {
        toast.error("Failed to load course data for editing.");
      }
    } catch (err) {
      toast.error("Failed to fetch course info.");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper for more options dropdown
  const getMoreActions = (course: courseData): MenuProps["items"] => [
    {
      key: "view",
      label: "View Course Details",
      onClick: () => handleRedirect(course),
    },
    {
      key: "edit",
      label: "Edit Course",
      onClick: (e) => handleEdit(e.domEvent as any, course.course_id),
    },
    {
      key: "delete",
      danger: true,
      label: "Delete Course",
      onClick: (e) => handleDeleteClick(e.domEvent as any, course.course_id),
    },
  ];

  // Dynamic KPI cards
  const kpis = [
    {
      title: "Total Courses",
      value: kpiStats.courseCount || total,
      delta: "+12%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <BookOutlined className="text-lg" />,
      colorClass: "text-[#315CFF] bg-blue-50 border-blue-100",
    },
    {
      title: "Enrolled Students",
      value: kpiStats.studentCount,
      delta: "+18%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <TeamOutlined className="text-lg" />,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Upcoming Live Classes",
      value: kpiStats.upcomingLiveClasses,
      delta: "0%",
      deltaType: "neutral" as const,
      period: "vs. last 30 days",
      icon: <VideoCameraOutlined className="text-lg" />,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Pending to Grade",
      value: kpiStats.pendingAssignmentsToGrade,
      delta: "0%",
      deltaType: "neutral" as const,
      period: "vs. last 30 days",
      icon: <FileDoneOutlined className="text-lg" />,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <>
      {deleteModalVisible && (
        <ConfirmationModal
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          onSubmit={handleConfirmDelete}
          loading={deleteLoading}
          title="Delete Course"
          description="Are you sure you want to permanently delete this course? This action cannot be undone."
          iconBG="#FB4A49"
          icon={<DeleteFilled className="text-3xl text-white" />}
        />
      )}

      <div className="w-full flex flex-col gap-6 pb-12 animate-fadeIn">
        {/* 1. 4 KPI Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {kpis.map((card, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#E4E7EC] shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${card.colorClass}`}
                >
                  {card.icon}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#475467] tracking-tight">
                  {card.title}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
                  {card.value.toLocaleString()}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${card.deltaType === "positive"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                  >
                    {card.deltaType === "positive" && (
                      <ArrowUpOutlined className="text-[9px]" />
                    )}
                    {card.delta}
                  </span>
                  <span className="text-[11px] text-[#667085] hidden xl:inline-block">
                    {card.period}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Top Pill Switcher: Courses | Requested Demo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === "courses"
                ? "bg-[#315CFF] text-white shadow-xs"
                : "bg-white text-[#475467] hover:bg-[#F8FAFC] border border-[#E4E7EC]"
              }`}
          >
            Courses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("requested_demo")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === "requested_demo"
                ? "bg-[#315CFF] text-white shadow-xs"
                : "bg-white text-[#475467] hover:bg-[#F8FAFC] border border-[#E4E7EC]"
              }`}
          >
            Requested Demo
          </button>
        </div>

        {/* 3. Tab Content */}
        {activeTab === "courses" && (
          <div className="w-full bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden flex flex-col">
            {/* Toolbar Header */}
            <div className="p-4 sm:p-5 border-b border-[#F2F4F7] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Section Title & Count Badge */}
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-[#101828] tracking-tight">
                  All Courses
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475467] border border-[#E4E7EC]">
                  {total} {total === 1 ? "course" : "courses"}
                </span>
              </div>

              {/* Right: Search, Filter Dropdown, View Switcher, and + Create Course CTA */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Instant Search Bar */}
                <div className="relative flex items-center min-w-[190px] sm:min-w-[220px]">
                  <SearchOutlined className="absolute left-3 text-[#98A2B3] text-sm pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#315CFF] transition-all shadow-xs"
                  />
                </div>

                {/* Custom Popup Status Dropdown */}
                <CustomDropdown
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val as any)}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Published", value: "published" },
                    { label: "Draft / Unpublish", value: "draft" },
                  ]}
                />

                {/* View Mode Toggle */}
                <div className="flex items-center p-0.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC]">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    aria-label="Table View"
                    title="Table View"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${viewMode === "table" || viewMode === "auto"
                        ? "bg-white text-[#315CFF] shadow-xs"
                        : "text-[#667085] hover:text-[#101828]"
                      }`}
                  >
                    <TableOutlined className="text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    aria-label="Cards View"
                    title="Cards View"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${viewMode === "cards"
                        ? "bg-white text-[#315CFF] shadow-xs"
                        : "text-[#667085] hover:text-[#101828]"
                      }`}
                  >
                    <AppstoreOutlined className="text-sm" />
                  </button>
                </div>

                {/* Primary Action: + Create Course */}
                <button
                  type="button"
                  onClick={() => {
                    dispatch(resetCreateCourse());
                    router.push(createCoursePath);
                  }}
                  className="h-9 px-4 rounded-xl bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-[0_2px_8px_rgba(49,92,255,0.25)] transition-all cursor-pointer shrink-0"
                >
                  <PlusOutlined className="text-xs" />
                  <span>Create Course</span>
                </button>
              </div>
            </div>

            {/* Content Display: Loading / Empty / Table / Cards */}
            {loading ? (
              <div className="p-8 flex flex-col gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-full rounded-xl bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#315CFF] flex items-center justify-center text-2xl border border-blue-100">
                  <BookOutlined />
                </div>
                <h3 className="text-base font-bold text-[#101828]">No courses found</h3>
                <p className="text-xs text-[#667085] max-w-sm">
                  {searchQuery || statusFilter !== "all"
                    ? "No courses match your current search or status filter. Try clearing filters."
                    : "You have not created any courses yet. Get started by clicking Create Course."}
                </p>
                {searchQuery || statusFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="mt-2 text-xs font-semibold text-[#315CFF] hover:underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push(createCoursePath)}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#315CFF] text-white text-xs font-semibold shadow-xs hover:bg-[#254BD1] cursor-pointer"
                  >
                    + Create First Course
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* 4A. Desktop / Large Screen: Modern Table View */}
                <div
                  className={`w-full overflow-x-auto ${viewMode === "cards"
                      ? "hidden"
                      : viewMode === "table"
                        ? "block"
                        : "hidden lg:block"
                    }`}
                >
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#F2F4F7] bg-[#F8FAFC]/70">
                        <th className="py-3.5 px-5 text-xs font-semibold text-[#667085] tracking-tight">
                          Course
                        </th>
                        <th className="py-3.5 px-4 text-xs font-semibold text-[#667085] tracking-tight">
                          Students
                        </th>
                        <th className="py-3.5 px-4 text-xs font-semibold text-[#667085] tracking-tight">
                          Head Teacher
                        </th>
                        <th className="py-3.5 px-4 text-xs font-semibold text-[#667085] tracking-tight">
                          Created Date
                        </th>
                        <th className="py-3.5 px-4 text-xs font-semibold text-[#667085] tracking-tight">
                          Live Classes
                        </th>
                        <th className="py-3.5 px-4 text-xs font-semibold text-[#667085] tracking-tight">
                          Status
                        </th>
                        <th className="py-3.5 px-5 text-xs font-semibold text-[#667085] tracking-tight text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F4F7]">
                      {filteredCourses.map((item, index) => {
                        const isPublished =
                          (item.course_status || item.status || "").toLowerCase() ===
                          "published" ||
                          (item.course_status || item.status || "").toLowerCase() ===
                          "publish";

                        const createdDate = item.created_at
                          ? item.created_at.split("T")[0]
                          : "2026-09-08";

                        const teacherName =
                          item.head_teacher_name || item.instructor_name || fullName;

                        const imgUrl =
                          !imgErrors[item.course_id] &&
                            isValidUrl(getImageUrl(item.course_image_url))
                            ? getImageUrl(item.course_image_url)
                            : Fallback;

                        return (
                          <tr
                            key={item.course_id || index}
                            onClick={() => handleRedirect(item)}
                            className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                          >
                            {/* Course (Thumbnail + Title + Category) */}
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3 min-w-[240px] max-w-[320px]">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-[#E4E7EC] shrink-0">
                                  <Image
                                    src={imgUrl}
                                    alt={item.course_name || "Course"}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={() =>
                                      setImgErrors((prev) => ({
                                        ...prev,
                                        [item.course_id]: true,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                                    {item.course_name}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-[#667085] truncate">
                                      {item.category_name || "Web Development"}
                                    </span>
                                    {index === 0 && (
                                      <span className="inline-flex items-center text-[10px] font-bold text-[#315CFF] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                        ★ Featured
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Students */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#344054]">
                                <UserOutlined className="text-xs text-[#98A2B3]" />
                                <span>{item.enrolled_user_count ?? 0}</span>
                              </div>
                            </td>

                            {/* Head Teacher */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <UserAvatarDisplay
                                  showNameNextToAvatar={false}
                                  user={{
                                    name: teacherName,
                                    image: item.head_teacher_image_url,
                                  }}
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs sm:text-sm font-semibold text-[#101828]">
                                    {teacherName}
                                  </span>
                                  <span className="text-[11px] text-[#667085]">
                                    Instructor
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Created Date */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#475467] font-medium">
                                <CalendarOutlined className="text-xs text-[#98A2B3]" />
                                <span>{createdDate}</span>
                              </div>
                            </td>

                            {/* Live Classes */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-xs sm:text-sm font-medium text-[#344054]">
                              {item.live_class ? "Yes" : "No"}
                            </td>

                            {/* Status Pill Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {isPublished ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircleFilled className="text-[10px]" />
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                  <CloseCircleFilled className="text-[10px]" />
                                  Unpublish
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Dropdown
                                  menu={{ items: getMoreActions(item) }}
                                  trigger={["click"]}
                                  placement="bottomRight"
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:text-[#101828] hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="More Options"
                                  >
                                    <MoreOutlined className="text-base" />
                                  </button>
                                </Dropdown>

                                <button
                                  type="button"
                                  onClick={(e) => handleEdit(e, item.course_id)}
                                  disabled={actionLoading}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#315CFF] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Edit Course"
                                >
                                  <EditOutlined className="text-sm" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteClick(e, item.course_id)}
                                  disabled={actionLoading}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Delete Course"
                                >
                                  <DeleteOutlined className="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 4B. Mobile / Small Screen: Responsive Course Cards */}
                <div
                  className={`w-full p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${viewMode === "table"
                      ? "hidden"
                      : viewMode === "cards"
                        ? "grid"
                        : "grid lg:hidden"
                    }`}
                >
                  {filteredCourses.map((item, index) => {
                    const isPublished =
                      (item.course_status || item.status || "").toLowerCase() ===
                      "published" ||
                      (item.course_status || item.status || "").toLowerCase() ===
                      "publish";

                    const createdDate = item.created_at
                      ? item.created_at.split("T")[0]
                      : "2026-09-08";

                    const teacherName =
                      item.head_teacher_name || item.instructor_name || fullName;

                    const imgUrl =
                      !imgErrors[item.course_id] &&
                        isValidUrl(getImageUrl(item.course_image_url))
                        ? getImageUrl(item.course_image_url)
                        : Fallback;

                    return (
                      <div
                        key={item.course_id || index}
                        onClick={() => handleRedirect(item)}
                        className="bg-white rounded-2xl border border-[#E4E7EC] hover:border-[#D0D5DD] shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between gap-3 cursor-pointer group"
                      >
                        {/* Card Top: Thumbnail + Title + Status */}
                        <div className="flex items-start gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-[#E4E7EC] shrink-0">
                            <Image
                              src={imgUrl}
                              alt={item.course_name || "Course"}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={() =>
                                setImgErrors((prev) => ({
                                  ...prev,
                                  [item.course_id]: true,
                                }))
                              }
                            />
                          </div>

                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-[#667085] truncate font-medium">
                                {item.category_name || "Web Development"}
                              </span>
                              {isPublished ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                  Unpublish
                                </span>
                              )}
                            </div>

                            <h3 className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors line-clamp-2 mt-0.5 leading-snug">
                              {item.course_name}
                            </h3>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#F2F4F7]" />

                        {/* Card Meta 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-[#475467]">
                          <div className="flex items-center gap-1.5 truncate">
                            <TeamOutlined className="text-[#98A2B3] text-xs shrink-0" />
                            <span className="truncate">
                              {item.enrolled_user_count ?? 0} Students
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <CalendarOutlined className="text-[#98A2B3] text-xs shrink-0" />
                            <span className="truncate">{createdDate}</span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <UserOutlined className="text-[#98A2B3] text-xs shrink-0" />
                            <span className="truncate">{teacherName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <VideoCameraOutlined className="text-[#98A2B3] text-xs shrink-0" />
                            <span className="truncate">
                              Live: {item.live_class ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer: View Details & Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F2F4F7] mt-1">
                          <span className="text-xs font-bold text-[#315CFF] group-hover:underline">
                            View Details →
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleEdit(e, item.course_id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#315CFF] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                              title="Edit Course"
                            >
                              <EditOutlined className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteClick(e, item.course_id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Delete Course"
                            >
                              <DeleteOutlined className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4C. Centered Pagination Bar (< 1 2 3 >) */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-[#F2F4F7] flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#475467] hover:bg-slate-100 border border-[#E4E7EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${page === p
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#475467] hover:bg-slate-100 border border-[#E4E7EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 5. Requested Demo Tab Content */}
        {activeTab === "requested_demo" && (
          <div className="flex flex-col gap-3">
            {scheduleData.map((item, index) => (
              <RequestedDemoCard data={item} key={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CoursesManagerView;
