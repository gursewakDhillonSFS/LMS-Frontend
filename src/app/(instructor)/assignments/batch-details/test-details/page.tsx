"use client";
import BadgeComponent from "@/components/BadgeComponent";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import TabSwitcher from "@/components/TabSwitcher";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import { BatchAssignmentTestOptions } from "@/utils/constant";
import { BatchTestTabs, RoutePaths } from "@/utils/enums";
import { FilterIcon } from "@/utils/icons";
import { RightOutlined } from "@ant-design/icons";
import {
  Badge,
  Breadcrumb,
  Collapse,
  Form,
  Input,
  Modal,
  Skeleton,
  Table,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import QuillEditor from "@/components/QuillEditor";
import {
  getAssignmentDetailsApi,
  getAssignmentSubmissionsApi,
} from "@/services/collections";
import { toast } from "react-toastify";

interface SubmissionRow {
  submission_id: string | null;
  student_id: string;
  name: string;
  email: string;
  avatar: string | null;
  submittedText: string | null;
  dateOfSubmit: string;
  result: string;
  feedback: string | null;
  status: string;
}

interface AssignmentDetail {
  assignment_id: string;
  assignmentName: string;
  dueDate: string;
  overview: string;
  projects: { projectName: string; description: string; objectives: string[] }[];
  submittedCount: number;
  courseName: string | null;
  batchName: string | null;
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const TestDetailsInner = () => {
  const [activeTab, setActiveTab] = useState<string>(
    BatchTestTabs.ASSIGNMENT_DETAILS
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = searchParams.get("assignment_id") || "";
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeStep, setActiveStep] = useState("0");

  const [detail, setDetail] = useState<AssignmentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);


  const batchDetailsUrl = `${RoutePaths?.Assignments}/batch-details?course_id=${courseId}&batch_id=${batchId}`;

  const items = [
    { title: "Assignments", href: RoutePaths?.Assignments },
    { title: "Batch Assignments", href: batchDetailsUrl },
    { title: detail?.assignmentName || "Assignment Details" },
  ];

  // Load assignment meta-info
  useEffect(() => {
    if (!assignmentId) return;
    setDetailLoading(true);
    getAssignmentDetailsApi(assignmentId)
      .then((res) => {
        if (res?.status) setDetail(res.data);
      })
      .catch(() => toast.error("Failed to load assignment details"))
      .finally(() => setDetailLoading(false));
  }, [assignmentId]);

  // Load submissions when tab switches to Students
  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    setSubmissionsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      const res = await getAssignmentSubmissionsApi(assignmentId, params);
      if (res?.status) {
        setSubmissions(res.data?.submissions || []);
        setTotal(res.data?.total || 0);
      }
    } catch (_) {
      toast.error("Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  }, [assignmentId, page, search, limit]);

  useEffect(() => {
    if (activeTab === BatchTestTabs.STUDENTS) {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  useEffect(() => {
    if (activeTab === BatchTestTabs.STUDENTS) {
      const t = setTimeout(() => fetchSubmissions(), 400);
      return () => clearTimeout(t);
    }
  }, [search, fetchSubmissions, activeTab]);

  const studentTableColumns = [
    {
      title: "S.NO",
      key: "sno",
      render: (_: unknown, __: unknown, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: SubmissionRow) => (
        <UserAvatarDisplay
          user={{ name: record.name, image: record.avatar || undefined }}
        />
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Date Of Submit",
      dataIndex: "dateOfSubmit",
      key: "dateOfSubmit",
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
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
      render: (_: unknown, record: SubmissionRow) => (
        <div className="flex gap-2">
          {record.status !== "Not Submitted" && (
            <CommonButton
              text={record.status === "Graded" ? "Edit Grade" : "Grade"}
              onClick={() => {
                router.push(`${RoutePaths.Assignments}/batch-details/evaluate/${record.submission_id}?course_id=${courseId}&batch_id=${batchId}&assignment_id=${assignmentId}`);
              }}
              className="!h-8 !bg-secondary text-white"
            />
          )}
          <CommonButton
            text="View"
            onClick={() =>
              router.push(`${RoutePaths.Students}/student-details?student_id=${record.student_id}`)
            }
            className="!h-8 !bg-transparent border !border-secondary text-secondary"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[24px]">

      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex justify-between items-center">
        <TabSwitcher
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={BatchAssignmentTestOptions}
        />
        <div className="text-secondary font-semibold text-[16px]">
          {detail ? `${detail.submittedCount} Submitted` : ""}
        </div>
      </div>

      {/* ── Assignment Details Tab ─────────────────────────────────────── */}
      {BatchTestTabs.ASSIGNMENT_DETAILS === activeTab && (
        <div className="w-full flex flex-col gap-[12px]">
          {detailLoading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : detail ? (
            <>
              <div className="flex flex-col gap-[12px]">
                <h1 className="font-[700] text-[20px] text-[#0E0E0E]">
                  Overview
                </h1>
                <p className="text-secondary font-semibold text-[16px]">
                  Due on: {detail.dueDate}
                </p>
                <div className="font-[400] text-[16px] text-[#002333]">
                  <QuillEditor readOnly value={detail.overview || ""} />
                </div>
              </div>

              {detail.projects.length > 0 && (
                <div className="w-full flex flex-col gap-[12px]">
                  <h1 className="font-[700] text-[20px] text-[#0E0E0E]">
                    Projects
                  </h1>
                  <div className="flex flex-col gap-4">
                    {detail.projects.map((item, index) => (
                      <Collapse
                        key={index}
                        accordion
                        activeKey={activeStep}
                        onChange={() =>
                          setActiveStep(
                            activeStep === index.toString()
                              ? ""
                              : index.toString()
                          )
                        }
                        expandIconPosition="end"
                        expandIcon={({ isActive }) => (
                          <RightOutlined
                            style={{
                              transform: isActive
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              transition: "0.2s",
                            }}
                          />
                        )}
                        className={
                          activeStep === index.toString()
                            ? "!bg-secondary"
                            : "!bg-white"
                        }
                        items={[
                          {
                            key: index.toString(),
                            label: (
                              <div className="flex justify-between">
                                <div className="flex gap-2">
                                  <p
                                    className={`rounded-[12px] px-2 py-1 text-xs whitespace-nowrap h-fit ${
                                      activeStep !== index.toString()
                                        ? "bg-[#E3E3E3]"
                                        : "bg-white"
                                    }`}
                                  >
                                    Project {index + 1}
                                  </p>
                                  <p
                                    className={`font-bold ${
                                      activeStep === index.toString() &&
                                      "text-white"
                                    }`}
                                  >
                                    {item.projectName}
                                  </p>
                                </div>
                              </div>
                            ),
                            children: (
                              <div className="space-y-4">
                                <div className="flex flex-col gap-3">
                                  <h1 className="font-semibold text-[16px]">
                                    Project Details
                                  </h1>
                                  <div className="text-[#002333]">
                                    <QuillEditor readOnly value={item.description || ""} />
                                  </div>
                                </div>
                                {item.objectives.length > 0 && (
                                  <div className="flex flex-col gap-3">
                                    <h1 className="font-semibold text-[16px]">
                                      Objectives
                                    </h1>
                                    <ul className="list-disc pl-5 text-sm text-[#002333] flex flex-col gap-2 items-start">
                                      {item.objectives.map((el, i) => (
                                        <li key={i}>{el}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ),
                          },
                        ]}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-10">
              Assignment not found.
            </div>
          )}
        </div>
      )}

      {/* ── Students Tab ──────────────────────────────────────────────── */}
      {BatchTestTabs.STUDENTS === activeTab && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-[32px] font-bold">Students</h1>
            <div className="flex gap-3">
              <SearchInput
                search={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                suffix={false}
                placeholder="Search by name..."
                className="!border-none"
              />
              <Badge count={0} prefixCls="filterBadge">
                <CommonButton
                  text={"Filter"}
                  icon={<FilterIcon />}
                  className="!bg-white !flex-row-reverse"
                />
              </Badge>
            </div>
          </div>

          <Table
            prefixCls="custom-table"
            rowClassName={(_, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
            columns={studentTableColumns}
            dataSource={submissions}
            rowKey="student_id"
            loading={submissionsLoading}
            className="overflow-auto whitespace-nowrap !p-4 bg-white rounded-xl"
            pagination={false}
          />

          {total > limit && (
            <Pagination
              page={page}
              limit={limit}
              setPage={setPage}
              total={total}
            />
          )}
        </div>
      )}
    </div>
  );
};

const TestDetails = () => (
  <Suspense fallback={<Skeleton active />}>
    <TestDetailsInner />
  </Suspense>
);

export default TestDetails;
