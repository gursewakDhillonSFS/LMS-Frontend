"use client";
import CommonButton from "@/components/CommonButton";
import {
  ClockWheelIcon,
  DownloadIcon,
  FileIcon,
  LockIcon,
  VideoIcon,
} from "@/utils/icons";
import { CloseCircleFilled, RightOutlined, StarOutlined } from "@ant-design/icons";
import { Collapse, Modal, Rate, Input } from "antd";
import React, { useState } from "react";
import QuillEditor from "@/components/QuillEditor";

export const lessons = [
  {
    name: "Getting Started",
    description:
      "Pellentesque nibh porta facilisis nunc. Amet vulputate ornare varius ultricies tellus duis fringilla interdum. Dolor cursus suspendisse eget parturient blandit volutpat nulla duis elit. Ut varius malesuada velit lacus fringilla posuere aliquam.",
    studyMaterials: [
      {
        name: "Welcome to the Free Design Curriculum",
        size: "5+ Minutes",
        type: "file",
        status: "completed",
        url: "https://www.example.com/video1.mp4",
      },
      {
        name: "Welcome to the Free Design Curriculum",
        size: "15+ Minutes",
        type: "video",
        status: "incomplete",
        url: "https://www.example.com/video2.mp4",
      },
      {
        name: "Welcome to the Free Design Curriculum",
        size: "15+ Minutes",
        type: "video",
        status: "incomplete",
        url: "https://www.example.com/video2.mp4",
      },
      {
        name: "Welcome to the Free Design Curriculum",
        size: "15+ Minutes",
        type: "video",
        status: "incomplete",
        url: "https://www.example.com/video2.mp4",
      },
    ],
    subTopics: [
      {
        name: "Beginning",
        description: "",
        studyMaterials: [
          {
            name: "Welcome to the Free Design Curriculum",
            size: "30+ Minutes",
            type: "video",
            status: "incomplete",
            url: "https://www.example.com/video3.mp4",
          },
          {
            name: "Welcome to the Free Design Curriculum",
            size: "30+ Minutes",
            type: "video",
            status: "complete",
            url: "https://www.example.com/video3.mp4",
          },
          {
            name: "Welcome to the Free Design Curriculum",
            size: "30+ Minutes",
            type: "video",
            status: "incomplete",
            url: "https://www.example.com/video3.mp4",
          },
          {
            name: "Welcome to the Free Design Curriculum",
            size: "50+ Minutes",
            type: "file",
            status: "complete",
            url: "https://www.example.com/video4.mp4",
          },
        ],
      },
    ],
  },
  {
    name: "Next Step",
    description: "",
    studyMaterials: [],
    subTopics: [],
    locked: true,
  },
  {
    name: "In the depth",
    description: "",
    studyMaterials: [],
    subTopics: [],
    locked: true,
  },
  {
    name: "Quizzes",
    description: "",
    studyMaterials: [],
    subTopics: [],
    locked: true,
  },
];

