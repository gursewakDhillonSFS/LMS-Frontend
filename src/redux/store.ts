/* eslint-disable @typescript-eslint/no-unused-vars */
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import categoriesReducer from "./slices/CategoriesSlice";
import courseReducer from "./slices/CourseDataSlice";
import userCourseTabReducer from "./tabslice/UserCourseTabSlice";
import courseInternalTabReducer from "./tabslice/UserCourseInternalSlice";
import instructorCourseTabReducer from "./tabslice/InstructorCourseTabSlice";
import instructorStudentTabReducer from "./tabslice/InstructorStudentTabSlice";
import announcementTabReducer from "./tabslice/AnnouncementTabSlice";
import AuthModalReducer from "./slices/AuthModalSlice";
import userDataReducer from "./slices/UserDataSlice";
import createCourseReducer from "./slices/CreateCourseSlice";
import TeacherDataSlice from "./slices/TeacherDataSlice";

const rootReducer = combineReducers({
  categories: categoriesReducer,
  courseData: courseReducer,
  coursetab: userCourseTabReducer,
  internaltab: courseInternalTabReducer,
  authmodal: AuthModalReducer,
  userdata: userDataReducer,
  createCourse: createCourseReducer,
  teacherData: TeacherDataSlice,
  instructorCourseTab: instructorCourseTabReducer,
  instructorStudenttab: instructorStudentTabReducer,
  announcementTab: announcementTabReducer,
});

const createNoopStorage = () => ({
  getItem(_key: string): Promise<null> {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: string | null): Promise<string | null> {
    return Promise.resolve(value);
  },
  removeItem(_key: string): Promise<void> {
    return Promise.resolve();
  },
});

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const persistConfig = {
  key: "0.1",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
const persistor = persistStore(store);
export { store, persistor };

export type AppStore = ReturnType<typeof store.getState>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
