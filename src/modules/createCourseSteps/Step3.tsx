import useInstructor from "@/hooks/useInstructor";
import { Form, Input, Select } from "antd";
import QuillEditor from "@/components/QuillEditor";

export const Step3 = () => {
  const { data: instructor, loading: instructorLoading } = useInstructor();


  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl p-6 bg-white flex flex-col gap-4">
        <div className="font-semibold text-xl">About this class</div>
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
          <QuillEditor placeholder="Enter text here..." />
        </Form.Item>
      </div>
      <div className="rounded-xl p-6 bg-white flex flex-col gap-4">
        <div className="font-semibold text-xl">Meet your teacher</div>
        <div className="flex flex-col gap-2">
          <p>Teacher</p>
          <Form.Item
            rules={[{ required: true, message: "Teacher is required" }]}
            className="!mb-0"
            name="instructor_id"
          >
            <Select
              placeholder="--Select Option--"
              className="w-full !h-[48px] text-start !rounded-lg"
              loading={instructorLoading}
              options={instructor}
            />
          </Form.Item>
        </div>
        <div className="flex flex-col gap-2">
          <p>Description</p>
          <Form.Item
            rules={[{ required: true, message: "Description is required" }]}
            className="!mb-0"
            name="description"
          >
            <QuillEditor placeholder="Enter text here..." />
          </Form.Item>
        </div>
      </div>
    </div>
  );
};
