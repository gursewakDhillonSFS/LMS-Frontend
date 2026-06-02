export const   InstructorSkeletonCard = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white grid grid-cols-4 lg:grid-cols-13 gap-2 p-4 rounded-md animate-pulse"
        >
          <div className="col-span-2 lg:col-span-4 flex gap-2.5 items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-md" />
            <div className="h-4 w-24 bg-gray-300 rounded-md" />
          </div>

          <div className="col-span-1 lg:col-span-2">
            <div className="h-3 w-20 bg-gray-200 rounded-md mb-2" />
            <div className="h-4 w-12 bg-gray-300 rounded-md" />
          </div>

          <div className="col-span-1 lg:col-span-2">
            <div className="h-3 w-20 bg-gray-200 rounded-md mb-2" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full" />
              <div className="h-4 w-16 bg-gray-300 rounded-md" />
            </div>
          </div>

          <div className="col-span-2">
            <div className="h-3 w-20 bg-gray-200 rounded-md mb-2" />
            <div className="h-4 w-24 bg-gray-300 rounded-md" />
          </div>

          <div className="col-span-1 lg:col-span-2">
            <div className="h-3 w-20 bg-gray-200 rounded-md mb-2" />
            <div className="h-4 w-10 bg-gray-300 rounded-md" />
          </div>

          <div>
            <div className="h-3 w-20 bg-gray-200 rounded-md mb-2" />
            <div className="h-4 w-16 bg-gray-300 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};
