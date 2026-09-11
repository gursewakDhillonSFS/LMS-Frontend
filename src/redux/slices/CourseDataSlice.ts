import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { courseData } from "@/utils/interface";
import { resetAllSlices } from "../resetSlice";

interface CourseState {
  course: courseData | undefined | null;
}

const initialState: CourseState = {
  course: null,
};

const CourseDataSlice = createSlice({
  name: "courseData",
  initialState,
  reducers: {
    setCourseData: (state, action: PayloadAction<courseData | undefined>) => {
      state.course = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setCourseData } = CourseDataSlice.actions;
export default CourseDataSlice.reducer;
