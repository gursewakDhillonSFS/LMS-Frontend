import { Card, Skeleton } from "antd";

export default function SkeletonCard() {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm border border-gray-200 rounded-lg">
      <div className="flex justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <Skeleton.Image
              style={{ width: 80, height: 80 }}
              className="rounded-lg"
            />
          </div>

          <div className="flex-1 space-y-1">
            <Skeleton.Input
              style={{ width: "120px", height: "12px" }}
              active
              className="!bg-gray-200"
            />

            <div className="flex items-center gap-2">
              <Skeleton.Avatar size="small" active />
              <Skeleton.Input
                style={{ width: "150px", height: "16px" }}
                active
                className="!bg-gray-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton.Input
                style={{ width: "400px", height: "16px" }}
                active
                className="!bg-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <Skeleton.Button
            style={{ width: "100px", height: "36px" }}
            active
            className="!bg-gray-200 !rounded-lg"
          />
        </div>
      </div>
    </Card>
  );
}
