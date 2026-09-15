import ConfirmationModal from "@/components/modal/ConfirmationModal";
import LessonSublessonModal from "@/components/modal/LessonSublessonModal";
import MediaPreviewModal, { PreviewFile } from "@/components/modal/MediaPreviewModal";
import { RootState } from "@/redux/store";
import {
  createLesson,
  createSubLesson,
  deleteLesson,
  deleteSublesson,
  getAllLesson,
  updateLesson,
  updateSublesson,
} from "@/services/collections";
import { DeleteIcon, EditIcon, SixDotIcon } from "@/utils/icons";
import {
  DeleteFilled,
  EyeOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
  FileOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Form, UploadFile, UploadProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import QuillEditor from "@/components/QuillEditor";
import { useSelector } from "react-redux";
import { toast } from "@/utils/toast";

export interface SubLesson {
  sublesson_id: string;
  sublesson_name: string;
  sublesson_description: string;
  studyMaterials?: { file_url: string; file_name: string; file_type: string }[];
  duration: string | null;
  uploaded_at: string;
}

export interface LessonDetails {
  lesson_id: string;
  lesson_name: string;
  unlock_after_previous: boolean;
  lesson_description: string;
  studyMaterials?: { file_url: string; file_name: string; file_type: string }[];
  uploaded_at: string;
  sublessons: SubLesson[];
}

export const Step4 = () => {
  const [addLessonModalStatus, setAddLessonModalStatus] = useState(false);
  const [addSubLessonModalStatus, setAddSubLessonModalStatus] = useState(false);
  const [activeKey, setActiveKey] = useState<string | string[]>([]);
  const [lessonData, setLessonData] = useState<LessonDetails[]>([]);
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [editSublessonId, setEditSublessonId] = useState<string | null>(null);
  const [addSubLessonLessonId, setAddSubLessonLessonId] = useState<
    string | null
  >(null);
  const [lessonName, setLessonName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [unlockAfterPrevious, setUnlockAfterPrevious] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const course_id = useSelector(
    (state: RootState) => state.createCourse.course_id
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "lesson" | "sublesson";
    id: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Document & Media Preview state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const handlePreviewFile = (mat: {
    file_url: string;
    file_name: string;
    file_type: string;
  }) => {
    setPreviewFile({
      name: mat.file_name,
      url: mat.file_url,
      type: mat.file_type,
    });
    setPreviewModalOpen(true);
  };

  const handleChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      let res;
      if (deleteTarget.type === "lesson") {
        res = await deleteLesson(deleteTarget.id);
      } else {
        res = await deleteSublesson(deleteTarget.id);
      }

      if (res?.status) {
        toast.success(res.message);
        getLessonList();
      } else {
        toast.warning(res.message);
      }
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setDeleteModalVisible(false);
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const getLessonList = useCallback(async () => {
    if (!course_id) return;
    const param = new URLSearchParams();
    param.append("course_id", course_id);
    try {
      const res = await getAllLesson(param);
      if (res.status) {
        setLessonData(res?.data?.lessons);
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, [course_id]);

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    multiple: true,
    fileList,
    onChange(info) {
      setFileList(info.fileList);
    },
    onRemove(file) {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const transformToUploadFileList = (
    materials:
      | { file_url: string; file_name: string; file_type: string }[]
      | undefined
  ): UploadFile[] => {
    if (!materials) return [];
    return materials.map((mat) => ({
      uid: mat.file_url,
      name: mat.file_name,
      status: "done",
      type: mat.file_type === "video" ? "video/mp4" : "application/pdf",
      url: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${mat.file_url}`,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing && editLessonId) {
        const existing_files = fileList
          .filter((f) => !f.originFileObj)
          .map((f) => ({
            file_url: f.url?.replace(
              process.env.NEXT_PUBLIC_BACKEND_API_URL || "",
              ""
            ),
            file_name: f.name,
            file_type: f.type?.includes("video") ? "video" : "pdf",
          }));

        const lessonDataPayload = {
          course_id: course_id,
          lesson_id: editLessonId,
          lesson_name: lessonName,
          description,
          unlock_after_previous: unlockAfterPrevious,
          existing_files,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(lessonDataPayload));
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("photo", file.originFileObj as File);
          }
        });
        const res = await updateLesson(formData);
        if (res.status) {
          getLessonList();
          onClose();
        }
      } else {
        const lessonDataPayload = {
          course_id: course_id,
          lesson_name: lessonName,
          description,
          unlock_after_previous: unlockAfterPrevious,
        };

        const formData = new FormData();
        formData.append("lessonData", JSON.stringify(lessonDataPayload));
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("photo", file.originFileObj as File);
          }
        });
        const res = await createLesson(formData);
        if (res.status) {
          toast.success(res.message);
          getLessonList();
          onClose();
        } else {
          toast.warning(res.message);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubLessonSave = async () => {
    setLoading(true);
    try {
      if (isEditing && editLessonId && editSublessonId) {
        const existing_files = fileList
          .filter((f) => !f.originFileObj)
          .map((f) => ({
            file_url: f.url?.replace(
              process.env.NEXT_PUBLIC_BACKEND_API_URL || "",
              ""
            ),
            file_name: f.name,
            file_type: f.type?.includes("video") ? "video" : "pdf",
          }));

        const subLessonPayload = {
          course_id: course_id,
          sublesson_id: editSublessonId,
          lesson_id: editLessonId,
          Sublesson_name: lessonName,
          description,
          existing_files,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(subLessonPayload));
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("photo", file.originFileObj as File);
          }
        });
        const res = await updateSublesson(formData);
        if (res.status) {
          toast.success(res.message);
          getLessonList();
          onClose();
        } else {
          setLoading(false);
          toast.success(res.message);
        }
      } else if (addSubLessonLessonId) {
        const subLessonPayload = {
          course_id: course_id,
          lesson_id: addSubLessonLessonId,
          Sublesson_name: lessonName,
          description,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(subLessonPayload));
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("photo", file.originFileObj as File);
          }
        });
        const res = await createSubLesson(formData);

        if (res.status) {
          toast.success(res.message);
          getLessonList();
          onClose();
        } else {
          setLoading(false);
          toast.success(res.message);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving sub-topic:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    const newList = [...fileList];
    newList.splice(index, 1);
    setFileList(newList);
  };

  const onClose = () => {
    setAddLessonModalStatus(false);
    setAddSubLessonModalStatus(false);
    setLessonName("");
    setDescription("");
    setFileList([]);
    setUnlockAfterPrevious(false);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing) {
      setLessonName("");
      setDescription("");
      setFileList([]);
      setUnlockAfterPrevious(false);
    }
  }, [isEditing, addLessonModalStatus, addSubLessonModalStatus]);

  useEffect(() => {
    getLessonList();
  }, [getLessonList]);

  return (
    <div className="flex flex-col gap-6">
      <MediaPreviewModal
        open={previewModalOpen}
        file={previewFile}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewFile(null);
        }}
      />

      {deleteModalVisible && (
        <ConfirmationModal
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          onSubmit={handleConfirmDelete}
          loading={deleteLoading}
          title="Delete"
          description={`Are you sure you want to Delete this ${deleteTarget?.type}`}
          iconBG="#FB4A49"
          icon={<DeleteFilled className="text-4xl !text-white" />}
        />
      )}

      {/* Course Overview Card */}
      <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            Curriculum Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provide a syllabus outline and instructions for completing the lessons
          </p>
        </div>
        <Form.Item
          rules={[
            { required: true, message: "Overview is required" },
            {
              validator: (_, value) => {
                if (
                  value &&
                  value.replace(/<[^>]+>/g, "").trim().length > 2000
                ) {
                  return Promise.reject(
                    "Overview cannot exceed 2000 characters."
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          name="overview"
          className="!mb-0"
        >
          <QuillEditor
            minHeight="140px"
            placeholder="Introduce the syllabus, pace, and graduation expectations..."
          />
        </Form.Item>
      </div>

      {/* Lessons & Sub-topics Card */}
      <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Course Lessons & Structure
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add lessons, sub-topics, descriptions, and uploaded study materials
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
            {lessonData?.length || 0} Lessons Added
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {lessonData?.map((item, index) => {
            const isActive = Array.isArray(activeKey)
              ? activeKey.includes(index.toString())
              : activeKey === index.toString();

            return (
              <div
                key={index}
                className="flex items-start gap-2 group w-full"
              >
                <div className="text-slate-400 pt-3 cursor-grab">
                  <SixDotIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <Collapse
                    accordion={true}
                    onChange={handleChange}
                    expandIconPosition="end"
                    activeKey={activeKey}
                    className={`!rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isActive
                        ? "!bg-white border-secondary shadow-sm"
                        : "!bg-slate-50/60 border-slate-200 hover:border-slate-300"
                    }`}
                    items={[
                      {
                        key: index.toString(),
                        label: (
                          <div className="flex items-center justify-between gap-3 pr-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-7 h-7 rounded-lg bg-secondary text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {item.lesson_name}
                              </p>
                              {item.unlock_after_previous && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hidden sm:inline-block">
                                  Sequential Unlock
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">
                                {item.sublessons?.length || 0} Sub-topics
                              </span>
                            </div>
                          </div>
                        ),
                        children: (
                          <div className="flex flex-col gap-4 pt-1">
                            {/* Lesson description */}
                            <div className="flex items-start justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                              <div className="flex-1 text-sm text-slate-700 leading-relaxed">
                                <QuillEditor
                                  readOnly
                                  value={item?.lesson_description || ""}
                                />
                              </div>
                              <button
                                type="button"
                                title="Edit Lesson"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                                onClick={() => {
                                  setAddLessonModalStatus(true);
                                  setLessonName(item.lesson_name);
                                  setDescription(item.lesson_description);
                                  setFileList(
                                    transformToUploadFileList(item.studyMaterials)
                                  );
                                  setUnlockAfterPrevious(
                                    item.unlock_after_previous
                                  );
                                  setIsEditing(true);
                                  setEditLessonId(item?.lesson_id);
                                }}
                              >
                                <EditIcon />
                              </button>
                            </div>

                            {/* Lesson Study Materials with PREVIEW button */}
                            {item.studyMaterials &&
                              item.studyMaterials.length > 0 && (
                                <div className="flex flex-col gap-2">
                                  <span className="text-xs font-bold text-slate-700">
                                    Attached Study Materials ({item.studyMaterials.length})
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {item.studyMaterials.map((mat, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs gap-2"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-secondary border border-blue-100/60 flex items-center justify-center shrink-0">
                                            {mat.file_type === "video" ? (
                                              <VideoCameraOutlined />
                                            ) : (
                                              <FilePdfOutlined className="text-rose-500" />
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                              {mat.file_name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold">
                                              {mat.file_type}
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handlePreviewFile(mat)}
                                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-secondary/10 hover:border-secondary hover:text-secondary text-xs font-semibold text-slate-700 transition cursor-pointer shrink-0"
                                        >
                                          <EyeOutlined className="text-xs" />
                                          <span>Preview</span>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Sublessons List */}
                            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                              <span className="text-xs font-bold text-slate-700">
                                Sub-Topics ({item.sublessons?.length || 0})
                              </span>

                              {item?.sublessons?.map((subItem, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="w-full bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col gap-2.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                        {index + 1}.{subIndex + 1}
                                      </span>
                                      <h4 className="font-bold text-xs text-slate-900 truncate">
                                        {subItem.sublesson_name}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        title="Edit Sub-topic"
                                        onClick={() => {
                                          setAddSubLessonModalStatus(true);
                                          setLessonName(
                                            subItem?.sublesson_name
                                          );
                                          setDescription(
                                            subItem.sublesson_description
                                          );
                                          setFileList(
                                            transformToUploadFileList(
                                              subItem.studyMaterials
                                            )
                                          );
                                          setIsEditing(true);
                                          setEditLessonId(item?.lesson_id);
                                          setEditSublessonId(
                                            subItem?.sublesson_id
                                          );
                                        }}
                                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-50 transition cursor-pointer"
                                      >
                                        <EditIcon />
                                      </button>
                                      <button
                                        type="button"
                                        title="Delete Sub-topic"
                                        onClick={() => {
                                          setDeleteTarget({
                                            type: "sublesson",
                                            id: subItem.sublesson_id,
                                          });
                                          setDeleteModalVisible(true);
                                        }}
                                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                      >
                                        <DeleteIcon />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-2.5 rounded-lg">
                                    <QuillEditor
                                      readOnly
                                      value={
                                        subItem?.sublesson_description || ""
                                      }
                                    />
                                  </div>

                                  {/* Sublesson Study Materials with PREVIEW button */}
                                  {subItem.studyMaterials &&
                                    subItem.studyMaterials.length > 0 && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                        {subItem.studyMaterials.map(
                                          (mat, i) => (
                                            <div
                                              key={i}
                                              className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/50 gap-2"
                                            >
                                              <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 text-secondary flex items-center justify-center shrink-0">
                                                  {mat.file_type ===
                                                  "video" ? (
                                                    <VideoCameraOutlined className="text-xs" />
                                                  ) : (
                                                    <FilePdfOutlined className="text-xs text-rose-500" />
                                                  )}
                                                </div>
                                                <p className="text-xs font-medium text-slate-800 truncate">
                                                  {mat.file_name}
                                                </p>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handlePreviewFile(mat)
                                                }
                                                className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:border-secondary hover:text-secondary text-[11px] font-semibold text-slate-700 transition cursor-pointer shrink-0"
                                              >
                                                <EyeOutlined className="text-[10px]" />
                                                <span>Preview</span>
                                              </button>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                </div>
                              ))}

                              <button
                                type="button"
                                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-dashed border-secondary/40 text-secondary hover:bg-secondary/5 font-semibold text-xs transition cursor-pointer mt-1"
                                onClick={() => {
                                  setAddSubLessonModalStatus(true);
                                  setAddSubLessonLessonId(item?.lesson_id);
                                }}
                              >
                                <PlusOutlined className="text-xs" />
                                <span>Add Sub-Topic</span>
                              </button>
                            </div>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
                <button
                  type="button"
                  title="Delete Lesson"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer mt-2"
                  onClick={() => {
                    setDeleteTarget({ type: "lesson", id: item.lesson_id });
                    setDeleteModalVisible(true);
                  }}
                >
                  <DeleteIcon />
                </button>
              </div>
            );
          })}

          {(!lessonData || lessonData.length === 0) && (
            <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/40">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center text-xl mb-3">
                <FileOutlined />
              </div>
              <h4 className="font-bold text-slate-800 text-base">
                No Lessons Added Yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Start structuring your curriculum by adding your first core lesson and attaching learning resources.
              </p>
            </div>
          )}

          <Button
            onClick={() => setAddLessonModalStatus(true)}
            className="w-full !h-12 flex items-center justify-center text-sm font-bold !border-secondary !bg-secondary/5 hover:!bg-secondary/10 !text-secondary rounded-xl shadow-2xs"
          >
            + Add a Lesson
          </Button>
        </div>
      </div>

      <LessonSublessonModal
        addLessonModalStatus={addLessonModalStatus}
        addSubLessonModalStatus={addSubLessonModalStatus}
        lessonName={lessonName}
        description={description}
        fileList={fileList}
        uploadProps={uploadProps}
        unlockAfterPrevious={unlockAfterPrevious}
        loading={loading}
        isEditing={isEditing}
        onClose={onClose}
        setLessonName={setLessonName}
        setDescription={setDescription}
        setUnlockAfterPrevious={setUnlockAfterPrevious}
        removeFile={removeFile}
        handleSave={handleSave}
        handleSubLessonSave={handleSubLessonSave}
        onPreviewFile={(f) => {
          setPreviewFile(f);
          setPreviewModalOpen(true);
        }}
      />
    </div>
  );
};

