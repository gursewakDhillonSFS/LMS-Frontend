import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { InstructorRecord } from "@/utils/interface";
import { resetAllSlices } from "../resetSlice";

interface TeacherState {
  teacher: InstructorRecord | undefined | null;
}

const initialState: TeacherState = {
  teacher: null,
};

const TeacherDataSlice = createSlice({
  name: "teacherData",
  initialState,
  reducers: {
    setInstructorData: (
      state,
      action: PayloadAction<InstructorRecord | undefined>
    ) => {
      state.teacher = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setInstructorData } = TeacherDataSlice.actions;
export default TeacherDataSlice.reducer;
