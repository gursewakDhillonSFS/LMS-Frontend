import { Card, Skeleton } from "antd";

export default function SkeletonCard() {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-none !border !border-[var(--border)] !rounded-[10px] bg-[var(--surface)]">
      <div className="flex justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <Skeleton.Image
              style={{ width: 80, height: 80 }}
              className="!rounded-[8px]"
              active
            />
          </div>

          <div className="flex-1 space-y-2">
            <Skeleton.Input
              style={{ width: "120px", height: "12px" }}
              active
              className="!rounded-[4px]"
            />

            <div className="flex items-center gap-2">
              <Skeleton.Avatar size="small" active />
              <Skeleton.Input
                style={{ width: "150px", height: "14px" }}
                active
                className="!rounded-[4px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton.Input
                style={{ width: "80%", height: "14px" }}
                active
                className="!rounded-[4px]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <Skeleton.Button
            style={{ width: "100px", height: "36px" }}
            active
            className="!rounded-[8px]"
          />
        </div>
      </div>
    </Card>
  );
}
