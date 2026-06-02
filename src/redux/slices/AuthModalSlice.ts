import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAllSlices } from "../resetSlice";

interface AuthState {
  signin: boolean;
  signup: boolean;
  otpVerify: boolean;
  forgotPass: boolean;
  changePass: boolean;
  token: string | null;
  user_id: string | null;
  email: string | null;
}

const initialState: AuthState = {
  signin: false,
  signup: false,
  otpVerify: false,
  forgotPass: false,
  changePass: false,
  token: null,
  user_id: null,
  email: null,
};

const AuthModalSlice = createSlice({
  name: "authmodal",
  initialState,
  reducers: {
    setSignin: (state, action: PayloadAction<boolean>) => {
      state.signin = action.payload;
    },
    setSignup: (state, action: PayloadAction<boolean>) => {
      state.signup = action.payload;
    },
    setOtpVerify: (state, action: PayloadAction<boolean>) => {
      state.otpVerify = action.payload;
    },
    setForgotPass: (state, action: PayloadAction<boolean>) => {
      state.forgotPass = action.payload;
    },
    setChangePass: (state, action: PayloadAction<boolean>) => {
      state.changePass = action.payload;
    },
    setEmail: (state, action: PayloadAction<string | null>) => {
      state.email = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setuserId: (state, action: PayloadAction<string | null>) => {
      state.user_id = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllSlices, () => initialState);
  },
});

export const {
  setSignin,
  setSignup,
  setOtpVerify,
  setForgotPass,
  setChangePass,
  setEmail,
  setToken,
  setuserId,
} = AuthModalSlice.actions;

export default AuthModalSlice.reducer;
