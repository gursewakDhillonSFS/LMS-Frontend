"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import { EditTeacherDetailModal } from "@/components/modal/EditTeacherDetailModal";
import useCategories from "@/hooks/useCategories";
import { RootState } from "@/redux/store";
import { getInstructor } from "@/services/collections";
import { getCategoryName, getImageUrl, isValidUrl } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { EditIcon, UserProfileIcon1 } from "@/utils/icons";
import { InstructorRecord } from "@/utils/interface";
import { Breadcrumb, Skeleton } from "antd";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "@/utils/toast";

const TeacherDetails = () => {
  const [editInstructorData, setEditInstructorData] =
    useState<InstructorRecord>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const instructor = useSelector(
    (state: RootState) => state?.teacherData?.teacher
  );
  const { data } = useCategories();
  console.log(instructor, setEditInstructorData);
  const items = [
    {
      title: "Teachers",
      href: RoutePaths?.Teachers,
    },
    {
      title: editInstructorData?.name ?? instructor?.name,
    },
  ];

  const personalInfo = {
    left: [
      { label: "Name", value: editInstructorData?.name },
      { label: "Gender", value: editInstructorData?.gender },
      { label: "D.O.B.", value: editInstructorData?.dob },
      { label: "Marital Status", value: editInstructorData?.marital_status },
    ],
    right: [
      { label: "Email", value: editInstructorData?.email, isLink: true },
      { label: "Contact Number", value: editInstructorData?.phone_number },
      { label: "Qualification", value: editInstructorData?.qualification },
    ],
  };

  const getDetails = async () => {
    const param = new URLSearchParams();
    if (instructor?.instructor_id) {
      param.append("instrcutor_id", instructor.instructor_id);
    }
    try {
      setLoading(true);
      const res = await getInstructor(param);
      if (res.status) {
        setEditInstructorData(res?.data);
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
    getDetails();
  }, []);

  return (
    <div className="flex flex-col gap-[24px]">
      <EditTeacherDetailModal
        getDetails={getDetails}
        open={open}
        onCancel={() => setOpen(false)}
        editInstructorData={editInstructorData}
      />
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex items-center gap-3 justify-between w-full">
        <div className="bg-white w-[40%] lg:w-[25%] h-[330px] lg:h-[264px] py-10 rounded-[12px] flex items-center justify-center">
          {!loading ? (
            <div className="relative w-[200px] h-[200px] rounded-full">
              {isValidUrl(getImageUrl(editInstructorData?.image_url)) ? (
                <Image
                  src={getImageUrl(editInstructorData?.image_url)}
                  alt=""
                  fill
                  unoptimized
                  className="rounded-full"
                />
              ) : (
                <UserProfileIcon1 width="200px" height="200px" />
              )}
            </div>
          ) : (
            <Skeleton.Avatar size={200} shape="circle" active />
          )}
        </div>
        <div className="bg-white w-[60%] lg:w-[75%] p-4 rounded-[12px] h-[330px] lg:h-[264px]">
          {!loading ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-semibold text-2xl">Personal Info</h1>
                <button
                  className="cursor-pointer"
                  onClick={() => setOpen(true)}
                >
                  <EditIcon />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-4 items-start min-h-[160px]">
                <div className="flex flex-col gap-4">
                  {personalInfo.left.map((item) => (
                    <div key={item.label} className="grid grid-cols-[1fr_1fr]">
                      <span className="text-[#8A8A8A]">{item.label}</span>
                      <span className="font-semibold">: {item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#E5E7EB] h-full hidden lg:block w-[1px]"></div>

                <div className="flex flex-col gap-4">
                  {personalInfo.right.map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[1fr_1fr] whitespace-nowrap"
                    >
                      <span className="text-[#8A8A8A]">{item.label}</span>
                      <span>
                        :{" "}
                        <span
                          className={`font-semibold text-start ${
                            item.isLink
                              ? "text-secondary underline cursor-pointer"
                              : ""
                          }`}
                        >
                          {item.value}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <Skeleton
              active
              paragraph={{ rows: 6 }}
              className="w-full"
              style={{ width: "100%" }}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {loading ? (
          <>
            <div className="flex flex-col gap-2 items-start">
              <Skeleton.Input active size="small" style={{ width: 100 }} />
              <div className="flex flex-wrap gap-2">
                {Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-[80px] h-8 w-[120px]"
                    >
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-start">
              <Skeleton.Input active size="small" style={{ width: 140 }} />
              <div className="flex flex-wrap gap-2">
                {Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-[80px] h-8 w-[120px]"
                    >
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {editInstructorData?.expert_in &&
              editInstructorData?.expert_in?.length > 0 && (
                <div className="flex flex-col gap-2 items-start">
                  <h2 className="font-semibold text-[16px]">Expert In</h2>
                  <div className="flex flex-wrap gap-2">
                    {editInstructorData?.expert_in?.map((item, index) => (
                      <span
                        key={index}
                        className="bg-white text-[#111] px-3 py-2 rounded-[80px] max-w-56 single-line-ellipsis"
                      >
                        {getCategoryName(data, item) ?? item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {editInstructorData?.current_courses &&
              editInstructorData?.current_courses?.length > 0 && (
                <div className="flex flex-col gap-2 items-start">
                  <h2 className="font-semibold text-[16px]">Current Courses</h2>
                  <div className="flex flex-wrap gap-2">
                    {editInstructorData?.current_courses?.map(
                      (course, index) => (
                        <span
                          key={index}
                          className="bg-white text-[#111] px-3 py-2 rounded-[80px] max-w-56 single-line-ellipsis"
                        >
                          {course}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDetails;
