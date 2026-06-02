import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAllSlices } from "../resetSlice";
import { StudentTabEnum } from "@/utils/enums";

interface InstructorStudentState {
  InstructorActiveTab: string;
}

const initialState: InstructorStudentState = {
  InstructorActiveTab: StudentTabEnum?.STUDENT_INFO,
};

const InstructorStudentTabSlice = createSlice({
  name: "instructorStudenttab",
  initialState,
  reducers: {
    setInstructorStudentTab: (state, action: PayloadAction<string>) => {
      state.InstructorActiveTab = action.payload;
    },
    resetInstructorStudentTab: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setInstructorStudentTab, resetInstructorStudentTab } =
  InstructorStudentTabSlice.actions;
export default InstructorStudentTabSlice.reducer;
