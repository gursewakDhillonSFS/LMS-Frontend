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
  reorderLessons,
  reorderSublessons,
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
import React, { useCallback, useEffect, useState } from "react";
import QuillEditor from "@/components/QuillEditor";
import { useSelector } from "react-redux";
import { toast } from "@/utils/toast";
import { getWeeksFromDuration } from "./Step1";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  week?: number;
  order?: number;
  sublessons: SubLesson[];
}

interface SortableSublessonItemProps {
  id: string;
  lessonIndex: number;
  subIndex: number;
  subItem: SubLesson;
  onEdit: () => void;
  onDelete: () => void;
  onPreviewFile: (mat: { file_url: string; file_name: string; file_type: string }) => void;
}

const SortableSublessonItem: React.FC<SortableSublessonItemProps> = ({
  id,
  lessonIndex,
  subIndex,
  subItem,
  onEdit,
  onDelete,
  onPreviewFile,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 40 : "auto",
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full bg-white rounded-xl p-3.5 border transition-all flex flex-col gap-2.5 ${
        isDragging
          ? "border-secondary shadow-md ring-2 ring-secondary/20 bg-blue-50/30"
          : "border-slate-200/80 shadow-2xs"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing p-1 shrink-0"
            title="Drag to reorder sub-topic"
          >
            <SixDotIcon />
          </div>
          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
            {lessonIndex + 1}.{subIndex + 1}
          </span>
          <h4 className="font-bold text-xs text-slate-900 truncate">
            {subItem.sublesson_name}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Edit Sub-topic"
            onClick={onEdit}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-50 transition cursor-pointer"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            title="Delete Sub-topic"
            onClick={onDelete}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-2.5 rounded-lg">
        <QuillEditor readOnly value={subItem?.sublesson_description || ""} />
      </div>

      {subItem.studyMaterials && subItem.studyMaterials.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {subItem.studyMaterials.map((mat, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/50 gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 text-secondary flex items-center justify-center shrink-0">
                  {mat.file_type === "video" ? (
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
                onClick={() => onPreviewFile(mat)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:border-secondary hover:text-secondary text-[11px] font-semibold text-slate-700 transition cursor-pointer shrink-0"
              >
                <EyeOutlined className="text-[10px]" />
                <span>Preview</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface SortableLessonItemProps {
  id: string;
  item: LessonDetails;
  index: number;
  activeKey: string | string[];
  sensors: any;
  onChangeActiveKey: (key: string | string[]) => void;
  onEditLesson: (lesson: LessonDetails) => void;
  onDeleteLesson: (lessonId: string) => void;
  onPreviewFile: (mat: { file_url: string; file_name: string; file_type: string }) => void;
  onEditSublesson: (lessonId: string, sublesson: SubLesson) => void;
  onDeleteSublesson: (sublessonId: string) => void;
  onAddSublesson: (lessonId: string) => void;
  onSublessonDragEnd: (lessonId: string, event: DragEndEvent) => void;
}

const SortableLessonItem: React.FC<SortableLessonItemProps> = ({
  id,
  item,
  index,
  activeKey,
  sensors,
  onChangeActiveKey,
  onEditLesson,
  onDeleteLesson,
  onPreviewFile,
  onEditSublesson,
  onDeleteSublesson,
  onAddSublesson,
  onSublessonDragEnd,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 30 : "auto",
    opacity: isDragging ? 0.75 : 1,
  };

  const isActive = Array.isArray(activeKey)
    ? activeKey.includes(index.toString())
    : activeKey === index.toString();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 group w-full ${
        isDragging ? "p-1 rounded-2xl ring-2 ring-secondary/30 bg-blue-50/20" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-slate-400 hover:text-slate-700 pt-3 cursor-grab active:cursor-grabbing shrink-0"
        title="Drag to reorder lesson"
      >
        <SixDotIcon />
      </div>
      <div className="flex-1 min-w-0">
        <Collapse
          accordion={true}
          onChange={onChangeActiveKey}
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
                      <QuillEditor readOnly value={item?.lesson_description || ""} />
                    </div>
                    <button
                      type="button"
                      title="Edit Lesson"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                      onClick={() => onEditLesson(item)}
                    >
                      <EditIcon />
                    </button>
                  </div>

                  {/* Lesson Study Materials */}
                  {item.studyMaterials && item.studyMaterials.length > 0 && (
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
                              onClick={() => onPreviewFile(mat)}
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

                  {/* Sublessons List with Drag and Drop */}
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Sub-Topics ({item.sublessons?.length || 0})
                      </span>
                      {(item.sublessons?.length || 0) > 1 && (
                        <span className="text-[11px] text-slate-400">
                          Drag handle to reorder sub-topics
                        </span>
                      )}
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => onSublessonDragEnd(item.lesson_id, e)}
                    >
                      <SortableContext
                        items={(item.sublessons || []).map((s) => s.sublesson_id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-2">
                          {(item.sublessons || []).map((subItem, subIndex) => (
                            <SortableSublessonItem
                              key={subItem.sublesson_id || subIndex}
                              id={subItem.sublesson_id}
                              lessonIndex={index}
                              subIndex={subIndex}
                              subItem={subItem}
                              onEdit={() => onEditSublesson(item.lesson_id, subItem)}
                              onDelete={() => onDeleteSublesson(subItem.sublesson_id)}
                              onPreviewFile={onPreviewFile}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-dashed border-secondary/40 text-secondary hover:bg-secondary/5 font-semibold text-xs transition cursor-pointer mt-1"
                      onClick={() => onAddSublesson(item.lesson_id)}
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
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer mt-2 shrink-0"
        onClick={() => onDeleteLesson(item.lesson_id)}
      >
        <DeleteIcon />
      </button>
    </div>
  );
};

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
  const courseFormData = useSelector(
    (state: RootState) => state.createCourse.form_data
  );
  const [totalWeeks, setTotalWeeks] = useState<number>(() => {
    const dur = courseFormData?.duration as string;
    return getWeeksFromDuration(dur);
  });
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | "all">("all");
  const [lessonWeek, setLessonWeek] = useState<number>(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "lesson" | "sublesson";
    id: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Document & Media Preview state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleEditLesson = (lesson: LessonDetails) => {
    setAddLessonModalStatus(true);
    setLessonName(lesson.lesson_name);
    setDescription(lesson.lesson_description);
    setFileList(transformToUploadFileList(lesson.studyMaterials));
    setUnlockAfterPrevious(lesson.unlock_after_previous);
    setLessonWeek(lesson.week || 1);
    setIsEditing(true);
    setEditLessonId(lesson.lesson_id);
  };

  const handleOpenAddLesson = (targetWeek: number = 1) => {
    setLessonWeek(targetWeek);
    setLessonName("");
    setDescription("");
    setFileList([]);
    setUnlockAfterPrevious(false);
    setIsEditing(false);
    setEditLessonId(null);
    setAddLessonModalStatus(true);
  };

  const handleDeleteLesson = (lessonId: string) => {
    setDeleteTarget({ type: "lesson", id: lessonId });
    setDeleteModalVisible(true);
  };

  const handleEditSublesson = (lessonId: string, subItem: SubLesson) => {
    setAddSubLessonModalStatus(true);
    setLessonName(subItem.sublesson_name);
    setDescription(subItem.sublesson_description);
    setFileList(transformToUploadFileList(subItem.studyMaterials));
    setIsEditing(true);
    setEditLessonId(lessonId);
    setEditSublessonId(subItem.sublesson_id);
  };

  const handleDeleteSublesson = (sublessonId: string) => {
    setDeleteTarget({ type: "sublesson", id: sublessonId });
    setDeleteModalVisible(true);
  };

  const handleAddSublesson = (lessonId: string) => {
    setAddSubLessonModalStatus(true);
    setAddSubLessonLessonId(lessonId);
    setIsEditing(false);
    setLessonName("");
    setDescription("");
    setFileList([]);
  };

  const handleLessonDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lessonData.findIndex((l) => l.lesson_id === active.id);
    const newIndex = lessonData.findIndex((l) => l.lesson_id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = arrayMove(lessonData, oldIndex, newIndex);
      setLessonData(updated);
      if (course_id) {
        try {
          await reorderLessons(
            course_id,
            updated.map((l, idx) => ({ lesson_id: l.lesson_id, order: idx }))
          );
        } catch (err) {
          console.error("Failed to reorder lessons:", err);
        }
      }
    }
  };

  const handleSublessonDragEnd = async (
    lessonId: string,
    event: DragEndEvent
  ) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const lessonIndex = lessonData.findIndex((l) => l.lesson_id === lessonId);
    if (lessonIndex === -1) return;
    const subs = lessonData[lessonIndex].sublessons || [];
    const oldIndex = subs.findIndex((s) => s.sublesson_id === active.id);
    const newIndex = subs.findIndex((s) => s.sublesson_id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const updatedSubs = arrayMove(subs, oldIndex, newIndex);
      const updatedLessons = [...lessonData];
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        sublessons: updatedSubs,
      };
      setLessonData(updatedLessons);

      try {
        await reorderSublessons(
          lessonId,
          updatedSubs.map((s, idx) => ({
            sublesson_id: s.sublesson_id,
            order: idx,
          }))
        );
      } catch (err) {
        console.error("Failed to reorder sublessons:", err);
      }
    }
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
        setLessonData(res?.data?.lessons || []);
        if (res?.data?.total_weeks) {
          setTotalWeeks(Number(res.data.total_weeks));
        }
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
    return materials.map((mat) => {
      const rawUrl = mat.file_url || "";
      const fullUrl = rawUrl.startsWith("http")
        ? rawUrl
        : `${process.env.NEXT_PUBLIC_BACKEND_API_URL || ""}${
            rawUrl.startsWith("/") ? "" : "/"
          }${rawUrl}`;
      return {
        uid: rawUrl,
        name: mat.file_name,
        status: "done",
        type: mat.file_type === "video" ? "video/mp4" : "application/pdf",
        url: fullUrl,
      };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing && editLessonId) {
        const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
        const existing_files = fileList
          .filter((f) => !f.originFileObj)
          .map((f) => {
            let fileUrl = f.url || "";
            if (backendApiUrl && fileUrl.startsWith(backendApiUrl)) {
              fileUrl = fileUrl.replace(backendApiUrl, "");
            }
            return {
              file_url: fileUrl,
              file_name: f.name,
              file_type: f.type?.includes("video") ? "video" : "pdf",
            };
          });

        const lessonDataPayload = {
          course_id: course_id,
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
          getLessonList();
          onClose();
        }
      } else {
        const lessonDataPayload = {
          course_id: course_id,
          lesson_name: lessonName,
          description,
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
        const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
        const existing_files = fileList
          .filter((f) => !f.originFileObj)
          .map((f) => {
            let fileUrl = f.url || "";
            if (backendApiUrl && fileUrl.startsWith(backendApiUrl)) {
              fileUrl = fileUrl.replace(backendApiUrl, "");
            }
            return {
              file_url: fileUrl,
              file_name: f.name,
              file_type: f.type?.includes("video") ? "video" : "pdf",
            };
          });

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                Course Lessons & Week Structure
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                {totalWeeks} Weeks Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Organize your curriculum week-by-week. Drag and drop to reorder lessons and topics.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {lessonData?.length || 0} Total Lessons
          </span>
        </div>

        {/* Week Selector Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedWeekFilter("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedWeekFilter === "all"
                ? "bg-secondary text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            All Weeks ({lessonData?.length || 0})
          </button>
          {Array.from({ length: Math.max(1, totalWeeks || 1) }, (_, i) => {
            const w = i + 1;
            const count = lessonData?.filter((l) => (l.week || 1) === w).length || 0;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWeekFilter(w)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedWeekFilter === w
                    ? "bg-secondary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                Week {w} ({count})
              </button>
            );
          })}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleLessonDragEnd}
        >
          <SortableContext
            items={lessonData.map((l) => l.lesson_id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-6">
              {Array.from({ length: Math.max(1, totalWeeks || 1) }, (_, wIdx) => {
                const weekNum = wIdx + 1;
                if (selectedWeekFilter !== "all" && selectedWeekFilter !== weekNum) return null;
                const weekLessons = lessonData.filter((l) => (l.week || 1) === weekNum);

                return (
                  <div
                    key={weekNum}
                    className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200/70">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          W{weekNum}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            Week {weekNum} Curriculum
                          </h3>
                          <p className="text-xs text-slate-500">
                            {weekLessons.length} {weekLessons.length === 1 ? "Lesson" : "Lessons"} in Week {weekNum}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleOpenAddLesson(weekNum)}
                        className="!h-9 flex items-center gap-1.5 text-xs font-bold !border-secondary !bg-white hover:!bg-secondary/5 !text-secondary rounded-xl shadow-2xs cursor-pointer"
                      >
                        <PlusOutlined /> Add Lesson to Week {weekNum}
                      </Button>
                    </div>

                    {weekLessons.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {weekLessons.map((item) => {
                          const overallIdx = lessonData.findIndex((l) => l.lesson_id === item.lesson_id);
                          return (
                            <SortableLessonItem
                              key={item.lesson_id}
                              id={item.lesson_id}
                              item={item}
                              index={overallIdx !== -1 ? overallIdx : 0}
                              activeKey={activeKey}
                              sensors={sensors}
                              onChangeActiveKey={handleChange}
                              onEditLesson={handleEditLesson}
                              onDeleteLesson={handleDeleteLesson}
                              onPreviewFile={handlePreviewFile}
                              onEditSublesson={handleEditSublesson}
                              onDeleteSublesson={handleDeleteSublesson}
                              onAddSublesson={handleAddSublesson}
                              onSublessonDragEnd={handleSublessonDragEnd}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-4 bg-white/70">
                        <p className="text-xs font-medium text-slate-500 mb-2">
                          No lessons created for Week {weekNum} yet.
                        </p>
                        <Button
                          onClick={() => handleOpenAddLesson(weekNum)}
                          type="dashed"
                          className="!h-8 text-xs font-semibold !text-secondary !border-secondary/40 hover:!border-secondary cursor-pointer"
                        >
                          + Create First Lesson for Week {weekNum}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          onClick={() => handleOpenAddLesson(1)}
          className="w-full !h-12 flex items-center justify-center text-sm font-bold !border-secondary !bg-secondary/5 hover:!bg-secondary/10 !text-secondary rounded-xl shadow-2xs cursor-pointer"
        >
          + Add a New Lesson
        </Button>
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
        week={lessonWeek}
        totalWeeks={totalWeeks}
        setWeek={setLessonWeek}
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

