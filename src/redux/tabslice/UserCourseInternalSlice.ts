import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAllSlices } from "../resetSlice";
import { UserCourseInternalTab } from "@/utils/enums";

interface CourseState {
  activeInternalTab: string;
}

const initialState: CourseState = {
  activeInternalTab: UserCourseInternalTab?.COURSES,
};

const UserCourseInternalSlice = createSlice({
  name: "interaltab",
  initialState,
  reducers: {
    setInternalTab: (state, action: PayloadAction<string>) => {
      state.activeInternalTab = action.payload;
    },
    resetInternalTab: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setInternalTab, resetInternalTab } =
  UserCourseInternalSlice.actions;
export default UserCourseInternalSlice.reducer;
