import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAllSlices } from "../resetSlice";
import { InstructorCourseDetailsTab } from "@/utils/enums";

interface InstructorCourseState {
  InstructorActiveTab: string;
}

const initialState: InstructorCourseState = {
  InstructorActiveTab: InstructorCourseDetailsTab?.COURSE_INFO,
};

const InstructorCourseTabSlice = createSlice({
  name: "instructorCoursetab",
  initialState,
  reducers: {
    setInstructorCourseTab: (state, action: PayloadAction<string>) => {
      state.InstructorActiveTab = action.payload;
    },
    resetInstructorCourseTab: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setInstructorCourseTab, resetInstructorCourseTab } =
  InstructorCourseTabSlice.actions;
export default InstructorCourseTabSlice.reducer;
