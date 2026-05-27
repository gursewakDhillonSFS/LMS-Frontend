"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, Select } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import SearchInput from "@/components/SearchInput";
import { studentTableColumns } from "@/utils/commonFunctions";
import { getStudentsListApi } from "@/services/collections";
import { CourseInfoDataProp, Batch } from "@/utils/interface";
import { LoadingOutlined } from "@ant-design/icons";
import NoDataFound from "@/components/NoDataFound";
import { DataNotFound } from "@/utils/images";

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

  const userData = useSelector((state: RootState) => state.userdata);
  const role_name = userData?.role_name;
  const isTeacher = role_name === "teacher";
  const isHeadTeacher = String(coursesInfo?.head_teacher_id) === String(userData?.instructor_id);

  // Filter selectable batches in dropdown for teachers who are not head teachers
  const visibleBatches = isTeacher && !isHeadTeacher
    ? coursesInfo?.batch?.filter((b: Batch) => String(b.teacher) === String(userData?.instructor_id))
    : coursesInfo?.batch;

  const fetchStudents = useCallback(async () => {
    if (!coursesInfo?.course_id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("course_id", coursesInfo.course_id);
      if (selectedBatch) {
        params.append("batch_id", selectedBatch);
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
            ?.join(", ") || "No Batch";
          return {
            key: student.student_id,
            name: student.name,
            email: student.email,
            batch: matchedBatchNames,
            progress: "60%",
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0E0E0E]">Enrolled Students</h1>
          <p className="text-sm text-[#7B7B7B]">View student list and course progression</p>
        </div>
        <div className="flex items-center gap-[12px] flex-wrap">
          <SearchInput
            search={search}
            onChange={(e) => setSearch(e.target.value)}
            suffix={false}
            borderRadius="8px"
            className="!border-gray-200"
            placeholder="Search student..."
          />
          <Select
            placeholder="All Batches"
            className="w-[200px] h-11 text-[15px]"
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

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh] bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingOutlined className="text-3xl text-secondary" spin />
        </div>
      ) : students.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 overflow-hidden">
          <Table
            prefixCls="custom-table"
            rowClassName={(_, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
            columns={studentTableColumns}
            dataSource={students}
            rowKey={"key"}
            className="overflow-auto whitespace-nowrap"
            pagination={false}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center justify-center">
          <NoDataFound icon={DataNotFound} />
        </div>
      )}
    </div>
  );
};

export default InstructorStudents;
