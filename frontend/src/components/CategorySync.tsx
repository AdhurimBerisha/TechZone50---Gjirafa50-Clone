import { useEffect } from "react";
import { useCategoryStore } from "@/stores/categoryStore";

/** Loads categories from `/api/categories` once per store session. */
const CategorySync = () => {
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return null;
};

export default CategorySync;
