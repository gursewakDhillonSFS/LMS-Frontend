import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAllSlices } from "../resetSlice";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";

export interface AnnouncementState {
  unreadCount: number;
  recentAnnouncements: AnnouncementPayload[];
}

const initialState: AnnouncementState = {
  unreadCount: 0,
  recentAnnouncements: [],
};

const AnnouncementSlice = createSlice({
  name: "announcement",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload);
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    addRealtimeAnnouncement: (
      state,
      action: PayloadAction<AnnouncementPayload>
    ) => {
      // Prevent duplicates
      const exists = state.recentAnnouncements.some(
        (a) => a._id === action.payload._id
      );
      if (!exists) {
        state.recentAnnouncements.unshift(action.payload);
        if (state.recentAnnouncements.length > 50) {
          state.recentAnnouncements.pop();
        }
      }
    },
    removeRealtimeAnnouncement: (state, action: PayloadAction<string>) => {
      state.recentAnnouncements = state.recentAnnouncements.filter(
        (a) => a._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const {
  setUnreadCount,
  incrementUnreadCount,
  resetUnreadCount,
  addRealtimeAnnouncement,
  removeRealtimeAnnouncement,
} = AnnouncementSlice.actions;

export default AnnouncementSlice.reducer;
