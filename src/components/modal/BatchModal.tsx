"use client";
import CommonButton from "@/components/CommonButton";
import { CloseIcon } from "@/utils/icons";
import { Modal } from "antd";
import React from "react";
import Image from "next/image";
import { Card1 } from "@/utils/images";
import { BatchModalProps } from "@/utils/interface";

const BatchModal: React.FC<BatchModalProps> = ({
  open,
  onClose,
  centered = false,
  title,
  batchList,
  courseData,
  handleRedirect,
  selectedBatch = null,
  setSelectedBatch,
}) => {
  return (
    <Modal
      open={open}
      onCancel={() => {
        onClose();
        setSelectedBatch(null);
      }}
      footer={null}
      width={400}
      centered={centered}
      closable={false}
      prefixCls="common-modal"
      className={`relative ${!centered && "!top-10"}`}
    >
      <button
        onClick={() => {
          onClose();
          setSelectedBatch(null);
        }}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-black rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon />
      </button>

      <div className="flex flex-col gap-[32px]">
        <h2 className="text-2xl font-bold text-center">{title}</h2>

        <div className="flex items-center gap-2 border border-[#D8D8D8] p-2 h-[56px] rounded-[6px]">
          <Image
            src={courseData?.image || Card1}
            alt="Course"
            width={40}
            height={40}
            className="rounded-[6px] !min-w-[40px] !min-h-[40px]"
          />
          <p className="w-[80%] font-medium text-sm single-line-ellipsis">
            {courseData?.name}
          </p>
        </div>

        <div className="space-y-4">
          {batchList.map((batch) => (
            <div
              key={batch.id}
              onClick={() => setSelectedBatch(batch.id)}
              className={`flex items-start justify-between p-2 rounded-md border-b border-[#D8D8D8] cursor-pointer transition-all`}
            >
              <div className="flex flex-col">
                <p className="font-semibold text-sm">{`${batch.name}(Batch Name)`}</p>
                <p className="text-xs text-[#7B7B7B]">
                  No. of Assignment: {batch.assignments}
                </p>
                <p className="text-xs text-[#7B7B7B]">
                  Last Quizzes: {batch.lastQuizDate}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                  selectedBatch === batch.id
                    ? "border-primary"
                    : "border-gray-400"
                }`}
              >
                {selectedBatch === batch.id && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end items-center">
          <CommonButton
            text="Select"
            disable={selectedBatch === null}
            className="!bg-secondary text-white w-[40%]"
            onClick={handleRedirect}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BatchModal;
