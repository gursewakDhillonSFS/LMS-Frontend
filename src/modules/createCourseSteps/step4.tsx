import ConfirmationModal from "@/components/modal/ConfirmationModal";
import LessonSublessonModal from "@/components/modal/LessonSublessonModal";
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
import { DeleteIcon, EditIcon, FileIcon, SixDotIcon } from "@/utils/icons";
import { DeleteFilled } from "@ant-design/icons";
import { Button, Collapse, Form, Input, UploadFile, UploadProps } from "antd";
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

  const transformToUploadFileList = (materials: { file_url: string; file_name: string; file_type: string }[] | undefined): UploadFile[] => {
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
            file_url: f.url?.replace(process.env.NEXT_PUBLIC_BACKEND_API_URL || '', ''),
            file_name: f.name,
            file_type: f.type?.includes('video') ? 'video' : 'pdf',
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
            file_url: f.url?.replace(process.env.NEXT_PUBLIC_BACKEND_API_URL || '', ''),
            file_name: f.name,
            file_type: f.type?.includes('video') ? 'video' : 'pdf',
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
    <div className="flex flex-col gap-4">
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
      <div className="rounded-xl p-6 bg-white flex flex-col gap-4">
        <div className="font-semibold text-xl">Overview</div>
        <Form.Item
          rules={[
            { required: true, message: "Overview is required" },
            {
              validator: (_, value) => {
                if (value && value.replace(/<[^>]+>/g, '').trim().length > 2000) {
                  return Promise.reject("Overview cannot exceed 2000 characters.");
                }
                return Promise.resolve();
              }
            }
          ]}
          name="overview"
          className="!mb-0"
        >
          <QuillEditor placeholder="Enter text here..." />
        </Form.Item>
      </div>
      <div className="rounded-xl p-6 bg-white flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <label className="font-semibold text-xl">
            What you&apos;ll learn
          </label>
          <div className="flex flex-col gap-3">
            {lessonData?.map((item, index) => {
              const isActive = Array.isArray(activeKey)
                ? activeKey.includes(index.toString())
                : activeKey === index.toString();
              return (
                <div key={index} className="flex items-center gap-1">
                  <SixDotIcon />
                  <Collapse
                    key={index}
                    accordion={true}
                    onChange={handleChange}
                    expandIconPosition="end"
                    activeKey={activeKey}
                    className={
                      isActive ? "!bg-[#F5FCFF] w-full" : "!bg-white w-full"
                    }
                    items={[
                      {
                        key: index.toString(),
                        label: (
                          <div className="flex items-center gap-2">
                            <p className={`text-[16px] font-[700]"`}>
                              {index + 1}.
                            </p>
                            <p className="text-[16px] font-[700]">
                              {item.lesson_name}
                            </p>
                          </div>
                        ),
                        children: (
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-1">
                              <div className="w-[95%] text-[16px] text-[#002333] break-words overflow-hidden">
                                <QuillEditor readOnly value={item?.lesson_description || ''} />
                              </div>
                              <div
                                className="cursor-pointer"
                                onClick={() => {
                                  setAddLessonModalStatus(true);
                                  setLessonName(item.lesson_name);
                                  setDescription(item.lesson_description);
                                  setFileList(transformToUploadFileList(item.studyMaterials));
                                  setUnlockAfterPrevious(
                                    item.unlock_after_previous
                                  );
                                  setIsEditing(true);
                                  setEditLessonId(item?.lesson_id);
                                }}
                              >
                                <EditIcon />
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {item.studyMaterials?.map((mat, i) => (
                                <div key={i}>
                                  <div className="flex gap-2 items-center border-b border-[#C8C8C8] pb-1">
                                    <div className="bg-primary rounded-full h-11 w-11 flex items-center justify-center text-white">
                                      <FileIcon />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[18px] font-semibold">
                                        {mat.file_name}
                                      </span>
                                      <span className="text-sm text-[#7B7B7B]">
                                        {mat.file_type}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col gap-2">
                              {item?.sublessons?.map((subItem, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="w-full bg-[#F7F7F7] rounded-xl p-3 flex flex-col gap-1"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="font-bold text-[18px]">
                                      {subItem.sublesson_name}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAddSubLessonModalStatus(true);
                                          setLessonName(
                                            subItem?.sublesson_name
                                          );
                                          setDescription(
                                            subItem.sublesson_description
                                          );
                                          setFileList(transformToUploadFileList(subItem.studyMaterials));
                                          setIsEditing(true);
                                          setEditLessonId(item?.lesson_id);
                                          setEditSublessonId(
                                            subItem?.sublesson_id
                                          );
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <EditIcon />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeleteTarget({
                                            type: "sublesson",
                                            id: subItem.sublesson_id,
                                          });
                                          setDeleteModalVisible(true);
                                        }}
                                      >
                                        <DeleteIcon />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="w-[95%] text-[16px] text-[#002333] break-words overflow-hidden">
                                    <QuillEditor readOnly value={subItem?.sublesson_description || ''} />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {subItem.studyMaterials?.map((mat, i) => (
                                      <div key={i} className="flex gap-1 items-center">
                                        <div className="bg-primary rounded-full h-11 w-11 flex items-center justify-center text-white">
                                          <FileIcon />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[18px] font-semibold">
                                            {mat.file_name}
                                          </span>
                                          <span className="text-sm text-[#7B7B7B]">
                                            {mat.file_type}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <div
                                className="text-secondary cursor-pointer"
                                onClick={() => {
                                  setAddSubLessonModalStatus(true);
                                  setAddSubLessonLessonId(item?.lesson_id);
                                }}
                              >
                                + Add Sub Topic
                              </div>
                            </div>
                          </div>
                        ),
                      },
                    ]}
                  />
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setDeleteTarget({ type: "lesson", id: item.lesson_id });
                      setDeleteModalVisible(true);
                    }}
                  >
                    <DeleteIcon />
                  </div>
                </div>
              );
            })}
            <Button
              onClick={() => setAddLessonModalStatus(true)}
              className="flex items-center justify-center text-base !border !border-secondary !text-secondary"
            >
              + Add a Lesson
            </Button>
          </div>
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
      />
    </div>
  );
};
