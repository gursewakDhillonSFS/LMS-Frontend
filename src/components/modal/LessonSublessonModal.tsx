import { CloseIcon } from "@/utils/icons";
import { Checkbox, Input, Modal, Upload, UploadFile, UploadProps } from "antd";
import React from "react";
import CommonButton from "../CommonButton";
import { FileIcon } from "@/utils/icons";
import QuillEditor from "@/components/QuillEditor";

export interface LessonSublessonModalProps {
  addLessonModalStatus: boolean;
  addSubLessonModalStatus: boolean;
  lessonName: string;
  description: string;
  fileList: UploadFile[];
  uploadProps: UploadProps;
  unlockAfterPrevious: boolean;
  loading: boolean;
  isEditing: boolean;
  onClose: () => void;
  setLessonName: (val: string) => void;
  setDescription: (val: string) => void;
  setUnlockAfterPrevious: (val: boolean) => void;
  removeFile: (index: number) => void;
  handleSave: () => void;
  handleSubLessonSave: () => void;
}

const LessonSublessonModal: React.FC<LessonSublessonModalProps> = ({
  addLessonModalStatus,
  addSubLessonModalStatus,
  lessonName,
  description,
  fileList,
  uploadProps,
  unlockAfterPrevious,
  loading,
  isEditing,
  onClose,
  setLessonName,
  setDescription,
  setUnlockAfterPrevious,
  removeFile,
  handleSave,
  handleSubLessonSave,
}) => {
  return (
    <Modal
      open={addLessonModalStatus || addSubLessonModalStatus}
      footer={null}
      onCancel={onClose}
      closable={false}
      width={900}
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon color="black" />
      </button>
      <div className="text-xl font-semibold flex justify-center">
        {addLessonModalStatus ? "Add Lesson" : "Add Sub Topic"}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-col items-start gap-1">
          <label className="plus-jakarta-sans text-[16px]">
            {addLessonModalStatus ? "Lesson Name" : "Sub Topic Name"}
          </label>
          <Input
            placeholder={
              addLessonModalStatus
                ? "Enter lesson name"
                : "Enter sub topic name"
            }
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            className="!h-12"
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="plus-jakarta-sans text-[16px]">Description</label>
          <div className="w-full">
            <QuillEditor
              placeholder="Enter text here..."
              value={description}
              onChange={(val) => setDescription(val)}
            />
          </div>
          {(() => {
            const text = description?.replace(/<[^>]+>/g, '')?.replace(/&nbsp;/g, ' ').trim();
            const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
            return (
              <div className="flex justify-end w-full mt-1">
                <span className={`text-sm ${words > 300 ? 'text-red-500' : 'text-gray-500'}`}>
                  {words} / 300 words
                </span>
              </div>
            );
          })()}
        </div>

        <div className="grid gap-2">
          <label className="plus-jakarta-sans text-[16px]">
            Study Material
          </label>
          <Upload.Dragger
            {...uploadProps}
            showUploadList={false}
            style={{
              padding: 8,
              backgroundColor: "transparent",
              width: "100%",
            }}
          >
            <div className="flex flex-col items-center justify-center w-full gap-1">
              <p className="ant-upload-text !font-bold !text-secondary">
                Click to Upload Study Material
              </p>
              <p className="ant-upload-hint !font-bold">
                Max. File size: 25 MB
              </p>
            </div>
          </Upload.Dragger>
          <div className="grid grid-cols-3 gap-3">
            {fileList.map((file, index) => (
              <div
                key={index}
                className="border border-[#ccc] rounded-[8px] p-3 flex items-center justify-between flex-grow"
              >
                <FileIcon color="var(--secondary)" />
                <div className="ml-4 flex-1">
                  <div className="text-sm">
                    {file.name.length > 15
                      ? file.name.slice(0, 12) + "..."
                      : file.name}
                  </div>
                  <div className="text-[#9A9A9A] font-xs">
                    PDF • {(file?.size || 0 / 1024).toFixed(0)} KB
                  </div>
                </div>
                <div
                  className="bg-[#FB4A49] rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                  onClick={() => removeFile(index)}
                >
                  <CloseIcon />
                </div>
              </div>
            ))}
          </div>
        </div>

        {addLessonModalStatus && (
          <Checkbox
            prefixCls="custom-checkbox"
            checked={unlockAfterPrevious}
            onChange={(e) => setUnlockAfterPrevious(e.target.checked)}
            className="plus-jakarta-sans !text-[16px]"
          >
            Unlock this course after completing the previous one.
          </Checkbox>
        )}

        <div className="flex items-center justify-end">
          <CommonButton
            type="button"
            loading={loading}
            className="!bg-secondary text-white w-[20%]"
            onClick={addLessonModalStatus ? handleSave : handleSubLessonSave}
            text={isEditing ? "Update" : addLessonModalStatus ? "Save" : "Add"}
            disable={(() => {
              const text = description?.replace(/<[^>]+>/g, '')?.replace(/&nbsp;/g, ' ').trim();
              const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
              return words > 300;
            })()}
          />
        </div>
      </div>
    </Modal>
  );
};

export default LessonSublessonModal;
