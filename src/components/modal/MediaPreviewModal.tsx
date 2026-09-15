"use client";

import React from "react";
import { Modal } from "antd";
import {
  CloseOutlined,
  DownloadOutlined,
  ExportOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
  FileOutlined,
} from "@ant-design/icons";

export interface PreviewFile {
  name: string;
  url: string;
  type?: string;
}

interface MediaPreviewModalProps {
  open: boolean;
  file: PreviewFile | null;
  onClose: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  open,
  file,
  onClose,
}) => {
  if (!file) return null;

  const resolvedUrl = file.url.startsWith("http") || file.url.startsWith("blob:")
    ? file.url
    : `${process.env.NEXT_PUBLIC_BACKEND_API_URL || ""}${file.url}`;

  const isVideo =
    file.type?.toLowerCase().includes("video") ||
    file.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i);

  const isPdf =
    file.type?.toLowerCase().includes("pdf") ||
    file.name.match(/\.pdf$/i);

  const isImage =
    file.type?.toLowerCase().includes("image") ||
    file.name.match(/\.(png|jpe?g|gif|webp|svg)$/i);

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={onClose}
      closable={false}
      width={900}
      centered
      destroyOnClose
      className="modern-preview-modal"
    >
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
              {isVideo ? (
                <VideoCameraOutlined className="text-lg" />
              ) : isPdf ? (
                <FilePdfOutlined className="text-lg text-rose-500" />
              ) : (
                <FileOutlined className="text-lg" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-bold text-slate-800 text-base leading-tight">
                {file.name}
              </h3>
              <p className="text-xs text-slate-400 capitalize mt-0.5">
                {file.type || "Document"} Preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Open in new window"
            >
              <ExportOutlined />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>
            <a
              href={resolvedUrl}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Download file"
            >
              <DownloadOutlined />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close"
            >
              <CloseOutlined className="text-sm" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex items-center justify-center bg-slate-900/5 min-h-[420px]">
          {isVideo ? (
            <video
              src={resolvedUrl}
              controls
              autoPlay
              className="max-h-[72vh] w-full rounded-xl bg-black shadow-lg"
            >
              Your browser does not support the video tag.
            </video>
          ) : isPdf ? (
            <iframe
              src={`${resolvedUrl}#toolbar=1`}
              title={file.name}
              className="h-[72vh] w-full rounded-xl border border-slate-200 bg-white shadow-xs"
            />
          ) : isImage ? (
            <img
              src={resolvedUrl}
              alt={file.name}
              className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-md"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-secondary border border-blue-100">
                <FileOutlined className="text-4xl" />
              </div>
              <div className="max-w-md">
                <h4 className="font-semibold text-slate-800 text-lg">
                  {file.name}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Inline preview is not supported for this file type. You can
                  view or download it using the buttons above.
                </p>
              </div>
              <a
                href={resolvedUrl}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-95"
              >
                <DownloadOutlined />
                Download Attachment
              </a>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MediaPreviewModal;
