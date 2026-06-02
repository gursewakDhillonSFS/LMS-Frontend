"use client";

import BadgeComponent from "@/components/BadgeComponent";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import TabSwitcher from "@/components/TabSwitcher";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import { BatchTestOptions } from "@/utils/constant";
import { BatchTestTabs, RoutePaths } from "@/utils/enums";
import { FilterIcon } from "@/utils/icons";
import { Badge, Breadcrumb, Collapse, Form, Input, Modal, Skeleton, Table } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import {
  getQuizDetailsApi,
  getQuizSubmissionsApi,
  gradeQuizSubmissionApi,
} from "@/services/collections";
import { toast } from "react-toastify";
import { QuizQuestionProp } from "@/modules/addQuizSteps/AddQuestionModal";
import { RightOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import QuillEditor from "@/components/QuillEditor";

interface StudentAnswerRow {
  questionIndex: number;
  questionType: "mcq" | "essay";
  selectedOption: string;
  submittedText: string;
  isCorrect: boolean;
  obtainedMarks: number;
}

interface SubmissionRow {
  submission_id: string | null;
  student_id: string;
  name: string;
  email: string;
  avatar: string | null;
  dateOfSubmit: string;
  result: string;
  feedback: string | null;
  status: string;
  answers: StudentAnswerRow[];
}

interface QuizDetailsData {
  quiz_id: string;
  quizName: string;
  dueDate: string;
  quizType: string;
  overview: string;
  enableTimer: boolean;
  timer: string | null;
  courseName: string | null;
  batchName: string | null;
  questions: QuizQuestionProp[];
  submittedCount: number;
  totalMarks: number;
}

// ─── Grade Quiz Submission Modal ──────────────────────────────────────────────
interface GradeModalProps {
  open: boolean;
  submission: SubmissionRow | null;
  quizQuestions: QuizQuestionProp[];
  onClose: () => void;
  onSuccess: () => void;
}

const GradeModal: React.FC<GradeModalProps> = ({
  open,
  submission,
  quizQuestions,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && submission) {
      form.setFieldsValue({
        feedback: submission.feedback || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, submission, form]);

  const handleGrade = async () => {
    if (!submission?.submission_id) {
      toast.warning("No submission found to grade.");
      return;
    }
    const values = form.getFieldsValue();
    setLoading(true);
    try {
      const res = await gradeQuizSubmissionApi({
        submissionId: submission.submission_id,
        feedback: values.feedback || "",
      });
      if (res?.status) {
        toast.success(res.message || "Grading feedback saved");
        onSuccess();
        onClose();
      } else {
        toast.warning(res?.message || "Failed to submit grading feedback");
      }
    } catch (_) {
      toast.error("Error saving grading feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={`Grade Feedback — ${submission?.name || ""}`}
      width={700}
      className="custom-modal"
    >
      <div className="flex flex-col gap-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
        {/* Answers Recap List */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-base text-[#002333]">Student Answers Recap</h3>
          <div className="flex flex-col gap-3">
            {quizQuestions.map((q, idx) => {
              const studentAns = submission?.answers?.find((a) => a.questionIndex === idx);
              const isCorrect = studentAns?.isCorrect ?? false;

              return (
                <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-sm text-[#002333]">
                      Q{idx + 1}. {q.question}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBEBEB] text-[#555]">
                      {studentAns?.obtainedMarks ?? 0} / {q.marks} Marks
                    </span>
                  </div>

                  {q.questionType === "mcq" ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {q.options?.map((opt, oIdx) => {
                        const isSelected = studentAns?.selectedOption === opt;
                        const isCorrectOption = q.correctOption === opt;

                        let borderClass = "border-gray-200 bg-white";
                        let textClass = "text-gray-600";
                        let icon = null;

                        if (isCorrectOption) {
                          borderClass = "border-green-500 bg-green-50/30";
                          textClass = "text-green-700 font-semibold";
                          icon = <CheckCircleOutlined className="text-green-500 mr-1.5" />;
                        } else if (isSelected && !isCorrectOption) {
                          borderClass = "border-red-500 bg-red-50/30";
                          textClass = "text-red-700 font-semibold";
                          icon = <CloseCircleOutlined className="text-red-500 mr-1.5" />;
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`border rounded-lg p-2.5 text-xs flex items-center ${borderClass} ${textClass}`}
                          >
                            {icon}
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 mt-1 bg-white border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-400">Student response:</span>
                        <span className={`font-bold flex items-center ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {isCorrect ? (
                            <CheckCircleOutlined className="mr-1 text-green-500" />
                          ) : (
                            <CloseCircleOutlined className="mr-1 text-red-500" />
                          )}
                          "{studentAns?.submittedText || "-"}"
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Correct Answer: <span className="font-semibold text-green-600 capitalize">"{q.correctAnswer}"</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item name="feedback" label="Instructor Feedback (Optional)" className="!mb-0">
            <Input.TextArea
              rows={3}
              placeholder="Provide constructive feedback about their results..."
              className="rounded-lg text-sm"
            />
          </Form.Item>
        </Form>

        <div className="flex justify-end gap-2 mt-2">
          <CommonButton
            text="Cancel"
            onClick={onClose}
            className="!bg-transparent border !text-[#002333] !w-[100px]"
            type="button"
          />
          <CommonButton
            text="Save Feedback"
            loading={loading}
            onClick={handleGrade}
            className="!bg-secondary text-white !w-[140px]"
            type="button"
          />
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const TestDetailsInner = () => {
  const [activeTab, setActiveTab] = useState<string>(
    BatchTestTabs.QUIZZES_DETAILS
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get("quiz_id") || "";
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeStep, setActiveStep] = useState("0");

  const [detail, setDetail] = useState<QuizDetailsData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [gradeModal, setGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);

  const batchDetailsUrl = `${RoutePaths?.Quizzes}/batch-details?course_id=${courseId}&batch_id=${batchId}`;

  const items = [
    { title: "Quizzes", href: RoutePaths?.Quizzes },
    { title: detail?.courseName || "Batch Quizzes", href: batchDetailsUrl },
    { title: detail?.quizName || "Quiz Details" },
  ];

  // Fetch quiz metadata
  useEffect(() => {
    if (!quizId) return;
    setDetailLoading(true);
    getQuizDetailsApi(quizId)
      .then((res) => {
        if (res?.status) setDetail(res.data);
      })
      .catch(() => toast.error("Failed to load quiz details"))
      .finally(() => setDetailLoading(false));
  }, [quizId]);

  // Fetch submissions list when tab is Students
  const fetchSubmissions = useCallback(async () => {
    if (!quizId) return;
    setSubmissionsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      const res = await getQuizSubmissionsApi(quizId, params);
      if (res?.status) {
        setSubmissions(res.data?.submissions || []);
        setTotal(res.data?.total || 0);
      }
    } catch (_) {
      toast.error("Failed to load student submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  }, [quizId, page, search, limit]);

  useEffect(() => {
    if (activeTab === BatchTestTabs.STUDENTS) {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  // Debounced search
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
          {record.status !== "Not Started" && record.status !== "Not Submitted" && (
            <CommonButton
              text={record.status === "Graded" ? "Edit Grade" : "Grade"}
              onClick={() => {
                setSelectedSubmission(record);
                setGradeModal(true);
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
      <GradeModal
        open={gradeModal}
        submission={selectedSubmission}
        quizQuestions={detail?.questions || []}
        onClose={() => setGradeModal(false)}
        onSuccess={fetchSubmissions}
      />

      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex justify-between items-center">
        <TabSwitcher
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={BatchTestOptions}
        />
        <div className="text-secondary font-semibold text-[16px]">
          {detail ? `${detail.submittedCount} Submitted` : ""}
        </div>
      </div>

      {/* ── Quiz Details Tab ─────────────────────────────────────────────── */}
      {BatchTestTabs.QUIZZES_DETAILS === activeTab && (
        <div className="w-full flex flex-col gap-[24px]">
          {detailLoading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : detail ? (
            <>
              <div className="flex flex-col gap-[12px]">
                <div className="flex justify-between items-center">
                  <h1 className="font-[700] text-[24px] text-[#0E0E0E]">
                    {detail.quizName}
                  </h1>
                  <span className="text-xs px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/20 uppercase font-semibold">
                    Type: {detail.quizType}
                  </span>
                </div>
                <p className="text-secondary font-semibold text-[16px]">
                  Due on: {detail.dueDate} {detail.enableTimer && detail.timer && `| Time Limit: ${detail.timer}`}
                </p>
                <div className="font-[400] text-[16px] text-[#002333]">
                  <QuillEditor readOnly value={detail.overview || ""} />
                </div>
              </div>

              {detail.questions?.length > 0 && (
                <div className="w-full flex flex-col gap-[12px]">
                  <div className="flex justify-between items-center">
                    <h2 className="font-[700] text-[20px] text-[#0E0E0E]">
                      Questions ({detail.questions.length})
                    </h2>
                    <span className="text-sm font-semibold text-[#002333]">
                      Total Quiz Marks: {detail.totalMarks} Marks
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {detail.questions.map((item, index) => (
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
                              <div className="flex justify-between w-full pr-4">
                                <div className="flex gap-3 items-center">
                                  <span
                                    className={`rounded-[12px] px-2 py-0.5 text-[10px] uppercase font-bold whitespace-nowrap h-fit ${
                                      activeStep !== index.toString()
                                        ? "bg-secondary/10 text-secondary border border-secondary/20"
                                        : "bg-white text-secondary"
                                    }`}
                                  >
                                    {item.questionType === "mcq" ? "MCQ" : "Short Answer"}
                                  </span>
                                  <p
                                    className={`font-bold text-sm ${
                                      activeStep === index.toString()
                                        ? "text-white"
                                        : "text-[#002333]"
                                    }`}
                                  >
                                    Q{index + 1}. {item.question}
                                  </p>
                                </div>
                                <span
                                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                    activeStep === index.toString()
                                      ? "bg-white/20 text-white"
                                      : "bg-gray-100 text-gray-600 border border-gray-200"
                                  }`}
                                >
                                  {item.marks} Marks
                                </span>
                              </div>
                            ),
                            children: (
                              <div className="space-y-4">
                                {item.questionType === "mcq" ? (
                                  <div className="grid grid-cols-2 gap-4">
                                    {item.options?.map((opt, oIdx) => (
                                      <div
                                        key={oIdx}
                                        className={`rounded-3xl py-3 px-6 text-sm border ${
                                          opt === item.correctOption
                                            ? "bg-secondary text-white font-semibold border-secondary"
                                            : "bg-transparent border-gray-200 text-[#002333]"
                                        }`}
                                      >
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="bg-[#FAFDFE] border border-[#E0F2F1] rounded-xl p-4 flex flex-col gap-1.5">
                                    <span className="text-xs text-gray-500 font-semibold">Correct single-word answer:</span>
                                    <span className="text-secondary font-bold text-base capitalize">
                                      "{item.correctAnswer}"
                                    </span>
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
            <div className="text-center text-gray-500 py-10 bg-white rounded-xl">
              Quiz not found.
            </div>
          )}
        </div>
      )}

      {/* ── Students Tab ────────────────────────────────────────────────── */}
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
                  text="Filter"
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
