"use client";
import BadgeComponent from "@/components/BadgeComponent";
import CommonButton from "@/components/CommonButton";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import { RoutePaths } from "@/utils/enums";
import { Badge, Table, Spin, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { getStudentsListApi, getAllCoursesApi } from "@/services/collections";

interface BatchItem {
  _id: string;
  batchName: string;
}

interface CourseItem {
  _id: string;
  course_name: string;
  batch?: BatchItem[];
}

interface StudentRow {
  key: string;
  name: string;
  email: string;
  course: string;
  batch: string;
  status: string;
  avatar?: string;
}

const TeacherStudents = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Filters
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string | undefined>(undefined);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    getAllCoursesApi()
      .then((res) => {
        if (res?.status) {
          const courseList = (res.data?.course_list || []) as { course_id: string; course_name: string; batch?: BatchItem[] }[];
          setCourses(courseList.map((c) => ({
            _id: c.course_id,
            course_name: c.course_name,
            batch: c.batch,
          })));
        }
      })
      .catch(console.error);
  }, []);

  const handleCourseFilterChange = (val: string | undefined) => {
    setSelectedCourseFilter(val);
    setSelectedBatchFilter(undefined);
    if (val) {
      const c = courses.find((course) => course._id === val);
      setBatches(c?.batch || []);
    } else {
      setBatches([]);
    }
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCourseFilter) params.append("courseId", selectedCourseFilter);
      if (selectedBatchFilter) params.append("batchId", selectedBatchFilter);

      const res = await getStudentsListApi(params);
      if (res && res.status) {
        const mapped = ((res.data || []) as { student_id: string; name: string; email: string; courseName?: string; batchName?: string; avatar?: string }[]).map((s) => ({
          key: s.student_id,
          name: s.name,
          email: s.email,
          course: s.courseName || "Full-Stack Web Engineering",
          batch: s.batchName || "Morning Tech Leaders",
          status: "Active",
          avatar: s.avatar,
        }));
        setStudents(mapped);
        setTotal(mapped.length);
      }
    } catch (err) {
      console.error("Error fetching students list:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCourseFilter, selectedBatchFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const studentTableColumns: ColumnsType<StudentRow> = [
    {
      title: "S.NO",
      dataIndex: "key",
      key: "key",
      render: (_1, _2, index) => index + 1,
    },
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <UserAvatarDisplay user={{ name: record.name, image: record.avatar }} />
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Course Name",
      dataIndex: "course",
      key: "course",
      render: (text: string) => (
        <span className="text-secondary underline cursor-pointer">{text}</span>
      ),
    },
    {
      title: "Batch Name",
      dataIndex: "batch",
      key: "batch",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <BadgeComponent status={status} />,
    },
    {
      title: "Action",
      fixed: "right" as const,
      key: "action",
      render: (_, record) => (
        <CommonButton
          text="View"
          onClick={() => router.push(`${RoutePaths.TeacherStudents}/student-details?id=${record.key}`)}
          className="!h-8 !bg-transparent border !border-secondary text-secondary"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[32px] font-bold">Students</h1>
      <div className="flex items-center justify-between">
        <SearchInput
          search={search}
          onChange={(e) => setSearch(e.target.value)}
          suffix={false}
          placeholder="Search by name..."
          className="!border-none !w-[30%]"
        />
        <div className="flex items-center gap-3">
          <Select
            allowClear
            placeholder="Filter by Course"
            className="w-[200px] h-[44px]"
            onChange={handleCourseFilterChange}
            value={selectedCourseFilter}
            options={courses.map((c) => ({ label: c.course_name, value: c._id }))}
          />
          <Select
            allowClear
            placeholder="Filter by Batch"
            className="w-[200px] h-[44px]"
            onChange={(val) => setSelectedBatchFilter(val)}
            value={selectedBatchFilter}
            disabled={!selectedCourseFilter || batches.length === 0}
            options={batches.map((b) => ({ label: b.batchName, value: b._id }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 min-h-[200px] flex flex-col justify-center">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            prefixCls="custom-table"
            rowClassName={(_, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
            columns={studentTableColumns}
            dataSource={students}
            rowKey={"key"}
            className="overflow-auto whitespace-nowrap bg-white rounded-xl"
            pagination={false}
          />
        )}
      </div>

      {total > limit && (
        <Pagination page={page} limit={limit} setPage={setPage} total={total} />
      )}
    </div>
  );
};

export default TeacherStudents;
