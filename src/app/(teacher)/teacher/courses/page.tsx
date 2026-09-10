"use client";
import CommonButton from "@/components/CommonButton";
import { RequestedDemoCard } from "@/modules/instructorcourses/InstructorCoursesCards";
import Pagination from "@/components/Pagination";
import TabSwitcher from "@/components/TabSwitcher";
import { InstructorCoursesTabs } from "@/utils/constant";
import { InstructorCourseTab, RoutePaths } from "@/utils/enums";
import { courseData, RequestedDemoProp } from "@/utils/interface";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllCoursesApi, deleteCourseApi, getCourseInfoApi } from "@/services/collections";
import { useDispatch, useSelector } from "react-redux";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import {
  resetCreateCourse,
  setCreateCourseData,
  setCourseFormData,
  updateCurrentStep,
} from "@/redux/slices/CreateCourseSlice";
import { DataNotFound, Fallback } from "@/utils/images";
import Image from "next/image";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";
import BadgeComponent from "@/components/BadgeComponent";
import { getImageUrl, isValidUrl } from "@/utils/comman";
import { InstructorSkeletonCard } from "@/components/InstructorSkeletonCard";
import NoDataFound from "@/components/NoDataFound";
import { RootState } from "@/redux/store";
import { EditOutlined, DeleteOutlined, DeleteFilled } from "@ant-design/icons";
import { toast } from "@/utils/toast";
import ConfirmationModal from "@/components/modal/ConfirmationModal";

const scheduleData: RequestedDemoProp[] = [
  {
    student: {
      name: "Floyd Miles",
      image: null,
    },
    course: "Digital Marketing Specialist",
    timeSlot: "Monday 25 May 04:30 PM",
  },
  {
    student: {
      name: "Floyd Miles",
      image: null,
    },
    course: "Digital Marketing Specialist",
    timeSlot: "Monday 25 May 04:30 PM",
  },
];

