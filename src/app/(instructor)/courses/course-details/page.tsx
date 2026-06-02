"use client";
import TabSwitcher from "@/components/TabSwitcher";
import { InstructorCoursesDetailsTabs } from "@/utils/constant";
import {
  InstructorCourseDetailsTab,
  RoutePaths,
  StatusEnum,
} from "@/utils/enums";
import { Breadcrumb } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import CommonButton from "@/components/CommonButton";
import BadgeComponent from "@/components/BadgeComponent";
import InstructorCourseDetails from "@/modules/instructorcourses/InstructorCourseInfo";
import InstructorLesson from "@/modules/instructorcourses/InstructorLesson";
import InstructorStudents from "@/modules/instructorcourses/InstructorStudents";
import InstructorBatch from "@/modules/instructorcourses/InstructorBatch";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import { CourseInfoDataProp } from "@/utils/interface";
import { getCourseInfoApi, updateCourseStatus } from "@/services/collections";
import { toast } from "react-toastify";
import { setInstructorCourseTab } from "@/redux/tabslice/InstructorCourseTabSlice";

const CourseDetails = () => {
  const InstructorActiveTab = useSelector(
    (state: RootState) => state.instructorCourseTab.InstructorActiveTab
  );
  const [activeTab, setActiveTab] = useState<string>(InstructorActiveTab);
  const data = useSelector((state: RootState) => state?.courseData?.course);
  const [coursesInfo, setCoursesInfo] = useState<CourseInfoDataProp>();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const items = [
    {
      title: "Courses",
      href: RoutePaths?.Courses,
    },
    {
      title: coursesInfo?.course_name ?? data?.course_name,
    },
  ];

  const fetchCourseInfo = useCallback(async () => {
    setLoading(true);
    try {
      if (data?.course_id) {
        const response = await getCourseInfoApi(data?.course_id);
        if (response) {
          setCoursesInfo(response?.data);
        }
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [data?.course_id]);

  const courseStatusUpdate = async () => {
    setLoading(true);
    const payload = {
      course_id: coursesInfo?.course_id ?? "",
      course_name: coursesInfo?.course_name ?? "",
      description: coursesInfo?.description ?? "",
      status:
        coursesInfo?.course_status === StatusEnum?.DRAFT ||
        coursesInfo?.course_status === StatusEnum?.UNPUBLISH
          ? "published"
          : "unpublished",
    };
    try {
      const res = await updateCourseStatus(payload);
      if (res?.status) {
        toast.success(res.message);
        fetchCourseInfo();
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseInfo();
  }, [fetchCourseInfo]);
  useEffect(() => {
    if (activeTab) {
      dispatch(setInstructorCourseTab(activeTab));
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />
      <div className="w-full flex gap-[12px]">
        <div className="flex flex-col gap-[24px] w-full">
          <div className="flex justify-between">
            <TabSwitcher
              activeKey={activeTab}
              onChange={setActiveTab}
              tabs={InstructorCoursesDetailsTabs}
            />
            <div className="flex gap-2.5 items-center">
              <CommonButton
                onClick={courseStatusUpdate}
                disable={loading}
                text={
                  coursesInfo?.course_status === StatusEnum?.DRAFT ||
                  coursesInfo?.course_status === StatusEnum?.UNPUBLISH
                    ? "Publish"
                    : "Unpublish"
                }
                className={`text-white ${
                  coursesInfo?.course_status === StatusEnum?.DRAFT ||
                  coursesInfo?.course_status === StatusEnum?.UNPUBLISH
                    ? "!bg-primary"
                    : "!bg-[#D82D2D]"
                }`}
              />
              <BadgeComponent
                className="capitalize"
                status={coursesInfo?.course_status + ""}
              />
            </div>
          </div>

          {activeTab === InstructorCourseDetailsTab?.COURSE_INFO && (
            <InstructorCourseDetails
              coursesInfo={coursesInfo}
              loading={loading}
              fetchCourseInfo={fetchCourseInfo}
            />
          )}
          {activeTab === InstructorCourseDetailsTab?.LESSON && (
            <InstructorLesson />
          )}
          {activeTab === InstructorCourseDetailsTab?.STUDENTS && (
            <InstructorStudents coursesInfo={coursesInfo} />
          )}
          {activeTab === InstructorCourseDetailsTab?.BATCH && (
            <InstructorBatch
              coursesInfo={coursesInfo}
              fetchCourseInfo={fetchCourseInfo}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
