import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { courseData } from "@/utils/interface";
import { resetAllSlices } from "../resetSlice";

interface CourseState {
  course: courseData | undefined | null;
  cartCount: number;
}

const initialState: CourseState = {
  course: null,
  cartCount: 0,
};

const CourseDataSlice = createSlice({
  name: "courseData",
  initialState,
  reducers: {
    setCourseData: (state, action: PayloadAction<courseData | undefined>) => {
      state.course = action.payload;
    },
    setCartCount: (state, action: PayloadAction<number>) => {
      state.cartCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setCourseData, setCartCount } = CourseDataSlice.actions;
export default CourseDataSlice.reducer;
