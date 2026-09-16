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
import { toast } from "@/utils/toast";
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
  const [totalWeeks, setTotalWeeks] = useState<number>(4);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | "all">("all");
  const [lessonWeek, setLessonWeek] = useState<number>(1);
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

  const getLessonList = useCallback(async () => {
    setLoading(true);
    const param = new URLSearchParams();
    if (data?.course_id) param.append("course_id", data?.course_id);
    try {
      const res = await getAllLesson(param);
      if (res.status) {
        setLessonData(res?.data?.lessons || []);
        setOverview(res?.data?.overview || "");
        if (res?.data?.total_weeks) {
          setTotalWeeks(Number(res.data.total_weeks));
        }
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
        const existing_files = fileList
          .filter((f) => !f.originFileObj)
          .map((f) => ({
            file_url: f.url?.replace(process.env.NEXT_PUBLIC_BACKEND_API_URL || '', ''),
            file_name: f.name,
            file_type: f.type?.includes('video') ? 'video' : 'pdf',
          }));

        const lessonDataPayload = {
          course_id: data?.course_id,
          lesson_id: editLessonId,
          lesson_name: lessonName,
          description,
          unlock_after_previous: unlockAfterPrevious,
          week: lessonWeek || 1,
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
          week: lessonWeek || 1,
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
        const existing_files = fileList
          .filter((f) => !f.originFileObj)
          .map((f) => ({
            file_url: f.url?.replace(process.env.NEXT_PUBLIC_BACKEND_API_URL || '', ''),
            file_name: f.name,
            file_type: f.type?.includes('video') ? 'video' : 'pdf',
          }));

        const subLessonPayload = {
          course_id: data?.course_id,
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
        <div className="font-[400] text-[16px] text-[#002333] break-words">
          <QuillEditor readOnly value={overview || ''} />
        </div>
      </div>

      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Course Curriculum & Lessons</h1>
            <p className="text-xs text-gray-500 mt-0.5">Organized week-by-week for structured student learning</p>
          </div>
          {!isTeacher && (
            <button
              onClick={() => {
                onClose();
                setIsEditing(false);
                setLessonWeek(selectedWeekFilter === "all" ? 1 : selectedWeekFilter);
                setAddLessonModalStatus(true);
              }}
              className="px-4 py-2 bg-secondary text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 transition shadow-sm self-start sm:self-auto"
            >
              + Add Lesson
            </button>
          )}
        </div>

        {/* Week Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedWeekFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedWeekFilter === "all"
                ? "bg-secondary text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Weeks ({totalWeeks} Weeks)
          </button>
          {Array.from({ length: totalWeeks }, (_, idx) => idx + 1).map((w) => {
            const count = (lessonData || []).filter((l) => (l.week || 1) === w).length;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWeekFilter(w)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedWeekFilter === w
                    ? "bg-secondary text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>Week {w}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedWeekFilter === w ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center h-[12vh] w-full">
              <LoadingOutlined spin className="text-secondary text-2xl" />
            </div>
          ) : lessonData?.length === 0 ? (
            <NoDataFound icon={DataNotFound} />
          ) : (
            (selectedWeekFilter === "all"
              ? Array.from({ length: totalWeeks }, (_, idx) => idx + 1)
              : [selectedWeekFilter]
            ).map((weekNum) => {
              const weekLessons = (lessonData || []).filter(
                (l) => (l.week || 1) === weekNum
              );

              return (
                <div
                  key={weekNum}
                  className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-md bg-secondary/10 text-secondary font-bold text-xs tracking-wider uppercase">
                        Week {weekNum}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {weekLessons.length} {weekLessons.length === 1 ? "Lesson" : "Lessons"}
                      </span>
                    </div>

                    {!isTeacher && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          setIsEditing(false);
                          setLessonWeek(weekNum);
                          setAddLessonModalStatus(true);
                        }}
                        className="text-xs font-semibold text-secondary hover:text-secondary/80 flex items-center gap-1 transition"
                      >
                        + Add Lesson to Week {weekNum}
                      </button>
                    )}
                  </div>

                  {weekLessons.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      No lessons scheduled for Week {weekNum} yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {weekLessons.map((item, index) => {
                        const collapseKey = `${weekNum}-${item.lesson_id || index}`;
                        const isActive = Array.isArray(activeKey)
                          ? activeKey.includes(collapseKey)
                          : activeKey === collapseKey;

                        return (
                          <div key={collapseKey} className="flex items-center gap-3">
                            <Collapse
                              accordion={false}
                              onChange={(key) => setActiveKey(key)}
                              expandIconPosition="end"
                              prefixCls="custom-course-collapse"
                              activeKey={activeKey}
                              className={`${
                                isActive ? "!bg-secondary w-full" : "!bg-[#FAFAFA] w-full"
                              } border border-gray-200/60 rounded-xl overflow-hidden transition-all`}
                              expandIcon={({ isActive }) => (
                                <RightOutlined
                                  style={{
                                    color: isActive ? "white" : "#4B5563",
                                    transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                  }}
                                />
                              )}
                              items={[
                                {
                                  key: collapseKey,
                                  label: (
                                    <div className="flex items-center justify-between gap-2 py-1">
                                      <p
                                        className={`text-[15px] font-[600] ${
                                          isActive ? "text-white" : "text-[#0E0E0E]"
                                        }`}
                                      >
                                        {item?.lesson_name}
                                      </p>
                                    </div>
                                  ),
                                  children: (
                                    <div className="flex flex-col gap-4 w-full bg-white p-3 rounded-lg">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="text-[#002333] text-[15px] leading-[150%] flex-1 break-words">
                                          <QuillEditor readOnly value={item?.lesson_description || ""} />
                                        </div>
                                        {!isTeacher && (
                                          <div
                                            className="cursor-pointer mt-1 p-1.5 hover:bg-gray-100 rounded-md transition"
                                            onClick={() => {
                                              setAddLessonModalStatus(true);
                                              setLessonName(item.lesson_name);
                                              setDescription(item.lesson_description);
                                              setFileList(transformToUploadFileList(item.studyMaterials));
                                              setUnlockAfterPrevious(item.unlock_after_previous);
                                              setLessonWeek(item.week || weekNum);
                                              setIsEditing(true);
                                              setEditLessonId(item?.lesson_id);
                                            }}
                                          >
                                            <EditIcon />
                                          </div>
                                        )}
                                      </div>

                                      {/* Study Materials */}
                                      {item?.studyMaterials && item.studyMaterials.length > 0 && (
                                        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Study Materials ({item.studyMaterials.length})
                                          </span>
                                          {item.studyMaterials.map((material, i) => (
                                            <div
                                              key={i}
                                              className="flex items-center justify-between bg-gray-50/80 p-2.5 rounded-lg border border-gray-100"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="bg-primary rounded-lg h-9 w-9 flex items-center justify-center text-white font-bold">
                                                  <FileIcon />
                                                </div>
                                                <div className="flex flex-col">
                                                  <p className="text-[14px] font-[600] text-gray-800">
                                                    {material?.file_name}
                                                  </p>
                                                  <p className="text-xs text-[#7B7B7B] flex gap-1 items-center">
                                                    <ClockWheelIcon />
                                                    {material.file_type}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Sub Topics */}
                                      {item?.sublessons && item.sublessons.length > 0 && (
                                        <div className="flex flex-col gap-3 border-t border-gray-100 pt-3">
                                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Sub-Topics ({item.sublessons.length})
                                          </span>
                                          {item.sublessons.map((sub, si) => (
                                            <div
                                              key={si}
                                              className="w-full bg-[#F9FAFB] rounded-xl p-3.5 flex flex-col gap-2 border border-gray-100"
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="font-bold text-[15px] text-gray-800">
                                                  {sub.sublesson_name}
                                                </div>
                                                {!isTeacher && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setAddSubLessonModalStatus(true);
                                                      setLessonName(sub?.sublesson_name);
                                                      setDescription(sub.sublesson_description);
                                                      setFileList(transformToUploadFileList(sub.studyMaterials));
                                                      setIsEditing(true);
                                                      setEditLessonId(item?.lesson_id);
                                                      setEditSublessonId(sub?.sublesson_id);
                                                    }}
                                                    className="cursor-pointer p-1 hover:bg-gray-200 rounded transition"
                                                  >
                                                    <EditIcon />
                                                  </button>
                                                )}
                                              </div>
                                              <div className="break-words text-sm">
                                                <QuillEditor readOnly value={sub.sublesson_description || ""} />
                                              </div>
                                              {sub.studyMaterials && sub.studyMaterials.length > 0 && (
                                                <div className="flex flex-col gap-2 pt-2">
                                                  {sub.studyMaterials.map((material, mi) => (
                                                    <div
                                                      key={mi}
                                                      className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100"
                                                    >
                                                      <div className="flex items-center gap-2.5">
                                                        <div className="bg-primary/90 rounded-md h-7 w-7 flex items-center justify-center text-white text-xs">
                                                          <FileIcon />
                                                        </div>
                                                        <div>
                                                          <p className="text-xs font-semibold text-gray-700">
                                                            {material.file_name}
                                                          </p>
                                                          <p className="text-[10px] text-gray-400">
                                                            {material.file_type}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {!isTeacher && (
                                        <div className="flex justify-end pt-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              onClose();
                                              setIsEditing(false);
                                              setEditLessonId(item?.lesson_id);
                                              setAddSubLessonModalStatus(true);
                                            }}
                                            className="px-3 py-1.5 bg-white text-secondary border border-secondary/40 rounded-lg font-medium text-xs hover:bg-secondary hover:text-white transition flex items-center justify-center"
                                          >
                                            + Add Sub-Topic
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
                  )}
                </div>
              );
            })
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
        week={lessonWeek}
        setWeek={setLessonWeek}
        totalWeeks={totalWeeks}
      />
    </div>
  );
};

export default InstructorLesson;
