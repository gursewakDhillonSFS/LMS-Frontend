import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAllSlices } from "../resetSlice";
import { UserCourseTab } from "@/utils/enums";

interface CourseState {
  activeCourseTab: string;
}

const initialState: CourseState = {
  activeCourseTab: UserCourseTab?.Active,
};

const UserCourseTabSlice = createSlice({
  name: "coursetab",
  initialState,
  reducers: {
    setCourseTab: (state, action: PayloadAction<string>) => {
      state.activeCourseTab = action.payload;
    },
    resetCourseTab: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setCourseTab, resetCourseTab } = UserCourseTabSlice.actions;
export default UserCourseTabSlice.reducer;
