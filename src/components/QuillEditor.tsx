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
}

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, placeholder, readOnly = false }) => {
  // Modules configuration
  const modules = readOnly
    ? { toolbar: false }
    : {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean'],
        ],
      };

  return (
    <div className={`quill-wrapper ${readOnly ? 'quill-read-only' : ''}`}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? 'border-0' : ''}
      />
      {readOnly && (
        <style jsx global>{`
          .quill-read-only .ql-container {
            border: none !important;
            font-family: inherit;
            font-size: inherit;
          }
          .quill-read-only .ql-editor {
            padding: 0;
            padding-top: 4px;
            padding-bottom: 4px;
          }
        `}</style>
      )}
    </div>
  );
};

export default QuillEditor;
