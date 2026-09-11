import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { resetAllSlices } from "../resetSlice";
import { Role } from "@/utils/enums";

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
        instructor_id,
      } = action.payload;
      Cookies.set("token", access_token, { path: "/" });
      Cookies.set("role_name", role_name, { path: "/" });
      if (role_name === Role.STUDENT || role_name === "student") {
        if (career === null) {
          Cookies.set("user_onboarding", "1", { path: "/" });
        } else if (topics === null) {
          Cookies.set("user_onboarding", "2", { path: "/" });
        } else if (education_level === null) {
          Cookies.set("user_onboarding", "3", { path: "/" });
        } else {
          Cookies.set("user_onboarding", "completed", { path: "/" });
        }
        Cookies.remove("instructor_onboarding", { path: "/" });
      } else if (role_name === Role.INSTRUCTOR || role_name === "instructor") {
        if (organization_id == null) {
          Cookies.set("instructor_onboarding", "1", { path: "/" });
        } else if (!instructor_id) {
          Cookies.set("instructor_onboarding", "2", { path: "/" });
        } else {
          Cookies.set("instructor_onboarding", "completed", { path: "/" });
        }
        Cookies.remove("user_onboarding", { path: "/" });
      } else {
        Cookies.remove("user_onboarding", { path: "/" });
        Cookies.remove("instructor_onboarding", { path: "/" });
      }
      return action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      if (state) {
        return { ...state, ...action.payload };
      }
      return state;
    },
    clearUser: () => {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("role_name", { path: "/" });
      Cookies.remove("user_onboarding", { path: "/" });
      Cookies.remove("instructor_onboarding", { path: "/" });
      return null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("role_name", { path: "/" });
      Cookies.remove("user_onboarding", { path: "/" });
      Cookies.remove("instructor_onboarding", { path: "/" });
      return null;
    });
  },
});

export const { setUser, clearUser, updateUser } = userDataSlice.actions;
export default userDataSlice.reducer;
