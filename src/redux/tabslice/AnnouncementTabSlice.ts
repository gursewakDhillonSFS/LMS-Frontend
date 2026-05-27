import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAllSlices } from "../resetSlice";
import { InstructorAnnouncementsDetailsTabEnum } from "@/utils/enums";

interface AnnouncementState {
  InstructorActiveTab: string;
}

const initialState: AnnouncementState = {
  InstructorActiveTab: InstructorAnnouncementsDetailsTabEnum?.ANNOUNCEMENT,
};

const AnnouncementTabSlice = createSlice({
  name: "announcementTab",
  initialState,
  reducers: {
    setAnnouncementTab: (state, action: PayloadAction<string>) => {
      state.InstructorActiveTab = action.payload;
    },
    resetAnnouncementTab: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const { setAnnouncementTab, resetAnnouncementTab } =
  AnnouncementTabSlice.actions;
export default AnnouncementTabSlice.reducer;
