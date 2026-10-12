"use client";

import CommonButton from "@/components/CommonButton";
import CourseBatchModal from "@/components/modal/CourseBatchModal";
import ReviewContainer from "@/components/ReviewContainer";
import { setSignin, setSignup } from "@/redux/slices/AuthModalSlice";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import { RootState } from "@/redux/store";
import {
  addToFavorite,
  getCourseInfoApi,
  removeFromFavorite,
  purchaseCourseApi,
  getLessonsWithSublessonsApi,
} from "@/services/collections";
import PurchaseModal from "@/components/PurchaseModal";
import { formatLabel, getImageUrl, isValidUrl, getCategoryName, formatMediaDuration, materialKindLabel } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { Fallback } from "@/utils/images";
import { courseData, CourseInfoDataProp } from "@/utils/interface";
import {
  HeartFilled,
  StarFilled,
  PlayCircleFilled,
  CheckCircleFilled,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  RightOutlined,
  TeamOutlined,
  LoadingOutlined,
  LockOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  FilePdfOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Skeleton } from "antd";
import Image from "next/image";
import QuillEditor from "@/components/QuillEditor";
import { usePathname, useRouter } from "next/navigation";
import TeacherDetailsModal from "@/components/modal/TeacherDetailsModal";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";
import Link from "next/link";

interface CourseInfoProp {
  isExplore?: boolean;
  handleCheckoutRedirect?: () => void;
}

