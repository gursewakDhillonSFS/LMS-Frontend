"use client";
import { Card, Skeleton } from "antd";

export default function CourseCardSkeleton() {
  return (
    <div className="w-full">
      <Card
        className="overflow-hidden custom-card !border !border-[var(--border)] !rounded-[10px]"
        styles={{ body: { padding: 0 } }}
        cover={
          <div className="relative bg-[var(--surface-subtle)]">
            <Skeleton.Image active className="!w-full !h-[180px]" />
          </div>
        }
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton.Avatar active size="small" shape="circle" />
            <Skeleton.Input active size="small" className="!w-24 !h-3" />
          </div>

          <Skeleton.Input active className="!w-full !h-5" />

          <div className="flex items-center justify-between">
            <Skeleton.Input active size="small" className="!w-20 !h-3" />
            <Skeleton.Input active size="small" className="!w-16 !h-3" />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Skeleton.Button active className="!w-full !h-9 !rounded-[8px]" />
            <Skeleton.Button active className="!w-full !h-9 !rounded-[8px]" />
          </div>
        </div>
      </Card>
    </div>
  );
}
