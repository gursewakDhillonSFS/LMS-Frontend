"use client";
import CommonButton from "@/components/CommonButton";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import { getAnnouncementsByInstructorApi } from "@/services/collections";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { Empty } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import PostAnnouncementModal from "@/components/modal/PostAnnouncementModal";
import { createAnnouncementApi, updateAnnouncementApi } from "@/services/collections";
import { toast } from "@/utils/toast";

const TeacherAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const param = new URLSearchParams();
      param.append("page", "1");
      param.append("limit", "100");
      const res = await getAnnouncementsByInstructorApi(param);
      if (res?.status && res?.data?.announcements) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error("Failed to fetch teacher announcements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostAnnouncement = async (
    values: Record<string, unknown>,
    status: "published" | "draft"
  ) => {
    try {
      setLoading(true);
      const res = await createAnnouncementApi(values);
      if (res?.status) {
        toast.success(res.message || "Announcement posted successfully");
        setIsModalVisible(false);
        fetchAnnouncements();
      } else {
        toast.error(res?.message || "Failed to post announcement");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchAnnouncements();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-500">Manage and create announcements for your students.</p>
        </div>
        <CommonButton
          text="Create Announcement"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-full pt-10">
            <LoadingOutlined spin className="text-4xl text-primary" />
          </div>
        ) : announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((ann) => (
              <div key={ann._id} className="border border-gray-200 p-5 rounded-xl flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="bg-[#EBF1FF] text-[#255BFF] px-3 py-1 rounded-full text-xs font-semibold">
                    {ann.courseName}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {dayjs(ann.publishedAt).format("DD MMM, YYYY")}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{ann.title}</h3>
                  <p className="text-sm text-gray-500 font-medium bg-gray-100 w-fit px-2 py-1 rounded-md">
                    Batch: {ann.batchName}
                  </p>
                </div>
                <div 
                  className="text-gray-600 text-sm mt-2 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: ann.message }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-10">
            <Empty description="No announcements created yet. Create one to notify your students!" />
          </div>
        )}
      </div>

      {isModalVisible && (
        <PostAnnouncementModal
          postAnnouncement={isModalVisible}
          setPostAnnouncement={setIsModalVisible}
          handlePostAnnouncement={handlePostAnnouncement}
          loading={loading}
        />
      )}
    </div>
  );
};

export default TeacherAnnouncements;