const TeacherCourses = () => {
  const [activeTab, setActiveTab] = useState<string>(
    InstructorCourseTab.COURSES
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState<courseData[]>([]);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );
  const role_name = useSelector(
    (state: RootState) => state.userdata?.role_name
  );
  const isTeacher = role_name === "teacher";

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", limit + "");
      params.append("page", String(page));
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }

      const response = await getAllCoursesApi(params);
      if (response?.status === true) {
        setCourses(response?.data?.course_list);
        setTotal(response?.data?.total_courses);
      }
    } catch (err) {
      console.log(err || "Failed to fetch Courses");
    } finally {
      setLoading(false);
    }
  }, [limit, page, organization_id]);

  const handleRedirect = (value: courseData) => {
    router.push(`${RoutePaths?.TeacherCourses}/course-details`);
    dispatch(setCourseData(value));
  };

  const handleDelete = (id: string) => {
    setSelectedCourseId(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourseId) return;
    setDeleteLoading(true);
    setActionLoading(true);
    try {
      const res = await deleteCourseApi(selectedCourseId);
      if (res?.status) {
        toast.success(res?.message || "Course deleted successfully!");
        setDeleteModalVisible(false);
        fetchCourseData();
      } else {
        toast.error(res?.message || "Failed to delete course.");
      }
    } catch (error) {
      toast.error("Error deleting course.");
    } finally {
      setDeleteLoading(false);
      setActionLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const response = await getCourseInfoApi(id);
      if (response?.status && response?.data) {
        const c = response.data;
        dispatch(resetCreateCourse());
        dispatch(setCreateCourseData(c.course_id));

        dispatch(
          setCourseFormData({
            course_name: c.course_name,
            head_teacher: c.head_teacher_id,
            duration: c.course_duration,
            course_type: c.course_price === 0 ? "free" : "paid",
            course_price: c.course_price,
            demo_class: c.demo_classes ?? false,
            category_id: c.category_id,
            course_schedule: c.course_schedule,
            live_classes: c.live_classes,
            about_course: c.about_course,
            instructor_id: c.instructor_id,
            description: c.description,
            learning_points: c.course_learning_points || [],
            skills_you_gain: c.skills_you_gain || [],
            course_image_url: c.course_image_url,
            batch: c.batch || [],
            overview: c.overview,
          })
        );

        dispatch(updateCurrentStep(0));
        router.push(`${RoutePaths?.TeacherCourses}/create-course`);
      } else {
        toast.error("Failed to load course data for editing.");
      }
    } catch (err) {
      toast.error("Failed to fetch course info.");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === InstructorCourseTab.COURSES) fetchCourseData();
  }, [activeTab, page, fetchCourseData]);

  return (
    <>
      {deleteModalVisible && (
        <ConfirmationModal
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          onSubmit={handleConfirmDelete}
          loading={deleteLoading}
          title="Delete"
          description="Are you sure you want to Delete Course?"
          iconBG="#FB4A49"
          icon={<DeleteFilled className="text-4xl !text-white" />}
        />
      )}
      <div className="w-full h-full flex flex-col gap-[12px]">
        <h1 className="text-[32px] font-[700] text-[#0E0E0E]">My Courses</h1>
        <div className="w-full flex flex-col gap-[12px]">
          <div className="flex justify-between">
            <TabSwitcher
              activeKey={activeTab}
              onChange={setActiveTab}
              tabs={InstructorCoursesTabs}
            />
          </div>

          {activeTab == InstructorCourseTab.COURSES && (
            <>
              {loading || courses?.length > 0 ? (
                loading ? (
                  <div className="flex flex-col gap-3">
                    <InstructorSkeletonCard />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {courses?.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleRedirect(item)}
                        className="cursor-pointer"
                      >
                        <div
                          className={`bg-white grid grid-cols-4 lg:grid-cols-15 gap-2 p-4 rounded-md`}
                        >
                          <div className={`col-span-2 ${isTeacher ? "lg:col-span-6" : "lg:col-span-4"} flex gap-2.5 items-center`}>
                            <div className="relative w-10 h-10">
                              <Image
                                src={
                                  !imgErrors[item?.course_id ?? ""] &&
                                  isValidUrl(
                                    getImageUrl(item?.course_image_url)
                                  )
                                    ? getImageUrl(item?.course_image_url)
                                    : Fallback
                                }
                                alt={"image"}
                                unoptimized
                                fill
                                onError={() => {
                                  if (item?.course_id) {
                                    setImgErrors((prev) => ({
                                      ...prev,
                                      [item.course_id]: true,
                                    }));
                                  }
                                }}
                                className="rounded-md"
                              />
                            </div>
                            <p className="font-medium truncate flex h-8 items-center">
                              {item.course_name}
                            </p>
                          </div>
                          {item?.enrolled_user_count + "" && (
                            <div className="col-span-1 lg:col-span-2">
                              <p className="text-[#7B7B7B] text-xs">Students</p>
                              <div className="text-sm font-medium flex h-8 items-center">
                                {item.enrolled_user_count}
                              </div>
                            </div>
                          )}
                          {item?.head_teacher_name && (
                            <div className="col-span-1 lg:col-span-2">
                              <p className="text-[#7B7B7B] text-xs">
                                Head Teacher
                              </p>
                              <UserAvatarDisplay
                                textClass="font-medium"
                                user={{
                                  name: item?.head_teacher_name,
                                  image: item?.head_teacher_image_url,
                                }}
                              />
                            </div>
                          )}
                          {item?.created_at && (
                            <div className="col-span-2">
                              <p className="text-[#7B7B7B] text-xs">
                                Created Date
                              </p>
                              <div className="text-sm font-medium flex h-8 items-center">
                                {item?.created_at?.split("T")[0]}
                              </div>
                            </div>
                          )}
                          {item?.live_class + "" && (
                            <div className="col-span-1 lg:col-span-2">
                              <p className="text-[#7B7B7B] text-xs">
                                Live Classes
                              </p>
                              <div className="text-sm font-medium flex h-8 items-center">
                                {item.live_class ? "Yes" : "No"}
                              </div>
                            </div>
                          )}
                          {item?.course_status && (
                            <div>
                              <p className="text-[#7B7B7B] text-xs">Status</p>
                              <div className="flex h-8 items-center">
                                <BadgeComponent
                                  status={
                                    item?.course_status === "draft"
                                      ? "unPublish"
                                      : "Publish"
                                  }
                                />
                              </div>
                            </div>
                          )}
                          {!isTeacher && (
                            <div className="col-span-2 lg:col-span-2">
                              <p className="text-[#7B7B7B] text-xs">Actions</p>
                              <div className="flex h-8 items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item?.course_id);
                                  }}
                                  disabled={actionLoading}
                                  className="text-blue-500 hover:text-blue-700 flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit Course"
                                >
                                  <EditOutlined className="text-[16px]" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item?.course_id);
                                  }}
                                  disabled={actionLoading}
                                  className="text-red-500 hover:text-red-700 flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete Course"
                                >
                                  <DeleteOutlined className="text-[16px]" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <NoDataFound icon={DataNotFound} />
              )}
            </>
          )}

          {activeTab == InstructorCourseTab.REQUESTED_DEMO && (
            <div className="flex flex-col gap-3">
              {scheduleData.map((item, index) => (
                <RequestedDemoCard data={item} key={index} />
              ))}
            </div>
          )}

          {total > limit && (
            <Pagination
              limit={limit}
              page={page}
              setPage={setPage}
              total={total}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherCourses;
