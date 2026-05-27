"use client";
import React, { useRef, useCallback, useState } from "react";
import { Modal, Spin } from "antd";
import { toast } from "react-toastify";
import { markLessonCompleteApi, markSublessonCompleteApi } from "@/services/collections";

interface ContentItem {
  id: string;
  name: string;
  file_url: string | null;
  file_type: string | null; // "video" | "pdf" | null
  isSublesson?: boolean;
  courseId: string;
  batchId: string;
}

interface CourseContentViewerProps {
  open: boolean;
  onClose: () => void;
  item: ContentItem | null;
  onCompleted?: (id: string, isSublesson: boolean) => void;
}

const CourseContentViewer: React.FC<CourseContentViewerProps> = ({
  open,
  onClose,
  item,
  onCompleted,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [completedLocal, setCompletedLocal] = useState(false);
  const [loading, setLoading] = useState(false);

  const markComplete = useCallback(async () => {
    if (!item || completedLocal) return;
    setCompletedLocal(true);
    setLoading(true);
    try {
      if (item.isSublesson) {
        await markSublessonCompleteApi({
          sublesson_id: item.id,
          course_id: item.courseId,
          batch_id: item.batchId,
        });
      } else {
        await markLessonCompleteApi({
          lesson_id: item.id,
          course_id: item.courseId,
          batch_id: item.batchId,
        });
      }
      toast.success(`"${item.name}" marked as completed!`);
      onCompleted?.(item.id, !!item.isSublesson);
    } catch {
      // silently fail — don't annoy the user
    } finally {
      setLoading(false);
    }
  }, [item, completedLocal, onCompleted]);

  const handleVideoEnded = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const handlePdfScroll = useCallback(() => {
    const el = pdfContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (atBottom) {
      markComplete();
    }
  }, [markComplete]);

  // Reset local state when item changes
  const handleAfterOpen = useCallback(() => {
    setCompletedLocal(false);
  }, []);

  if (!item) return null;

  const isVideo = item.file_type === "video";
  const isPdf = item.file_type === "pdf";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterOpenChange={(vis) => { if (vis) handleAfterOpen(); }}
      title={
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0E0E0E] truncate max-w-[80%]">
            {item.name}
          </span>
          {completedLocal && (
            <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
              ✓ Completed
            </span>
          )}
          {loading && <Spin size="small" />}
        </div>
      }
      footer={null}
      width={isVideo ? "70%" : "80%"}
      centered
      destroyOnClose
      className="course-content-viewer-modal"
    >
      {!item.file_url ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No content available for this lesson.
        </div>
      ) : isVideo ? (
        <div className="w-full rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={item.file_url}
            controls
            onEnded={handleVideoEnded}
            className="w-full max-h-[70vh]"
            style={{ outline: "none" }}
            controlsList="nodownload"
          />
          <p className="text-center text-xs text-gray-400 py-2">
            {completedLocal
              ? "✓ Lesson completed!"
              : "Lesson will be marked complete when the video finishes."}
          </p>
        </div>
      ) : isPdf ? (
        <div className="flex flex-col gap-2">
          <div
            ref={pdfContainerRef}
            onScroll={handlePdfScroll}
            className="w-full overflow-y-auto rounded-xl"
            style={{ maxHeight: "75vh" }}
          >
            <iframe
              src={`${item.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full rounded-xl"
              style={{ height: "75vh", border: "none" }}
              title={item.name}
            />
          </div>
          <p className="text-center text-xs text-gray-400">
            {completedLocal
              ? "✓ Lesson completed!"
              : "Scroll to the bottom of the PDF to mark this lesson as complete."}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Unsupported content type.
        </div>
      )}
    </Modal>
  );
};

export default CourseContentViewer;
