"use client";
import TabSwitcher from "@/components/TabSwitcher";
import Course from "@/modules/userCourseTab/Course";
import Evaluation from "@/modules/userCourseTab/Evaluation";
import { UserInternalTab } from "@/utils/constant";
import { RoutePaths, UserCourseInternalTab } from "@/utils/enums";
import { Breadcrumb } from "antd";
import React, { useEffect, useState } from "react";
import CourseAssignments from "@/modules/userCourseTab/CourseAssignments";
import CourseQuizzes from "@/modules/userCourseTab/CourseQuizzes";
import CourseLiveClasses from "@/modules/userCourseTab/CourseLiveClasses";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setInternalTab } from "@/redux/tabslice/UserCourseInternalSlice";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import { userCourseList, getCourseInfoApi } from "@/services/collections";
import { useSearchParams } from "next/navigation";

interface CourseDetailItem {
  course_id: string;
  batch_id?: string;
  course_name?: string;
}

const CourseDetails = () => {
  const searchParams = useSearchParams();
  const urlCourseId = searchParams.get("course_id") || "";
  const urlBatchId = searchParams.get("batch_id") || "";

  const activeKey = useSelector(
    (state: RootState) => state.internaltab.activeInternalTab
  );
  const [activeTab, setActiveTab] = useState(activeKey);
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [batchIds, setBatchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState<string>("Course Details");
  
  const [activeCourseId, setActiveCourseId] = useState<string>(urlCourseId);
  const [activeBatchId, setActiveBatchId] = useState<string>(urlBatchId);

  const dispatch = useDispatch();

  const breadcrumbItems = [
    { title: "My Courses", href: RoutePaths?.MyCourses },
    { title: courseName },
  ];


  // Fetch Student's Enrolled Courses & Details
  const initStudentData = async () => {
    setLoading(true);
    try {
      const res = await userCourseList(new URLSearchParams());
      const enrolledCourses: CourseDetailItem[] =
        res?.status && Array.isArray(res?.data?.courses)
          ? res.data.courses
          : [];

      if (enrolledCourses.length > 0) {
        const cIds = enrolledCourses.map((c) => c.course_id);
        const bIds = enrolledCourses
          .map((c) => c.batch_id)
          .filter((b): b is string => !!b);
        setCourseIds(cIds);
        setBatchIds(bIds);

        // Find the active course either from URL or pick first enrolled course
        const matched = urlCourseId
          ? enrolledCourses.find((c) => c.course_id === urlCourseId)
          : enrolledCourses[0];

        if (matched) {
          setActiveCourseId(matched.course_id);
          setCourseName(matched.course_name || "Course Details");
          const resolvedBatch = urlBatchId || matched.batch_id || "";
          if (resolvedBatch) {
            setActiveBatchId(resolvedBatch);
          }
        } else if (urlCourseId) {
          setActiveCourseId(urlCourseId);
          if (urlBatchId) setActiveBatchId(urlBatchId);
          try {
            const info = await getCourseInfoApi(urlCourseId);
            if (info?.status && info?.data?.course?.course_name) {
              setCourseName(info.data.course.course_name);
            }
          } catch {
            // ignore
          }
        }
      } else if (urlCourseId) {
        setActiveCourseId(urlCourseId);
        if (urlBatchId) setActiveBatchId(urlBatchId);
        try {
          const info = await getCourseInfoApi(urlCourseId);
          if (info?.status && info?.data?.course?.course_name) {
            setCourseName(info.data.course.course_name);
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("Error fetching student active courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initStudentData();
  }, [urlCourseId, urlBatchId]);

  useEffect(() => {
    dispatch(setInternalTab(activeTab));
  }, [activeTab, dispatch]);

  return (
    <div className="flex flex-col gap-[24px] w-full">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={breadcrumbItems}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="w-full flex flex-col gap-[24px]">
        <TabSwitcher
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={UserInternalTab}
        />

        {activeTab === UserCourseInternalTab?.COURSES && (
          <Course courseId={activeCourseId} batchId={activeBatchId} />
        )}
        {activeTab === UserCourseInternalTab?.ASSIGNMENTS && (
          <CourseAssignments courseId={activeCourseId} batchId={activeBatchId} />
        )}
        {activeTab === UserCourseInternalTab?.EVALUATIONS && (
          <Evaluation courseId={activeCourseId} batchId={activeBatchId} />
        )}
        {activeTab === UserCourseInternalTab?.LIVE_CLASSES && (
          <CourseLiveClasses courseId={activeCourseId} batchId={activeBatchId} />
        )}
        {activeTab === UserCourseInternalTab?.QUIZZES && (
          <CourseQuizzes courseId={activeCourseId} batchId={activeBatchId} />
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
