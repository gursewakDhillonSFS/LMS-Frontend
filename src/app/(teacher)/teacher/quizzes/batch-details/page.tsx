"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import TabSwitcher from "@/components/TabSwitcher";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import { InstructorQuizOptions } from "@/utils/constant";
import { InstructorQuizTab, RoutePaths } from "@/utils/enums";
import { DeleteIcon, EditIcon, QuizCardIcon } from "@/utils/icons";
import { AntDesignOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Skeleton, Tag, Tooltip } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import QuillEditor from "@/components/QuillEditor";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getQuizzesByBatchApi, deleteQuizApi } from "@/services/collections";
import { toast } from "react-toastify";

interface QuizRow {
  quiz_id: string;
  quizName: string;
  dueDate: string;
  quizType: string;
  overview: string;
  created_by: string | null;
  submittedCount: number;
}

const TeacherBatchDetailInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("course_id") || "";
  const batchId = searchParams.get("batch_id") || "";

  const userData = useSelector((state: RootState) => state.userdata);

  const [activeTab, setActiveTab] = useState<string>(
    InstructorQuizTab?.Ongoing
  );
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const items = [
    { title: "Quizzes", href: RoutePaths?.TeacherQuizzes },
    { title: "Batch Quizzes" },
  ];

  const fetchQuizzes = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("batchId", batchId);
      params.append("tab", activeTab === InstructorQuizTab.Ongoing ? "ongoing" : "past");
      params.append("page", "1");
      params.append("limit", "20");
      const res = await getQuizzesByBatchApi(params);
      if (res?.status) {
        setQuizzes(res.data?.quizzes || []);
      }
    } catch (_) {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }, [batchId, activeTab]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteQuizApi(deleteId);
      if (res?.status) {
        toast.success(res.message || "Quiz deleted");
        setDeleteModal(false);
        fetchQuizzes();
      } else {
        toast.warning(res?.message || "Failed to delete");
      }
    } catch (_) {
      toast.error("Error deleting quiz");
    } finally {
      setDeleteLoading(false);
    }
  };

  const addQuizUrl = `${RoutePaths?.TeacherQuizzes}/batch-details/add-quiz?course_id=${courseId}&batch_id=${batchId}`;
  const testDetailsUrl = (id: string) =>
    `${RoutePaths?.TeacherQuizzes}/batch-details/test-details?quiz_id=${id}&course_id=${courseId}&batch_id=${batchId}`;

  return (
    <div className="flex flex-col gap-[24px]">
      <ConfirmationModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onSubmit={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Quiz"
        description="Are you sure you want to delete this quiz? This action cannot be undone."
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
          tabs={InstructorQuizOptions}
        />
        {activeTab === InstructorQuizTab.Ongoing && (
          <CommonButton
            text={"+ Add Quizzes"}
            className="text-white !bg-secondary !w-auto !px-4"
            onClick={() => router.push(addQuizUrl)}
          />
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500">
          No {activeTab === InstructorQuizTab.Ongoing ? "ongoing" : "past"} quizzes found.{" "}
          {activeTab === InstructorQuizTab.Ongoing && (
            <span
              className="text-secondary cursor-pointer underline"
              onClick={() => router.push(addQuizUrl)}
            >
              Create one
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quizzes.map((test) => {
            const isOwner = test.created_by && String(test.created_by) === String(userData?.user_id);
            return (
              <div
                key={test.quiz_id}
                className="bg-white flex gap-[10px] p-4 rounded-xl w-full"
              >
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <QuizCardIcon />
                </div>
                <div className="flex-1 flex flex-col gap-[12px] w-full">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[20px] leading-[120%]">
                            {test.quizName}
                          </h3>
                          {isOwner ? (
                            <Tag color="success">My Quiz</Tag>
                          ) : (
                            <Tag color="default">Instructor Created</Tag>
                          )}
                        </div>
                        <p className="text-sm font-[500] leading-[150%] text-[#2D2D2D] mt-1">
                          <span className="font-semibold">Due on:</span>{" "}
                          {test.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `${RoutePaths?.TeacherQuizzes}/batch-details/add-quiz?course_id=${courseId}&batch_id=${batchId}&quiz_id=${test.quiz_id}&mode=edit`
                            )
                          }
                        >
                          <EditIcon />
                        </button>
                        <div className="w-[1px] h-6 bg-[#C8C8C8]" />
                        <button
                          onClick={() => {
                            setDeleteId(test.quiz_id);
                            setDeleteModal(true);
                          }}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 capitalize font-medium">
                      Type: {test.quizType}
                    </span>
                  </div>

                <div className="text-sm text-gray-500 line-clamp-2">
                  <QuillEditor readOnly value={test.overview || ""} />
                </div>

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center justify-center gap-2">
                    <Avatar.Group
                      size="default"
                      max={{
                        count: 2,
                        style: {
                          color: "#f56a00",
                          backgroundColor: "#fde3cf",
                          cursor: "pointer",
                        },
                        popover: { trigger: "click" },
                      }}
                    >
                      <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
                      <Tooltip title="Students" placement="top">
                        <Avatar style={{ backgroundColor: "#1677ff" }} icon={<AntDesignOutlined />} />
                      </Tooltip>
                    </Avatar.Group>
                    <div className="text-sm text-secondary font-semibold mt-1">
                      {test.submittedCount} Submitted
                    </div>
                  </div>

                  <CommonButton
                    text={activeTab === InstructorQuizTab.Ongoing ? "View" : "Check Quiz"}
                    onClick={() => router.push(testDetailsUrl(test.quiz_id))}
                    className="!h-8 !w-[100px]"
                  />
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BatchDetail = () => (
  <Suspense fallback={<Skeleton active />}>
    <TeacherBatchDetailInner />
  </Suspense>
);

export default BatchDetail;