const Course = () => {
  const [activeKey, setActiveKey] = useState<string[] | string>(["0"]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  const submitReview = () => {
    // Ideally this connects to an API endpoint
    setIsReviewModalVisible(false);
    setRating(0);
    setReviewText("");
  };

  const hardcodedOverview = `
    <p>Pellentesque nibh porta facilisis nunc. Amet vulputate ornare varius ultricies tellus duis fringilla interdum. Dolor cursus suspendisse eget parturient blandit volutpat nulla duis elit. Ut varius malesuada velit lacus fringilla posuere aliquam. Sed eu nunc urna sagittis lacinia. Eget ac amet purus ultrices faucibus tellus commodo. Nec aliquam et sed elit tortor et commodo non facilisi. Et risus sit quisque vel porttitor eu augue nibh sagittis. Condimentum egestas leo viverra iaculis arcu amet</p>
  `;

  return (
    <div className="w-full flex flex-col gap-[12px]">
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center justify-between w-full">
          <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Overview</h1>
          <CommonButton
            text="Write a Review"
            icon={<StarOutlined />}
            onClick={() => setIsReviewModalVisible(true)}
            className="!bg-secondary text-white w-[160px]"
          />
        </div>
        <div className="text-[16px] text-[#002333]">
          <QuillEditor readOnly value={hardcodedOverview} />
        </div>
      </div>

      <div className="flex flex-col gap-[12px]">
        <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Lesson</h1>
        <div className="flex flex-col gap-[12px]">
          {lessons?.map((item, index) => {
            const isActive = Array.isArray(activeKey)
              ? activeKey.includes(index.toString())
              : activeKey === index.toString();

            return (
              <div key={index} className="flex items-center gap-3 ">
                <Collapse
                  key={index}
                  accordion={true}
                  onChange={!item.locked ? handleChange : undefined}
                  expandIconPosition="end"
                  prefixCls="custom-course-collapse"
                  activeKey={activeKey}
                  expandIcon={({ isActive }) =>
                    !item.locked ? (
                      <RightOutlined
                        style={{
                          color: isActive ? "white" : "black",
                          transform: isActive
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "0.2s",
                        }}
                      />
                    ) : (
                      <LockIcon />
                    )
                  }
                  className={`${
                    isActive ? "!bg-secondary w-full" : "!bg-white w-full"
                  }`}
                  items={[
                    {
                      key: index.toString(),
                      label: (
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-[16px] font-[700] ${
                              isActive && "text-white"
                            }`}
                          >
                            {item.name}
                          </p>
                        </div>
                      ),
                      children: (
                        <div className="flex flex-col gap-4 px-3 py-6 w-full">
                          <div className="text-[#002333] text-[16px] leading-[150%]">
                            <QuillEditor readOnly value={item?.description || ""} />
                          </div>

                          <div className="flex flex-col gap-3">
                            {item?.studyMaterials?.map((material, i) => (
                              <div
                                key={i}
                                className={`flex items-center justify-between ${
                                  i < item?.studyMaterials.length - 1
                                    ? "border-b border-[#C8C8C8]"
                                    : ""
                                }  p-3`}
                              >
                                <div className="flex gap-3">
                                  <div className="bg-primary rounded-full h-11 w-11 flex items-center justify-center text-white font-bold">
                                    {material?.type === "file" ? (
                                      <FileIcon />
                                    ) : (
                                      <VideoIcon />
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <p className="text-[18px] font-[600] leading-[120%]">
                                      {material.name}
                                    </p>
                                    <p className="text-sm text-[#7B7B7B] leading-[120%] flex gap-1 items-center">
                                      <ClockWheelIcon />
                                      {material.size}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  {material.status === "completed" ? (
                                    <CommonButton
                                      text={"Completed"}
                                      icon={<CloseCircleFilled />}
                                      className="!bg-[#D8D8D8] w-[150px]"
                                    />
                                  ) : (
                                    <CommonButton
                                      text={"Mark Complete"}
                                      className="border border-secondary text-secondary !bg-transparent w-[150px]"
                                    />
                                  )}
                                  <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <DownloadIcon />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Sub Topics */}
                          <div className="flex flex-col gap-4">
                            {item?.subTopics?.map((sub, si) => (
                              <div
                                key={si}
                                className="w-full bg-[#F7F7F7] rounded-xl p-3 flex flex-col gap-2"
                              >
                                <div className="font-bold text-[18px]">
                                  {sub.name}
                                </div>
                                <div>
                                  <QuillEditor readOnly value={sub.description || ""} />
                                </div>
                                <div className="flex flex-col gap-2">
                                  {sub.studyMaterials?.map((material, i) => (
                                    <div
                                      key={i}
                                      className={`flex items-center justify-between ${
                                        i < sub.studyMaterials.length - 1
                                          ? "border-b border-[#C8C8C8]"
                                          : ""
                                      } p-3`}
                                    >
                                      <div className="flex gap-3">
                                        <div className="bg-primary rounded-full h-11 w-11 flex items-center justify-center text-white font-bold">
                                          {material?.type === "file" ? (
                                            <FileIcon />
                                          ) : (
                                            <VideoIcon />
                                          )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <p className="text-[18px] font-[600] leading-[120%]">
                                            {material.name}
                                          </p>
                                          <p className="text-sm text-[#7B7B7B] leading-[120%] flex gap-1 items-center">
                                            <ClockWheelIcon />
                                            {material.size}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between gap-2">
                                        {material.status === "completed" ? (
                                          <CommonButton
                                            text={"Completed"}
                                            icon={<CloseCircleFilled />}
                                            className="!bg-[#D8D8D8] w-[150px]"
                                          />
                                        ) : (
                                          <CommonButton
                                            text={"Mark Complete"}
                                            className="border border-secondary text-secondary !bg-transparent w-[150px]"
                                          />
                                        )}
                                        <div>
                                          <DownloadIcon />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        title="Write a Review"
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={[
          <CommonButton
            key="cancel"
            text="Cancel"
            onClick={() => setIsReviewModalVisible(false)}
            className="border mr-2"
          />,
          <CommonButton
            key="submit"
            text="Submit Review"
            onClick={submitReview}
            className="!bg-secondary text-white"
            disable={rating === 0 || !reviewText.trim()}
          />,
        ]}
      >
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Rating</label>
            <Rate value={rating} onChange={setRating} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Review</label>
            <Input.TextArea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this course..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Course;
