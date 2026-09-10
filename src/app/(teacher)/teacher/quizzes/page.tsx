"use client";
import CommonButton from "@/components/CommonButton";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { RoutePaths } from "@/utils/enums";
import { FilterIcon } from "@/utils/icons";
import { Badge, Skeleton } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { getAllCoursesApi, getQuizzesByCourseApi } from "@/services/collections";
import { toast } from "@/utils/toast";

interface CourseRow {
  course_id: string;
  course_name: string;
  course_image_url: string | null;
  batches: number;
  batchList: { _id: string; batchName: string }[];
  enrolled_user_count: number;
  totalQuizzes: number;
  lastQuizDate: string | null;
}

interface BatchSelectModalProps {
  open: boolean;
  course: CourseRow | null;
  onClose: () => void;
  onSelect: (batchId: string, batchName: string, courseId: string, courseName: string) => void;
}

// Inline batch selection modal (no external library needed)
const BatchSelectModal: React.FC<BatchSelectModalProps> = ({
  open,
  course,
  onClose,
  onSelect,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setSelectedBatch(null);
  }, [open]);

  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-2xl p-6 w-[400px] flex flex-col gap-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-7 h-7 bg-black rounded-full text-white text-sm flex items-center justify-center"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center">Select the Batch</h2>

        <div className="flex items-center gap-2 border border-[#D8D8D8] p-2 h-[56px] rounded-[6px]">
          {course.course_image_url ? (
            <Image
              src={course.course_image_url}
              alt="Course"
              width={40}
              height={40}
              unoptimized
              className="rounded-[6px] min-w-[40px] min-h-[40px] object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-[6px] bg-gray-200 min-w-[40px]" />
          )}
          <p className="w-[80%] font-medium text-sm truncate">{course.course_name}</p>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {course.batchList.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">
              No batches found for this course.
            </p>
          ) : (
            course.batchList.map((batch) => (
              <div
                key={batch._id}
                onClick={() => setSelectedBatch(batch._id)}
                className="flex items-start justify-between p-2 rounded-md border-b border-[#D8D8D8] cursor-pointer"
              >
                <p className="font-semibold text-sm">{batch.batchName}</p>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                    selectedBatch === batch._id ? "border-primary" : "border-gray-400"
                  }`}
                >
                  {selectedBatch === batch._id && (
                    <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <CommonButton
            text="Select"
            disable={!selectedBatch}
            className="!bg-secondary text-white w-[40%]"
            type="button"
            onClick={() => {
              if (!selectedBatch) return;
              const batch = course.batchList.find((b) => b._id === selectedBatch);
              onSelect(
                selectedBatch,
                batch?.batchName || "",
                course.course_id,
                course.course_name
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

const TeacherQuizzes = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      interface ApiBatchItem {
        _id: string;
        batchName: string;
      }
      interface ApiCourseItem {
        course_id: string;
        course_name: string;
        course_image_url: string | null;
        batch?: ApiBatchItem[];
        enrolled_user_count?: number;
      }

      const res = await getAllCoursesApi(params);
      if (res?.status) {
        const list = (res.data?.course_list || []) as ApiCourseItem[];
        const enriched: CourseRow[] = await Promise.all(
          list.map(async (c: ApiCourseItem) => {
            let totalQuizzes = 0;
            let lastQuizDate: string | null = null;
            try {
              const qRes = await getQuizzesByCourseApi(c.course_id);
              if (qRes?.status) {
                totalQuizzes = qRes.data?.totalQuizzes || 0;
                lastQuizDate = qRes.data?.lastQuizDate || null;
              }
            } catch (_) {}
            return {
              course_id: c.course_id,
              course_name: c.course_name,
              course_image_url: c.course_image_url,
              batches: c.batch?.length || 0,
              batchList: (c.batch || []).map((b: ApiBatchItem) => ({
                _id: b._id,
                batchName: b.batchName,
              })),
              enrolled_user_count: c.enrolled_user_count || 0,
              totalQuizzes,
              lastQuizDate,
            };
          })
        );
        setCourses(enriched);
        setTotal(res.data?.total_courses || 0);
      }
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    const t = setTimeout(() => fetchCourses(), 400);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  const handleBatchSelect = (
    batchId: string,
    _batchName: string,
    courseId: string,
    _courseName: string
  ) => {
    setOpen(false);
    router.push(
      `${RoutePaths.TeacherQuizzes}/batch-details?course_id=${courseId}&batch_id=${batchId}`
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <BatchSelectModal
        open={open}
        course={selectedCourse}
        onClose={() => setOpen(false)}
        onSelect={handleBatchSelect}
      />

      <h1 className="text-[32px] font-bold">Quizzes</h1>
      <div className="flex items-center justify-between">
        <SearchInput
          search={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          suffix={false}
          placeholder="Search by course name..."
          className="!border-none !w-[30%]"
        />
        <Badge count={0} prefixCls="filterBadge">
          <CommonButton
            text={"Filter"}
            icon={<FilterIcon />}
            className="!bg-white !flex-row-reverse"
          />
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-md">
                <Skeleton active paragraph={{ rows: 1 }} />
              </div>
            ))
          : courses.map((course) => (
              <div
                key={course.course_id}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedCourse(course);
                  setOpen(true);
                }}
              >
                <div className="bg-white grid grid-cols-12 p-4 rounded-md hover:shadow-sm transition-shadow">
                  <div className="col-span-4 flex gap-2.5 items-center">
                    {course.course_image_url ? (
                      <Image
                        src={course.course_image_url}
                        alt="course"
                        width={40}
                        height={40}
                        unoptimized
                        className="rounded-md w-10 h-10 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-md" />
                    )}
                    <p className="font-medium truncate flex h-8 items-center">
                      {course.course_name}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#7B7B7B] text-xs">No. of Batches</p>
                    <div className="text-sm font-medium flex h-8 items-center">
                      {course.batches}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#7B7B7B] text-xs">Students</p>
                    <div className="text-sm font-medium flex h-8 items-center">
                      {course.enrolled_user_count}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#7B7B7B] text-xs">No. of Quizzes</p>
                    <div className="text-sm font-medium flex h-8 items-center">
                      {course.totalQuizzes}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#7B7B7B] text-xs">Last Quiz Date</p>
                    <div className="text-sm font-medium flex h-8 items-center">
                      {course.lastQuizDate || "-"}
                    </div>
                  </div>
                </div>
              </div>
            ))}

        {!loading && courses.length === 0 && (
          <div className="bg-white rounded-md p-10 text-center text-gray-500">
            No courses found.
          </div>
        )}
      </div>

      {total > limit && (
        <Pagination page={page} limit={limit} setPage={setPage} total={total} />
      )}
    </div>
  );
};

export default TeacherQuizzes;
