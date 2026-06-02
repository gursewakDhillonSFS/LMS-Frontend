import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '@/utils/interface';
import { resetAllSlices } from '../resetSlice';

interface CategoriesState {
  categories: Category[];
  activeCategory: string | null | undefined;
}

const initialState: CategoriesState = {
  categories: [],
  activeCategory: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setActiveCategory: (state, action: PayloadAction<string | undefined>) => {
      state.activeCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setCategories, setActiveCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
