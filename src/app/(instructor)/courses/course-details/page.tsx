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
import InstructorCourseTranslations from "@/modules/instructorcourses/InstructorCourseTranslations";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import { CourseInfoDataProp } from "@/utils/interface";
import { getCourseInfoApi, updateCourseStatus } from "@/services/collections";
import { toast } from "@/utils/toast";
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
    <div className="flex flex-col gap-6 pb-12">
      <Breadcrumb
        separator={<span className="text-slate-400 font-bold">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />
      <div className="w-full flex gap-4">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <TabSwitcher
              activeKey={activeTab}
              onChange={setActiveTab}
              tabs={InstructorCoursesDetailsTabs}
            />
            <div className="flex gap-2.5 items-center pr-1">
              <BadgeComponent
                className="capitalize"
                status={coursesInfo?.course_status + ""}
              />
              <CommonButton
                onClick={courseStatusUpdate}
                loading={loading}
                disable={loading}
                text={
                  coursesInfo?.course_status === StatusEnum?.DRAFT ||
                  coursesInfo?.course_status === StatusEnum?.UNPUBLISH
                    ? "Publish Course"
                    : "Unpublish Course"
                }
                className={`text-white font-semibold !h-9 !px-4 ${
                  coursesInfo?.course_status === StatusEnum?.DRAFT ||
                  coursesInfo?.course_status === StatusEnum?.UNPUBLISH
                    ? "!bg-secondary hover:opacity-95"
                    : "!bg-rose-600 hover:bg-rose-700"
                }`}
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
          {activeTab === InstructorCourseDetailsTab?.TRANSLATIONS && (
            <InstructorCourseTranslations
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
