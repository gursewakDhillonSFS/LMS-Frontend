import { getAllCategoriesApi } from "@/services/collections";
import { Category } from "@/utils/interface";
import { useEffect, useState } from "react";

const useCategories = () => {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getAllCategoriesApi();
        const formattedCategories =
          response?.data?.map((cat: Category) => ({
            label: cat.category_name,
            value: cat.category_id,
            ...cat
          })) || [];
        setData(formattedCategories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, loading, error };
};

export default useCategories;
