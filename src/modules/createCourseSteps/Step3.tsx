import React, { useEffect, useMemo } from "react";
import useInstructor from "@/hooks/useInstructor";
import { Form, Select } from "antd";
import QuillEditor from "@/components/QuillEditor";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const Step3 = () => {
  const { data: instructor, loading: instructorLoading } = useInstructor();
  const form = Form.useFormInstance();
  const userData = useSelector((state: RootState) => state?.userdata);

  const instructorOptions = useMemo(() => {
    const list = [...(instructor || [])];
    const userInstId =
      userData?.instructor_id || userData?.teacherId || userData?.teacher_id;
    if (
      userInstId &&
      !list.some((item) => String(item.value) === String(userInstId))
    ) {
      list.unshift({
        label: userData?.full_name || "Current Instructor",
        value: userInstId,
      });
    }
    return list;
  }, [instructor, userData]);

  useEffect(() => {
    const currentVal = form.getFieldValue("instructor_id");
    const defaultInstructorId =
      userData?.instructor_id ||
      userData?.teacherId ||
      userData?.teacher_id ||
      (instructorOptions.length > 0 ? instructorOptions[0]?.value : undefined);

    if (!currentVal && defaultInstructorId) {
      form.setFieldsValue({
        instructor_id: defaultInstructorId,
      });
    }
  }, [userData, instructorOptions, form]);

  return (
    <div className="flex flex-col gap-6">
      {/* About Course Card */}
      <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            About This Class
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Explain what this course covers, target learners, prerequisites, and teaching methodology
          </p>
        </div>

        <Form.Item
          rules={[
            { required: true, message: "About is required" },
            {
              validator: (_, value) => {
                if (value && value.replace(/<[^>]+>/g, '').trim().length > 2000) {
                  return Promise.reject("About content cannot exceed 2000 characters.");
                }
                return Promise.resolve();
              }
            }
          ]}
          name="about_course"
          className="!mb-0"
        >
          <QuillEditor
            minHeight="180px"
            placeholder="Write a comprehensive overview of what makes this course unique..."
          />
        </Form.Item>
      </div>

      {/* Meet Your Teacher Card */}
      <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            Instructor Bio & Introduction
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Highlight the instructor's background, expertise, and guidance for enrolled students
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-800">
            Assigned Course Teacher
          </label>
          <Form.Item
            rules={[{ required: true, message: "Teacher is required" }]}
            className="!mb-0"
            name="instructor_id"
          >
            <Select
              placeholder="-- Select an instructor --"
              className="w-full !min-h-[44px] text-start !rounded-xl"
              loading={instructorLoading}
              options={instructorOptions}
              disabled={true}
            />
          </Form.Item>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-800">
              Instructor Biography & Message
            </label>
            <span className="text-xs text-slate-400">Max 300 words</span>
          </div>

          <Form.Item
            rules={[
              { required: true, message: "Description is required" },
              {
                validator: (_, value) => {
                  if (value) {
                    const text = value.replace(/<[^>]+>/g, '')?.replace(/&nbsp;/g, ' ').trim();
                    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
                    if (words > 300) {
                      return Promise.reject("Description cannot exceed 300 words.");
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
            className="!mb-0"
            name="description"
          >
            <QuillEditor
              minHeight="140px"
              placeholder="Provide a welcoming note from the instructor and a short bio..."
            />
          </Form.Item>
        </div>
      </div>
    </div>
  );
};
