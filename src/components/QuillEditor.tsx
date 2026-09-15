import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import react-quill to avoid SSR issues with window/document
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
  minHeight = '140px',
  className = '',
}) => {
  // Modules configuration
  const modules = readOnly
    ? { toolbar: false }
    : {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'blockquote', 'code-block'],
          ['clean'],
        ],
      };

  return (
    <div
      className={`modern-quill-wrapper ${
        readOnly
          ? 'quill-read-only border-0 bg-transparent'
          : 'rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/15 overflow-hidden shadow-2xs'
      } ${className}`}
    >
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? 'border-0' : ''}
      />
      <style jsx global>{`
        .modern-quill-wrapper .ql-toolbar.ql-snow {
          background-color: #f8fafc;
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 8px 12px !important;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 2px;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow .ql-formats {
          margin-right: 12px !important;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow button {
          border-radius: 6px !important;
          width: 28px !important;
          height: 28px !important;
          padding: 4px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease-in-out;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow button:hover {
          background-color: #e2e8f0 !important;
          color: var(--secondary) !important;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow button.ql-active {
          background-color: #e0f2f1 !important;
          color: var(--secondary) !important;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow button.ql-active .ql-stroke {
          stroke: var(--secondary) !important;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow button.ql-active .ql-fill {
          fill: var(--secondary) !important;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow .ql-picker {
          font-size: 13px;
          border-radius: 6px;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow .ql-picker-label {
          border-radius: 6px;
          padding: 2px 8px !important;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .modern-quill-wrapper .ql-toolbar.ql-snow .ql-picker-label:hover {
          background-color: #e2e8f0;
        }
        .modern-quill-wrapper .ql-container.ql-snow {
          border: none !important;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.65;
          color: #1e293b;
        }
        .modern-quill-wrapper .ql-editor {
          min-height: ${readOnly ? 'unset' : minHeight};
          padding: 14px 16px;
          font-size: 14px;
        }
        .modern-quill-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          left: 16px;
          right: 16px;
        }
        .modern-quill-wrapper .ql-editor:focus {
          outline: none;
        }
        .modern-quill-wrapper .ql-snow .ql-stroke {
          stroke: #475569;
          stroke-width: 1.8;
        }
        .modern-quill-wrapper .ql-snow .ql-fill {
          fill: #475569;
        }
        .quill-read-only .ql-container {
          border: none !important;
          font-family: inherit;
          font-size: 14px;
          color: #334155;
        }
        .quill-read-only .ql-editor {
          padding: 0 !important;
          min-height: unset !important;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default QuillEditor;
