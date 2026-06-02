import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAllSlices } from "../resetSlice";

interface CourseState {
  course_id: string | null;
  current_step: number;
  form_data: Record<
    string,
    string | string[] | number | { batchName: string; teacher: string | null }[]
  >;
}

const initialState: CourseState = {
  course_id: null,
  current_step: 0,
  form_data: {},
};

const CreateCourseSlice = createSlice({
  name: "createCourse",
  initialState,
  reducers: {
    setCreateCourseData: (state, action: PayloadAction<string | null>) => {
      state.course_id = action.payload;
    },
    updateCurrentStep: (state, action: PayloadAction<number>) => {
      state.current_step = action.payload;
    },
    setCourseFormData: (
      state,
      action: PayloadAction<
        Record<
          string,
          | string
          | string[]
          | number
          | { batchName: string; teacher: string | null }[]
        >
      >
    ) => {
      state.form_data = {
        ...state.form_data,
        ...action.payload,
      };
    },
    resetCreateCourse: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const {
  setCreateCourseData,
  updateCurrentStep,
  setCourseFormData,
  resetCreateCourse,
} = CreateCourseSlice.actions;
export default CreateCourseSlice.reducer;
