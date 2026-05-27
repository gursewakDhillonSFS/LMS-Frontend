"use client";
import { RootState } from "@/redux/store";
import {
  getAllLesson,
  updateCourseStep6,
  updateLesson,
  updateSublesson,
  createLessonApi,
  createSublessonApi,
} from "@/services/collections";
import { ClockWheelIcon, EditIcon, FileIcon } from "@/utils/icons";
import { Collapse, UploadFile, UploadProps } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { LessonDetails } from "../createCourseSteps/step4";
import { LoadingOutlined, RightOutlined } from "@ant-design/icons";
import LessonSublessonModal from "@/components/modal/LessonSublessonModal";
import NoDataFound from "@/components/NoDataFound";
import { DataNotFound } from "@/utils/images";
import EditOverviewModal from "@/components/modal/EditOverviewModal";
import QuillEditor from "@/components/QuillEditor";
const InstructorLesson = () => {
  const [activeKey, setActiveKey] = useState<string[] | string>([]);
  const data = useSelector((state: RootState) => state?.courseData?.course);
  const role_name = useSelector((state: RootState) => state.userdata?.role_name);
  const isTeacher = role_name === "teacher";
  const [lessonData, setLessonData] = useState<LessonDetails[]>([]);
  const [overview, setOverview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const handleChange = (key: string | string[]) => {
    setActiveKey(key);
  };
  const [addLessonModalStatus, setAddLessonModalStatus] = useState(false);
  const [addSubLessonModalStatus, setAddSubLessonModalStatus] = useState(false);
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [editSublessonId, setEditSublessonId] = useState<string | null>(null);
  const [lessonName, setLessonName] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [unlockAfterPrevious, setUnlockAfterPrevious] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isEditing, setIsEditing] = useState(false);

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

  const removeFile = (index: number) => {
    const newList = [...fileList];
    newList.splice(index, 1);
    setFileList(newList);
  };
  const handleFinish = async (overview: string) => {
    if (!data?.course_id) return;
    setLoading(true);
    try {
      const course_id = data?.course_id;
      const payload = {
        overview,
        course_id,
      };
      const res = await updateCourseStep6(payload);
      if (res.status) {
        toast.success(res.message);
        getLessonList();
        setEditModalVisible(false);
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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

  const transformToUploadFileList = (file: {
    url: string;
    name: string;
    type: string;
  }): UploadFile[] => {
    return [
      {
        uid: file.url,
        name: file.name,
        status: "done",
        type: file.type === "video" ? "video/mp4" : "application/pdf",
        url: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${file.url}`,
      },
    ];
  };

  const getLessonList = useCallback(async () => {
    setLoading(true);
    const param = new URLSearchParams();
    if (data?.course_id) param.append("course_id", data?.course_id);
    try {
      const res = await getAllLesson(param);
      if (res.status) {
        setLessonData(res?.data?.lessons);
        setOverview(res?.data?.overview);
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [data?.course_id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing && editLessonId) {
        const lessonDataPayload = {
          course_id: data?.course_id,
          lesson_id: editLessonId,
          lesson_name: lessonName,
          description,
          unlock_after_previous: unlockAfterPrevious,
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
          toast.success(res.message || "Lesson updated successfully!");
          getLessonList();
          onClose();
        } else {
          toast.error(res.message || "Failed to update lesson.");
        }
      } else {
        const lessonDataPayload = {
          course_id: data?.course_id,
          lesson_name: lessonName,
          lesson_description: description,
          unlock_after_previous: unlockAfterPrevious,
        };
        const formData = new FormData();
        formData.append("lessonData", JSON.stringify(lessonDataPayload));
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("photo", file.originFileObj as File);
          }
        });
        const res = await createLessonApi(formData);
        if (res.status) {
          toast.success(res.message || "Lesson created successfully!");
          getLessonList();
          onClose();
        } else {
          toast.error(res.message || "Failed to create lesson.");
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving lesson:", error);
      toast.error("An error occurred saving the lesson.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubLessonSave = async () => {
    setLoading(true);
    try {
      if (isEditing && editLessonId && editSublessonId) {
        const subLessonPayload = {
          course_id: data?.course_id,
          sublesson_id: editSublessonId,
          lesson_id: editLessonId,
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
        const res = await updateSublesson(formData);
        if (res.status) {
          toast.success(res.message || "Sublesson updated successfully!");
          getLessonList();
          onClose();
        } else {
          toast.error(res.message || "Failed to update sublesson.");
        }
      } else if (editLessonId) {
        const subLessonPayload = {
          course_id: data?.course_id,
          lesson_id: editLessonId,
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
        const res = await createSublessonApi(formData);
        if (res.status) {
          toast.success(res.message || "Sub-topic created successfully!");
          getLessonList();
          onClose();
        } else {
          toast.error(res.message || "Failed to create sub-topic.");
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving sub-topic:", error);
      toast.error("An error occurred saving the sub-topic.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLessonList();
  }, [getLessonList]);

  return (
    <div className="w-full flex flex-col gap-[12px]">
      <EditOverviewModal
        visible={editModalVisible}
        overview={overview}
        handleFinish={handleFinish}
        onCancel={() => setEditModalVisible(false)}
      />
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center justify-between">
          <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Overview</h1>
          {!isTeacher && (
            <button onClick={() => setEditModalVisible(true)}>
              <EditIcon />
            </button>
          )}
        </div>
        <div className="font-[400] text-[16px] text-[#002333]">
          <QuillEditor readOnly value={overview || ''} />
        </div>
      </div>

      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center justify-between">
          <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Lesson</h1>
          {!isTeacher && (
            <button
              onClick={() => {
                onClose();
                setIsEditing(false);
                setAddLessonModalStatus(true);
              }}
              className="px-4 py-2 bg-secondary text-white rounded font-semibold text-sm hover:bg-opacity-90 transition"
            >
              + Add Lesson
            </button>
          )}
        </div>
        <div className="flex flex-col gap-[12px]">
          {loading || lessonData?.length > 0 ? (
            loading ? (
              <div className="flex items-center justify-center h-[10vh] w-full">
                <LoadingOutlined spin />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {lessonData?.map((item, index) => {
                  const isActive = Array.isArray(activeKey)
                    ? activeKey.includes(index.toString())
                    : activeKey === index.toString();

                  return (
                    <div key={index} className="flex items-center gap-3 ">
                      <Collapse
                        key={index}
                        accordion={true}
                        onChange={handleChange}
                        expandIconPosition="end"
                        prefixCls="custom-course-collapse"
                        activeKey={activeKey}
                        className={`${
                          isActive ? "!bg-secondary w-full" : "!bg-white w-full"
                        }`}
                        expandIcon={({ isActive }) => (
                          <RightOutlined
                            style={{
                              color: isActive ? "white" : "black",
                              transform: isActive
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              transition: "0.2s",
                            }}
                          />
                        )}
                        items={[
                          {
                            key: index.toString(),
                            label: (
                              <div className="flex items-center justify-between gap-2">
                                <p
                                  className={`text-[16px] font-[700] ${
                                    isActive ? "text-white" : "text-[#0E0E0E]"
                                  }`}
                                >
                                  {item?.lesson_name ?? "2.032131"}
                                </p>
                              </div>
                            ),
                            children: (
                              <div className="flex flex-col gap-4 w-full">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="text-[#002333] text-[16px] leading-[150%] flex-1">
                                      <QuillEditor readOnly value={item?.lesson_description || ''} />
                                    </div>
                                    {!isTeacher && (
                                      <div
                                        className="cursor-pointer mt-2"
                                        onClick={() => {
                                        setAddLessonModalStatus(true);
                                        setLessonName(item.lesson_name);
                                        setDescription(item.lesson_description);
                                        setFileList(
                                          transformToUploadFileList({
                                            url: item.file_url,
                                            name: item.file_name,
                                            type: item.file_type,
                                          })
                                        );
                                        setUnlockAfterPrevious(
                                          item.unlock_after_previous
                                        );
                                        setIsEditing(true);
                                        setEditLessonId(item?.lesson_id);
                                      }}
                                    >
                                      <EditIcon />
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col gap-3">
                                  {/* {item?.studyMaterials?.map((material, i) => ( */}
                                  <div
                                    // key={i}
                                    // className={`flex items-center justify-between ${
                                    //   i < item?.studyMaterials.length - 1
                                    //     ? "border-b border-[#C8C8C8]"
                                    //     : ""
                                    // }  p-3`}
                                    className="flex items-center justify-between p-3"
                                  >
                                    <div className="flex gap-3">
                                      <div className="bg-primary rounded-full h-11 w-11 flex items-center justify-center text-white font-bold">
                                        {/* {material?.type === "file" ? ( */}
                                        <FileIcon />
                                        {/* ) : (
                                      <VideoIcon />
                                    )} */}
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <p className="text-[18px] font-[600] leading-[120%]">
                                          {item?.file_name}
                                        </p>
                                        <p className="text-sm text-[#7B7B7B] leading-[120%] flex gap-1 items-center">
                                          <ClockWheelIcon />
                                          {item.file_type}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {/* ))} */}
                                </div>

                                {/* Sub Topics */}
                                <div className="flex flex-col gap-4">
                                  {item?.sublessons?.map((sub, si) => (
                                    <div
                                      key={si}
                                      className="w-full bg-[#F7F7F7] rounded-xl p-3 flex flex-col gap-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="font-bold text-[18px]">
                                          {sub.sublesson_name}
                                        </div>
                                        {!isTeacher && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setAddSubLessonModalStatus(true);
                                              setLessonName(sub?.sublesson_name);
                                              setDescription(
                                                sub.sublesson_description
                                              );
                                              setFileList(
                                                transformToUploadFileList({
                                                  url: item.file_url,
                                                  name: item.file_name,
                                                  type: item.file_type,
                                                })
                                              );
                                              setIsEditing(true);
                                              setEditLessonId(item?.lesson_id);
                                              setEditSublessonId(
                                                sub?.sublesson_id
                                              );
                                            }}
                                            className="cursor-pointer"
                                          >
                                            <EditIcon />
                                          </button>
                                        )}
                                      </div>
                                      <div>
                                        <QuillEditor readOnly value={sub.sublesson_description || ''} />
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        {/* {sub.studyMaterials?.map((material, i) => ( */}
                                        <div
                                          // key={i}
                                          // className={`flex items-center justify-between ${
                                          //   i < sub.studyMaterials.length - 1
                                          //     ? "border-b border-[#C8C8C8]"
                                          //     : ""
                                          // } p-3`}
                                          className="flex items-center justify-between p-3"
                                        >
                                          <div className="flex gap-3">
                                            <div className="bg-primary rounded-full h-11 w-11 flex items-center justify-center text-white font-bold">
                                              {/* {material?.type === "file" ? ( */}
                                              <FileIcon />
                                              {/* ) : (
                                            <VideoIcon />
                                          )} */}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                              <p className="text-[18px] font-[600] leading-[120%]">
                                                {sub.file_name}
                                              </p>
                                              <p className="text-sm text-[#7B7B7B] leading-[120%] flex gap-1 items-center">
                                                <ClockWheelIcon />
                                                {sub.file_type}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        {/* ))} */}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                  {!isTeacher && (
                                    <div className="flex justify-center mt-2">
                                      <button
                                        onClick={() => {
                                          onClose();
                                          setIsEditing(false);
                                          setEditLessonId(item?.lesson_id);
                                          setAddSubLessonModalStatus(true);
                                        }}
                                        className="px-4 py-2 bg-white text-secondary border border-secondary rounded font-medium text-sm hover:bg-secondary hover:text-white transition w-full md:w-auto flex items-center justify-center"
                                      >
                                        + Add Sub Topic
                                      </button>
                                    </div>
                                  )}
                                </div>
                            ),
                          },
                        ]}
                      />
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <NoDataFound icon={DataNotFound} />
          )}
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

export default InstructorLesson;
