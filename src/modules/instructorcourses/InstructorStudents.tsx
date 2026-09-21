"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, Select, Skeleton } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import SearchInput from "@/components/SearchInput";
import { getStudentsListApi } from "@/services/collections";
import { CourseInfoDataProp, Batch } from "@/utils/interface";
import { UsergroupAddOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { RoutePaths } from "@/utils/enums";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import BadgeComponent from "@/components/BadgeComponent";
import type { ColumnsType } from "antd/es/table";

interface InstructorStudentsProp {
  coursesInfo?: CourseInfoDataProp;
}

interface StudentTableData {
  key: string;
  name: string;
  email: string;
  batch: string;
  progress: string;
  status: string;
  avatar: string;
}

interface StudentApiData {
  student_id: string;
  name: string;
  email: string;
  batchIds?: string[];
  avatar?: string;
}

const InstructorStudents: React.FC<InstructorStudentsProp> = ({ coursesInfo }) => {
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string | undefined>(undefined);
  const [students, setStudents] = useState<StudentTableData[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const userData = useSelector((state: RootState) => state.userdata);
  const role_name = userData?.role_name;
  const isTeacher = role_name === "teacher";
  const isHeadTeacher = String(coursesInfo?.head_teacher_id) === String(userData?.instructor_id);

  const visibleBatches = isTeacher && !isHeadTeacher
    ? coursesInfo?.batch?.filter((b: Batch) => String(b.teacher) === String(userData?.instructor_id))
    : coursesInfo?.batch;

  const fetchStudents = useCallback(async () => {
    if (!coursesInfo?.course_id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("courseId", coursesInfo.course_id);
      if (selectedBatch) {
        params.append("batchId", selectedBatch);
      }
      if (search.trim()) {
        params.append("search", search.trim());
      }
      const res = await getStudentsListApi(params);
      if (res.status) {
        const mapped = (res.data as StudentApiData[]).map((student: StudentApiData) => {
          const matchedBatchNames = coursesInfo.batch
            ?.filter((b: Batch) => student.batchIds?.includes(String(b._id)))
            ?.map((b: Batch) => b.batchName)
            ?.join(", ") || "Unassigned";
          return {
            key: student.student_id,
            name: student.name,
            email: student.email,
            batch: matchedBatchNames,
            progress: "100%",
            status: "Active",
            avatar: student.avatar || "",
          };
        });
        setStudents(mapped);
      }
    } catch (error) {
      console.error("Error fetching students list:", error);
    } finally {
      setLoading(false);
    }
  }, [coursesInfo, selectedBatch, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const studentTableColumns: ColumnsType<StudentTableData> = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      width: 60,
      render: (_1: unknown, _2: StudentTableData, index: number) => (
        <span className="text-xs text-slate-400 font-semibold">{index + 1}</span>
      ),
    },
    {
      title: "Student",
      dataIndex: "name",
      key: "name",
      render: (_: unknown, record: StudentTableData) => (
        <UserAvatarDisplay user={{ name: record.name, email: record.email, image: record.avatar }} />
      ),
    },
    {
      title: "Batch Cohort",
      dataIndex: "batch",
      key: "batch",
      render: (batch: string) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {batch}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <BadgeComponent status={status} />,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_: unknown, record: StudentTableData) => (
        <button
          type="button"
          onClick={() => router.push(`${RoutePaths.Students}/student-details?id=${record.key}`)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <EyeOutlined />
          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Enrolled Students
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {students.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track student enrolment, batch assignments, and individual learner progress.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-64">
            <SearchInput
              search={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
            />
          </div>
          <Select
            placeholder="All Batches"
            className="w-44 !h-10 text-xs"
            allowClear
            value={selectedBatch}
            onChange={(val) => setSelectedBatch(val)}
            options={
              visibleBatches?.map((b: Batch) => ({
                label: b.batchName,
                value: b._id,
              })) || []
            }
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : students.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <UsergroupAddOutlined className="text-4xl text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No students enrolled yet</p>
            <p className="text-xs text-slate-400">Enrolled students for this course will be listed here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              dataSource={students}
              columns={studentTableColumns}
              pagination={{ pageSize: 10 }}
              rowKey="key"
              className="ant-table-custom"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorStudents;