const CourseInfo: React.FC<CourseInfoProp> = ({
  isExplore = false,
  handleCheckoutRedirect,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "instructor" | "reviews">("overview");
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isExpandedTeacher, setIsExpandedTeacher] = useState(false);
  const [coursesInfo, setCoursesInfo] = useState<CourseInfoDataProp>();
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [totalWeeks, setTotalWeeks] = useState<number>(4);
  const Subscribed = coursesInfo?.enrolled_status || false;
  const [loading, setLoading] = useState(true);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [batch, setBatch] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const overviewRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const instructorRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const selectedCourseData = useSelector(
    (state: RootState) => state?.courseData?.course
  );
  const categories = useSelector(
    (state: RootState) => state?.categories?.categories
  );

  const isLoggedIn = Boolean(
    useSelector((state: RootState) => state.userdata?.access_token)
  );
  const privateDetailPath = pathname?.includes("/dashboard")
    ? `${RoutePaths.Dashboard}/course-detail`
    : pathname?.includes("/my-explore") || isLoggedIn
      ? `${RoutePaths.MyExplore}/course-detail`
      : "";

  const courseRedirect = (value: courseData | undefined) => {
    dispatch(setCourseData(value));
    router.push(privateDetailPath || `${RoutePaths.Browse}/course-details`);
  };

  const listingPath = pathname?.includes("/dashboard")
    ? RoutePaths.Dashboard
    : pathname?.includes("/my-explore") || isLoggedIn
      ? RoutePaths.MyExplore
      : RoutePaths.Browse;

  const courseImageUrl = getImageUrl(selectedCourseData?.course_image_url || coursesInfo?.course_image_url);

  const fetchCourseInfo = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedCourseData?.course_id) {
        const [response, lessonsRes] = await Promise.all([
          getCourseInfoApi(selectedCourseData?.course_id),
          getLessonsWithSublessonsApi(selectedCourseData?.course_id).catch(() => null),
        ]);
        if (response) {
          setCoursesInfo(response?.data);
        }
        if (lessonsRes?.status && lessonsRes?.data) {
          const lList = lessonsRes.data.lessons || [];
          setCourseLessons(lList);
          const computedWeeks =
            lessonsRes.data.total_weeks ||
            response?.data?.total_weeks ||
            Math.max(1, ...lList.map((l: any) => l.week || 1));
          setTotalWeeks(computedWeeks || 4);
        }
      }
    } catch (err) {
      console.log(err || "Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  }, [selectedCourseData?.course_id]);

  const handleAddFavorite = async () => {
    if (selectedCourseData?.course_id) {
      const payload = {
        course_id: selectedCourseData?.course_id,
        favorite: true,
      };
      try {
        setFavLoading(true);
        const res = await addToFavorite(payload);
        if (res.status) {
          toast.success(res.message);
          setCoursesInfo((prev) => (prev ? { ...prev, favorite: true } : prev));
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setFavLoading(false);
      }
    }
  };

  const handleRemoveFavorite = async () => {
    if (selectedCourseData?.course_id) {
      const param = new URLSearchParams();
      param.append("course_id", selectedCourseData?.course_id);
      try {
        setFavLoading(true);
        const res = await removeFromFavorite(param);
        if (res.status) {
          toast.success(res.message);
          setCoursesInfo((prev) => (prev ? { ...prev, favorite: false } : prev));
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setFavLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCourseInfo();
  }, [fetchCourseInfo, selectedCourseData]);

  const handleStartFree = async (batchId?: string) => {
    if (!isExplore) {
      dispatch(setSignin(true));
      return;
    }

    if (!batchId && coursesInfo?.batch && coursesInfo.batch.length > 0) {
      setBatch(true);
      return;
    }

    try {
      const res: any = await purchaseCourseApi({
        course_id: coursesInfo?.course_id || selectedCourseData?.course_id || "",
        batch_id: batchId,
      });
      if (res?.status) {
        toast.success(res?.message || "Successfully enrolled in the free course!");
        setBatch(false);
        router.push(RoutePaths.MyCourses);
      } else {
        toast.error(res?.message || "Enrollment failed.");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const scrollToSection = (tab: "overview" | "curriculum" | "instructor" | "reviews") => {
    setActiveTab(tab);
    let targetRef = overviewRef;
    if (tab === "curriculum") targetRef = curriculumRef;
    if (tab === "instructor") targetRef = instructorRef;
    if (tab === "reviews") targetRef = reviewsRef;

    if (targetRef.current) {
      const yOffset = -90;
      const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const curriculumMaterials = courseLessons.flatMap((lesson: any) => [
    ...(lesson.studyMaterials || []),
    ...((lesson.sublessons || []).flatMap((sub: any) => sub.studyMaterials || [])),
  ]);
  const countByType = (type: string) =>
    curriculumMaterials.filter((item: any) => (item.file_type || "").toLowerCase() === type).length;
  const videoCount = countByType("video");
  const audioCount = countByType("audio");
  const pdfCount = countByType("pdf");
  const documentCount = countByType("document") + countByType("file") + countByType("image");
  const mediaSeconds = curriculumMaterials.reduce((sum: number, item: any) => {
    const kind = (item.file_type || "").toLowerCase();
    if (kind !== "video" && kind !== "audio") return sum;
    return sum + (Number(item.duration_seconds) || 0);
  }, 0);
  const includeItems = [
    courseLessons.length > 0
      ? `${courseLessons.length} ${courseLessons.length === 1 ? "lesson" : "lessons"}`
      : "",
    videoCount > 0 ? `${videoCount} video ${videoCount === 1 ? "lesson" : "lessons"}` : "",
    audioCount > 0 ? `${audioCount} audio ${audioCount === 1 ? "file" : "files"}` : "",
    pdfCount > 0 ? `${pdfCount} PDF ${pdfCount === 1 ? "resource" : "resources"}` : "",
    documentCount > 0 ? `${documentCount} downloadable ${documentCount === 1 ? "file" : "files"}` : "",
    mediaSeconds > 0 ? `${formatMediaDuration(mediaSeconds)} of video and audio` : "",
    coursesInfo?.live_classes ? "Live classes included" : "",
  ].filter(Boolean);

  const teacherId = coursesInfo?.head_teacher_id || (coursesInfo as any)?.instructor_id;

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-[#0F172A]">
      <CourseBatchModal
        open={batch}
        onClose={() => setBatch(false)}
        centered={true}
        batches={coursesInfo?.batch}
        onSubmit={(batchId) => {
          if (coursesInfo?.course_price === 0 || coursesInfo?.course_type === "Free") {
            handleStartFree(batchId);
          }
        }}
      />

      {/* Hero Header Area */}
      <section className="bg-gradient-to-b from-[#EEF4FF]/70 via-[#F8FAFF] to-[#FAFBFD] border-b border-slate-200/70 pt-6 pb-12 px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Category Pill & Favorite */}
              <div className="flex items-center justify-between gap-3">
                {coursesInfo?.category_name ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#4F46E5]/20 text-[#4F46E5] text-xs font-semibold">
                    <BookOutlined className="text-xs" />
                    <span>{coursesInfo.category_name}</span>
                  </div>
                ) : (
                  <span />
                )}

                {isExplore && (
                  <button
                    type="button"
                    onClick={coursesInfo?.favorite ? handleRemoveFavorite : handleAddFavorite}
                    disabled={favLoading}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                      coursesInfo?.favorite
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900"
                    } ${favLoading ? "cursor-wait opacity-80" : ""}`}
                  >
                    {favLoading ? (
                      <LoadingOutlined className="animate-spin text-xs" />
                    ) : (
                      <HeartFilled className={coursesInfo?.favorite ? "text-rose-500" : "text-slate-400"} />
                    )}
                    <span>{coursesInfo?.favorite ? "Saved" : "Save Course"}</span>
                  </button>
                )}
              </div>

              {/* Course Title */}
              {loading ? (
                <Skeleton.Input active className="!w-full !h-12" />
              ) : (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-extrabold text-[#0F172A] tracking-tight leading-[1.2]">
                  {coursesInfo?.course_name || selectedCourseData?.course_name}
                </h1>
              )}

              {/* Tagline / Subtitle */}
              {loading ? (
                <Skeleton paragraph={{ rows: 2 }} active />
              ) : (
                <div className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  {coursesInfo?.description ? (
                    <QuillEditor readOnly value={coursesInfo.description} />
                  ) : null}
                </div>
              )}

              {/* CTA Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {coursesInfo?.course_price === 0 || coursesInfo?.course_type === "Free" ? (
                  <CommonButton
                    text={Subscribed ? "Start Course" : "Enroll for Free"}
                    className="!h-11 sm:!h-12 !px-6 !text-sm !font-bold !rounded-xl !bg-[#4F46E5] hover:!bg-[#4338CA] !text-white shadow-md hover:shadow-lg transition-all"
                    onClick={
                      Subscribed
                        ? () => router.push(RoutePaths.MyCourses)
                        : () => handleStartFree()
                    }
                  />
                ) : (
                  <CommonButton
                    text={
                      Subscribed
                        ? "Start Course"
                        : `Buy Course — $${coursesInfo?.course_price ?? selectedCourseData?.course_price ?? 0}`
                    }
                    className="!h-11 sm:!h-12 !px-6 !text-sm !font-bold !rounded-xl !bg-[#4F46E5] hover:!bg-[#4338CA] !text-white shadow-md hover:shadow-lg transition-all"
                    onClick={
                      Subscribed
                        ? () => router.push(RoutePaths.MyCourses)
                        : () => {
                            if (isExplore) setPurchaseModalOpen(true);
                            else dispatch(setSignin(true));
                          }
                    }
                  />
                )}
              </div>

              {/* Social Proof Row */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <TeamOutlined className="text-slate-400 text-sm" />
                  <span>
                    <strong className="text-slate-800 font-bold">
                      {coursesInfo?.enrolled_user_count ?? 0}
                    </strong>{" "}
                    already enrolled
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Right Media Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-none rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_12px_36px_rgba(79,70,229,0.08)] group">
                <div className="relative aspect-video w-full bg-slate-900">
                  <Image
                    src={
                      isValidUrl(courseImageUrl) && !imgError
                        ? courseImageUrl
                        : Fallback
                    }
                    alt={coursesInfo?.course_name ? `${coursesInfo.course_name} syllabus preview` : "SkillBuild course curriculum preview"}
                    fill
                    priority
                    unoptimized
                    onError={() => setImgError(true)}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Metric Cards Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Rating */}
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/60">
              <StarFilled className="text-lg" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 leading-tight">
                {coursesInfo?.review_count ? coursesInfo.average_rating?.toFixed(1) : "—"}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {coursesInfo?.review_count
                  ? `(${coursesInfo.review_count} reviews)`
                  : "No reviews yet"}
              </div>
            </div>
          </div>

          {/* Level */}
          <div className="flex items-center gap-3.5 p-2 pt-4 md:pt-2 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0 border border-indigo-200/60">
              <TrophyOutlined className="text-lg" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight capitalize">
                {formatLabel(coursesInfo?.course_level) || "Not set"}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Course level
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-3.5 p-2 pt-4 md:pt-2 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
              <ClockCircleOutlined className="text-lg" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight capitalize">
                {formatLabel(coursesInfo?.course_duration) || "Not set"}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Duration of the course
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-3.5 p-2 pt-4 md:pt-2 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <ClockCircleOutlined className="text-lg" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight capitalize">
                {formatLabel(coursesInfo?.course_schedule) || "Not set"}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Learn on your schedule
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-8 overflow-x-auto scrollbar-hide">
          {(
            [
              { key: "overview", label: "Overview" },
              { key: "curriculum", label: "Curriculum" },
              { key: "instructor", label: "Instructor" },
              { key: "reviews", label: "Reviews" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => scrollToSection(tab.key)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column Content (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* What you'll learn */}
            <section
              ref={curriculumRef}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-lg">🎯</span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  What you&apos;ll learn
                </h2>
              </div>

              {loading ? (
                <Skeleton paragraph={{ rows: 3 }} active />
              ) : coursesInfo?.course_learning_points?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {coursesInfo.course_learning_points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircleFilled className="text-[#4F46E5] text-base shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Learning outcomes have not been added for this course yet.</p>
              )}
            </section>

            {/* Course Curriculum Week-by-Week */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📚</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Course Curriculum & Weekly Schedule
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Structured across {totalWeeks} weeks of practical learning
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-[#4F46E5] text-xs font-bold">
                  {courseLessons.length} {courseLessons.length === 1 ? "Lesson" : "Lessons"}
                </span>
              </div>

              {loading ? (
                <Skeleton paragraph={{ rows: 4 }} active />
              ) : courseLessons.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Curriculum syllabus is currently being finalized by the instructor.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: totalWeeks }, (_, idx) => idx + 1).map((weekNum) => {
                    const weekLessons = (courseLessons || []).filter(
                      (l: any) => (l.week || 1) === weekNum
                    );

                    return (
                      <div
                        key={weekNum}
                        className="rounded-xl border border-slate-200/70 overflow-hidden bg-white"
                      >
                        <div className="bg-slate-50/80 p-3.5 flex items-center justify-between border-b border-slate-200/60">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#4F46E5] text-white font-bold text-xs uppercase tracking-wider">
                              Week {weekNum}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              {weekLessons.length} {weekLessons.length === 1 ? "Lesson" : "Lessons"}
                            </span>
                          </div>
                        </div>

                        {weekLessons.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 italic">
                            No lessons listed for this week.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {weekLessons.map((l: any, i: number) => (
                              <div
                                key={l.lesson_id || i}
                                className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    {i + 1}
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <h4 className="text-sm font-bold text-slate-900">
                                      {l.lesson_name}
                                    </h4>
                                    {l.lesson_description && (
                                      <p className="text-xs text-slate-500 line-clamp-1">
                                        {l.lesson_description.replace(/<[^>]+>/g, "")}
                                      </p>
                                    )}
                                    <div className="flex flex-col gap-1.5 mt-2">
                                      {[
                                        ...(l.studyMaterials || []),
                                        ...((l.sublessons || []).flatMap((s: any) => s.studyMaterials || [])),
                                      ].map((material: any, materialIndex: number) => {
                                        const kind = (material.file_type || "").toLowerCase();
                                        const durationLabel =
                                          kind === "video" || kind === "audio"
                                            ? formatMediaDuration(material.duration_seconds)
                                            : "";
                                        return (
                                          <span
                                            key={`${material.file_url || material.file_name}-${materialIndex}`}
                                            className="inline-flex items-center gap-1.5 text-[11px] text-slate-500"
                                          >
                                            {kind === "video" ? (
                                              <PlayCircleFilled className="text-[#4F46E5]" />
                                            ) : kind === "audio" ? (
                                              <CustomerServiceOutlined className="text-[#4F46E5]" />
                                            ) : kind === "pdf" ? (
                                              <FilePdfOutlined className="text-[#4F46E5]" />
                                            ) : (
                                              <FileTextOutlined className="text-[#4F46E5]" />
                                            )}
                                            <span>{material.file_name || materialKindLabel(kind)}</span>
                                            <span className="text-slate-300">•</span>
                                            <span>{materialKindLabel(kind)}</span>
                                            {durationLabel ? (
                                              <>
                                                <span className="text-slate-300">•</span>
                                                <span>{durationLabel}</span>
                                              </>
                                            ) : null}
                                          </span>
                                        );
                                      })}
                                      {l.sublessons?.length > 0 && (
                                        <span className="text-[11px] text-slate-400">
                                          {l.sublessons.length} sub-topics
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  <LockOutlined className="text-[10px]" />
                                  <span>Enrolled</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* About this course */}
            <section
              ref={overviewRef}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📦</span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  About this course
                </h2>
              </div>

              {loading ? (
                <Skeleton paragraph={{ rows: 4 }} active />
              ) : (
                <div className="flex flex-col gap-4">
                  <div
                    className={`text-sm text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ${
                      isExpanded ? "" : "max-h-28"
                    }`}
                  >
                    {coursesInfo?.about_course ? (
                      <QuillEditor readOnly value={coursesInfo.about_course} />
                    ) : (
                      <p>No course overview has been added yet.</p>
                    )}
                  </div>

                  {(coursesInfo?.about_course?.length ?? 0) > 180 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] hover:underline self-start cursor-pointer"
                    >
                      {isExpanded ? "See Less" : "See More"}
                    </button>
                  )}

                </div>
              )}
            </section>

            {/* Meet your teacher */}
            <section
              ref={instructorRef}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-lg">👔</span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Meet your teacher
                </h2>
              </div>

              {loading ? (
                <Skeleton avatar paragraph={{ rows: 2 }} active />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-[#EEF2FF] bg-slate-100 flex items-center justify-center">
                        {isValidUrl(coursesInfo?.head_teacher_image_url || coursesInfo?.course_instructor_image_url || "") ? (
                          <Image
                            src={coursesInfo?.head_teacher_image_url || coursesInfo?.course_instructor_image_url || ""}
                            alt={coursesInfo?.head_teacher_name || "Instructor"}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <UserOutlined className="text-xl text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {coursesInfo?.head_teacher_name || coursesInfo?.course_instructor || "Instructor not assigned"}
                        </h4>
                        {(coursesInfo as any)?.head_teacher_qualification && (
                          <p className="text-xs text-slate-500 font-medium">
                            {(coursesInfo as any).head_teacher_qualification}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const teacherId = coursesInfo?.head_teacher_id || (coursesInfo as any)?.instructor_id;
                        if (!teacherId) {
                          toast.info("Instructor profile is not available yet.");
                          return;
                        }
                        setTeacherModalOpen(true);
                      }}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#4F46E5] hover:border-[#4F46E5] transition-colors cursor-pointer"
                    >
                      <span>View Profile</span>
                      <RightOutlined className="text-[10px]" />
                    </button>
                  </div>

                  {coursesInfo?.meet_your_teacher &&
                    coursesInfo.meet_your_teacher !== coursesInfo.head_teacher_name &&
                    coursesInfo.meet_your_teacher !== (coursesInfo as any)?.head_teacher_qualification && (
                  <div
                    className={`text-sm text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ${
                      isExpandedTeacher ? "" : "max-h-24"
                    }`}
                  >
                    <QuillEditor readOnly value={coursesInfo.meet_your_teacher} />
                  </div>
                  )}

                  {(coursesInfo?.meet_your_teacher?.length ?? 0) > 160 && (
                    <button
                      onClick={() => setIsExpandedTeacher(!isExpandedTeacher)}
                      className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] hover:underline self-start cursor-pointer"
                    >
                      {isExpandedTeacher ? "See Less" : "See More"}
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Skills you'll gain */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-lg">💡</span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Skills you&apos;ll gain
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {coursesInfo?.skills_you_gain?.length ? (
                  coursesInfo.skills_you_gain.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No skills have been listed for this course yet.</p>
                )}
              </div>
            </section>

            {/* Learner Reviews */}
            <section
              ref={reviewsRef}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <ReviewContainer />
            </section>
          </div>

          {/* Right Column Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            {/* Card 1: Course Includes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOutlined className="text-[#4F46E5]" />
                <span>Course Includes</span>
              </h3>

              {includeItems.length > 0 ? (
                <ul className="flex flex-col gap-3 text-xs sm:text-sm text-slate-600">
                  {includeItems.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircleFilled className="text-[#4F46E5]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Course materials will appear here once the instructor uploads them.</p>
              )}
            </div>

            {/* Card 2: Featured Related Course */}
            {coursesInfo?.related_courses?.[0] && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Related Course
                  </h4>
                  <Link
                    href={listingPath}
                    className="text-xs font-semibold text-[#4F46E5] hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div
                  onClick={() => courseRedirect(coursesInfo?.related_courses?.[0])}
                  className="group cursor-pointer flex flex-col gap-2.5"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                    <Image
                      src={
                        coursesInfo.related_courses[0].course_image_url
                          ? getImageUrl(coursesInfo.related_courses[0].course_image_url)
                          : Fallback
                      }
                      alt={coursesInfo.related_courses[0].course_name || "Related course"}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#4F46E5] uppercase">
                    {getCategoryName(categories, coursesInfo.related_courses[0].category_id) || coursesInfo.related_courses[0].category_name || "Course"}
                  </span>
                  <h5 className="text-sm font-bold text-slate-900 group-hover:text-[#4F46E5] transition-colors line-clamp-1">
                    {coursesInfo.related_courses[0].course_name}
                  </h5>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <StarFilled /> {Number(coursesInfo.related_courses[0].average_rating) > 0 ? coursesInfo.related_courses[0].average_rating?.toFixed(1) : "New"}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {coursesInfo.related_courses[0].course_price ? `$${coursesInfo.related_courses[0].course_price}` : "Free"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Promo / CTA Banner — public pages only */}
            {!isExplore && (
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E293B] text-white shadow-lg flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-xl">
                <BookOutlined />
              </div>
              <h4 className="text-base font-bold text-white">
                Learn at Your Own Pace
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Get lifetime access to this course and earn your certificate.
              </p>
              {!Subscribed && (
                <button
                  onClick={() => {
                    if (isExplore) setPurchaseModalOpen(true);
                    else dispatch(setSignin(true));
                  }}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Buy Course Now →
                </button>
              )}
            </div>
            )}

            {/* Card 4: You May Also Like */}
            {coursesInfo?.related_courses && coursesInfo.related_courses.length > 1 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    You May Also Like
                  </h4>
                  <Link
                    href={listingPath}
                    className="text-xs font-semibold text-[#4F46E5] hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  {coursesInfo.related_courses.slice(1, 4).map((course) => (
                    <div
                      key={course.course_id}
                      onClick={() => courseRedirect(course)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <Image
                          src={
                            course.course_image_url
                              ? getImageUrl(course.course_image_url)
                              : Fallback
                          }
                          alt={course.course_name || "Course preview"}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#4F46E5] transition-colors truncate">
                          {course.course_name}
                        </h5>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                            <StarFilled className="text-[10px]" /> {Number(course.average_rating) > 0 ? course.average_rating?.toFixed(1) : "New"}
                          </span>
                          <span>•</span>
                          <span>{course.course_price ? `$${course.course_price}` : "Free"}</span>
                        </div>
                      </div>
                      <RightOutlined className="text-xs text-slate-300 group-hover:text-[#4F46E5] transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {!isExplore && (
      <section className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-[#0B132B] via-[#1E1B4B] to-[#172554] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Ready to start learning?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Build your skills. Shape your future.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Join thousands of learners worldwide and gain the skills you need to succeed in your career.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => dispatch(setSignup(true))}
              className="px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Sign Up for Free</span>
              <span>→</span>
            </button>
            <button
              onClick={() => toast.info("Intro video playback")}
              className="px-5 py-3 rounded-xl border border-slate-700 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <PlayCircleFilled className="text-indigo-400" />
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      </section>
      )}

      <TeacherDetailsModal
        open={teacherModalOpen}
        onClose={() => setTeacherModalOpen(false)}
        audience="student"
        teacher={
          teacherId
            ? {
                instructor_id: String(teacherId),
                key: String(teacherId),
                name: coursesInfo?.head_teacher_name || coursesInfo?.course_instructor || "Instructor",
                image_url: coursesInfo?.head_teacher_image_url || coursesInfo?.course_instructor_image_url || "",
                email: "",
                status: "active",
                qualification: (coursesInfo as any)?.head_teacher_qualification || "",
              }
            : null
        }
      />

      <PurchaseModal
        open={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        course={(coursesInfo as any) || (selectedCourseData as any)}
      />
    </div>
  );
};

export default CourseInfo;
