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
import { toast } from "@/utils/toast";

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
        <div className="w-full flex flex-col gap-6">
          {detailLoading ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : detail ? (
            <>
              {/* Assignment Meta Card */}
              <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      Assignment Overview
                    </span>
                    <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                      {detail.assignmentName}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      {detail.projects?.length || 0} Projects
                    </span>
                  </div>
                </div>

                {/* Info Chips */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                    <span className="text-slate-400">Due Date:</span>
                    <span>{detail.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                    <span>Submissions:</span>
                    <span>{detail.submittedCount} students</span>
                  </div>
                </div>

                {detail.overview && (
                  <div className="pt-2 text-slate-700 text-sm leading-relaxed">
                    <QuillEditor readOnly value={detail.overview || ""} />
                  </div>
                )}
              </div>

              {/* Projects Breakdown Card */}
              {detail.projects.length > 0 && (
                <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Project Tasks & Deliverables ({detail.projects.length})
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Students must submit responses corresponding to each project task below
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
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
                        className={`!rounded-2xl border transition-all duration-200 overflow-hidden ${
                          activeStep === index.toString()
                            ? "!bg-white border-secondary shadow-sm"
                            : "!bg-slate-50/60 border-slate-200 hover:border-slate-300"
                        }`}
                        items={[
                          {
                            key: index.toString(),
                            label: (
                              <div className="flex justify-between items-center w-full pr-4">
                                <div className="flex gap-3 items-center min-w-0">
                                  <span className="w-7 h-7 rounded-lg bg-secondary text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {index + 1}
                                  </span>
                                  <span className="rounded-md px-2 py-0.5 text-[10px] uppercase font-bold whitespace-nowrap bg-secondary/10 text-secondary border border-secondary/20">
                                    Project {index + 1}
                                  </span>
                                  <p className="font-bold text-sm text-slate-900 truncate">
                                    {item.projectName}
                                  </p>
                                </div>
                              </div>
                            ),
                            children: (
                              <div className="pt-2 space-y-4">
                                <div className="flex flex-col gap-2">
                                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                                    Project Description & Instructions
                                  </h3>
                                  <div className="text-slate-700 text-sm leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                                    <QuillEditor readOnly value={item.description || ""} />
                                  </div>
                                </div>

                                {item.objectives.length > 0 && (
                                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                                      Project Objectives & Criteria
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {item.objectives.map((el, i) => (
                                        <div
                                          key={i}
                                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-start gap-2"
                                        >
                                          <span className="w-4 h-4 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            ✓
                                          </span>
                                          <span>{el}</span>
                                        </div>
                                      ))}
                                    </div>
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
            <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-200">
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
