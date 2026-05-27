"use client";
import { Card, Skeleton } from "antd";
import { StarFilled } from "@ant-design/icons";

export default function CourseCardSkeleton() {
  return (
    <div className="max-w-sm mx-auto">
      <Card
        className="overflow-hidden shadow-lg custom-card"
        cover={
          <div className="relative">
            <Skeleton.Image active className="!w-full !h-48 rounded-t-lg" />
          </div>
        }
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton.Avatar active size="small" />
            <Skeleton.Input active size="small" className="!w-32 !h-4" />
            <div className="ml-auto flex items-center space-x-1">
              <StarFilled className="!text-gray-400 text-sm" />
              <Skeleton.Input active size="small" className="!w-8 !h-4" />
            </div>
          </div>

          <Skeleton.Input active size="small" className="!w-24 !h-4" />

          <Skeleton.Input active className="!w-full !h-6" />

          <div className="flex items-center justify-between gap-3">
            <Skeleton.Button active className="!w-32 !h-8 !rounded-md" />
            <Skeleton.Button active className="!w-32 !h-8 !rounded-md" />
          </div>
        </div>
      </Card>
    </div>
  );
}
