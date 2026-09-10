"use client";

import BadgeComponent from "@/components/BadgeComponent";
import CommonButton from "@/components/CommonButton";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import { InviteTeacherModal } from "@/components/modal/InviteTeacherModal";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import { setInstructorData } from "@/redux/slices/TeacherDataSlice";
import { deleteInstructor, getAllInstructor } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import {
  ChatIconOutlined,
  DeleteIcon,
  DisableIcon,
  FilterIcon,
} from "@/utils/icons";
import { InstructorRecord } from "@/utils/interface";
import { DeleteFilled } from "@ant-design/icons";
import { Badge, Table } from "antd";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "@/utils/toast";

const Teachers = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(10);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [teacherData, setTeacherData] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteInstructorId, setDeleteInstructorId] = useState<string | null>(
    null
  );

  const teacherTableColumns = [
    {
      title: "S.NO",
      dataIndex: "key",
      key: "key",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Teacher Name",
      dataIndex: "name",
      key: "name",
      render: (_: unknown, record: InstructorRecord) => {
        return (
          <div
            onClick={() => {
              dispatch(setInstructorData(record));
              router.push(`${RoutePaths.Teachers}/teacher-details`);
            }}
            className="cursor-pointer"
          >
            <UserAvatarDisplay
              user={{ name: record.name, image: record.image_url }}
            />
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Qualification",
      dataIndex: "qualification",
      key: "qualification",
    },
    {
      title: "No. of Courses",
      dataIndex: "no_of_courses",
      key: "no_of_courses",
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
      render: (_: unknown, record: InstructorRecord) => (
        <div className="flex gap-3 text-[18px] text-secondary">
          <button
          // onClick={() => {
          //   setIsEdit(true);
          //   setOpen(true);
          //   setEditInstructorData(record);
          // }}
          >
            <ChatIconOutlined />
          </button>
          <DisableIcon />
          <button
            onClick={() => {
              setDeleteInstructorId(record?.instructor_id);
              setDeleteModalVisible(true);
            }}
          >
            <DeleteIcon />
          </button>
        </div>
      ),
    },
  ];

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchAllTeacher = useCallback(async () => {
    setLoading(true);
    const param = new URLSearchParams();
    param.append("limit", limit + "");
    param.append("page", page + "");
    if (debouncedSearch) {
      param.append("search", debouncedSearch);
    }
    try {
      const res = await getAllInstructor(param);
      if (res.status) {
        setTeacherData(res?.data?.instructors || []);
        setTotal(res?.data?.total || 0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  const handleConfirmDelete = async () => {
    console.log(deleteInstructorId);
    if (!deleteInstructorId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteInstructor(deleteInstructorId);
      if (res.status) {
        toast.success(res.message);
        setDeleteModalVisible(false);
        fetchAllTeacher();
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTeacher();
  }, [fetchAllTeacher]);

  return (
    <div className="flex flex-col gap-3">
      {deleteModalVisible && (
        <ConfirmationModal
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          onSubmit={handleConfirmDelete}
          loading={deleteLoading}
          title="Delete"
          description={`Are you sure you want to Delete Instructor`}
          iconBG="#FB4A49"
          icon={<DeleteFilled className="text-4xl !text-white" />}
        />
      )}
      <InviteTeacherModal
        open={open}
        fetchAllTeacher={fetchAllTeacher}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <h1 className="text-[32px] font-[700] text-[#0E0E0E]">Teachers</h1>
      <div className="flex items-center justify-between w-full">
        <CommonButton
          text={"+ Invite Teacher"}
          onClick={() => setOpen(true)}
          className="!bg-secondary text-white"
        />
        <div className="flex items-center gap-[12px]">
          <SearchInput
            search={search}
            onChange={(e) => setSearch(e.target.value)}
            suffix={false}
            placeholder="Search by name..."
            className="!border-none"
          />
          <Badge count={5} prefixCls="filterBadge">
            <CommonButton
              text={"Filter"}
              icon={<FilterIcon />}
              className="!bg-white !flex-row-reverse"
            />
          </Badge>
        </div>
      </div>

      <div className=" p-4 bg-white rounded-xl">
        <Table
          prefixCls="custom-table"
          rowClassName={(_, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          columns={teacherTableColumns}
          dataSource={teacherData}
          rowKey={(record) => record.email}
          loading={loading}
          className="overflow-auto whitespace-nowrap bg-white rounded-xl"
          pagination={false}
        />
      </div>

      {total > limit && (
        <Pagination page={page} limit={limit} setPage={setPage} total={total} />
      )}
    </div>
  );
};

export default Teachers;
