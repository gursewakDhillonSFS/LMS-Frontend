import { getInstructorListing } from "@/services/collections";
import { Instructor } from "@/utils/interface";
import { useEffect, useState } from "react";

const useInstructor = () => {
  const [data, setData] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const response = await getInstructorListing();
        const formattedInstructors =
          response?.teachers?.map(
            (inst: { firstName: string; lastName: string; _id: string }) => ({
              label: `${inst.firstName} ${inst.lastName}`,
              value: inst._id,
            })
          ) || [];
        setData(formattedInstructors || []);
      } catch (err) {
        console.error("Failed to fetch instructor list:", err);
        setError("Failed to fetch instructor list");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, []);

  return { data, loading, error };
};

export default useInstructor;
