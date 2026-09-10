import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { resetAllSlices } from "../resetSlice";

interface UserState {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  profile_img?: string | null;
  password?: string;
  role_name: string;
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  career: string;
  topics: string[];
  education_level: string;
  organization_id: string;
  instructor_id: string;
  teacherId?: string;
  teacher_id?: string;
  subscription_status: string;
  subscription_id: string;
}

const initialState: UserState | null = null;

const userDataSlice = createSlice({
  name: "userdata",
  initialState: initialState as UserState | null,
  reducers: {
    setUser: (_state, action: PayloadAction<UserState>) => {
      const {
        access_token,
        role_name,
        career,
        topics,
        education_level,
        organization_id,
        subscription_status,
        instructor_id,
      } = action.payload;
      console.log(subscription_status);
      Cookies.set("token", access_token);
      Cookies.set("role_name", role_name);
      if (career === null) {
        Cookies.set("user_onboarding", "1");
      } else if (topics === null) {
        Cookies.set("user_onboarding", "2");
      } else if (education_level === null) {
        Cookies.set("user_onboarding", "3");
      } else {
        Cookies.set("user_onboarding", "undefined");
      }
      if (organization_id == null) {
        Cookies.set("instructor_onboarding", "1");
      } else if (!instructor_id) {
        Cookies.set("instructor_onboarding", "2");
      } else {
        Cookies.set("instructor_onboarding", "undefined");
      }
      // Cookies.set("subscription_status", subscription_status);
      return action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      if (state) {
        return { ...state, ...action.payload };
      }
      return state;
    },
    clearUser: () => {
      Cookies.remove("token");
      Cookies.remove("role_name");
      Cookies.remove("user_onboarding");
      // Cookies.remove("subscription_status");
      Cookies.remove("instructor_onboarding");
      return null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => {
      Cookies.remove("token");
      Cookies.remove("role_name");
      // Cookies.remove("subscription_status");
      Cookies.remove("user_onboarding");
      Cookies.remove("instructor_onboarding");
      return null;
    });
  },
});

export const { setUser, clearUser, updateUser } = userDataSlice.actions;
export default userDataSlice.reducer;
