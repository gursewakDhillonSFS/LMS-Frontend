"use client";
import React, { useRef, useCallback, useState } from "react";
import { Modal, Spin } from "antd";
import { toast } from "react-toastify";
import { markMaterialCompleteApi } from "@/services/collections";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CommonButton from "./CommonButton";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  onCompleted?: (file_url: string) => void;
}

const CourseContentViewer: React.FC<CourseContentViewerProps> = ({
  open,
  onClose,
  item,
  onCompleted,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completedLocal, setCompletedLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  const markComplete = useCallback(async () => {
    if (!item || !item.file_url || completedLocal) return;
    setCompletedLocal(true);
    setLoading(true);
    try {
      await markMaterialCompleteApi({
        material_url: item.file_url,
        course_id: item.courseId,
        batch_id: item.batchId,
      });
      toast.success(`"${item.name}" marked as completed!`);
      onCompleted?.(item.file_url);
    } catch {
      // silently fail — don't annoy the user
    } finally {
      setLoading(false);
    }
  }, [item, completedLocal, onCompleted]);

  const handleVideoEnded = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

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
      destroyOnHidden
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
        <div className="flex flex-col gap-4 items-center">
          <div className="w-full overflow-y-auto rounded-xl flex justify-center bg-gray-100 p-4" style={{ maxHeight: "65vh" }}>
            <Document
              file={item.file_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<Spin size="large" />}
              error={<div className="text-red-500">Failed to load PDF. Please check the URL.</div>}
            >
              <Page pageNumber={pageNumber} width={800} />
            </Document>
          </div>
          
          {numPages && (
            <div className="flex items-center gap-4">
              <CommonButton
                text="Previous"
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                disable={pageNumber <= 1}
                className="bg-gray-200 text-gray-700"
              />
              <p className="text-sm font-medium">
                Page {pageNumber} of {numPages}
              </p>
              <CommonButton
                text="Next"
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                disable={pageNumber >= numPages}
                className="bg-gray-200 text-gray-700"
              />
            </div>
          )}

          {!completedLocal ? (
            pageNumber === numPages && (
              <CommonButton
                text="Mark as Complete"
                onClick={markComplete}
                disable={loading}
                className="mt-2 w-[200px]"
              />
            )
          ) : (
            <p className="text-center text-xs text-green-600 font-bold">
              ✓ Lesson completed!
            </p>
          )}
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
