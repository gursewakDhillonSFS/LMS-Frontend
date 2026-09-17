import {
  AddToFavoriteProp,
  changePasswordProp,
  CreateCoursePayloadStep1,
  CreateCoursePayloadStep3,
  CreateCoursePayloadStep4,
  CreateIntructorProp,
  OnBoardingUser,
  SignupPayload,
  updateCourseStatusProp,
  updateCourseStep2Prop,
  updateCourseStep3Prop,
  updateCourseStep4Prop,
  updateCourseStep5Prop,
  updateCourseStep6Prop,
} from "@/utils/interface";
import { deleteApi, getApi, patchApi, postApi, putApi } from "./methods";

//Public Section Apis

const GET_ALL_CATEGORIES = "/auth/course/v1/get-all-category";
const GET_ALL_COURSES = "/auth/course/v1/get-all-course";
const GET_COURSE_INFO = "/auth/course/v1/course-details";
const GET_COURSE_REVIEW = "/review/v1/get/review_course";
const GET_Search = "/auth/course/v1/search";
const DELETE_COURSE = "/auth/course/v1";

export const getAllCategoriesApi = () => {
  return getApi(GET_ALL_CATEGORIES);
};
export const getAllCoursesApi = (params?: URLSearchParams) => {
  return getApi(`${GET_ALL_COURSES}${params ? '?' + params : ''}`);
};
export const getCourseInfoApi = (course_id: string) => {
  return getApi(`${GET_COURSE_INFO}/${course_id}`);
};
export const getCourseReviewApi = (payload: object) => {
  return postApi(`${GET_COURSE_REVIEW}`, payload);
};
export const getSearchApi = (param: URLSearchParams) => {
  return getApi(`${GET_Search}?${param}`);
};
export const deleteCourseApi = (course_id: string) => {
  return deleteApi(`${DELETE_COURSE}/${course_id}`);
};

// Authentication Section Apis

const CREATE_USER = "/auth/user/v1/create";
const USER_ONBOARDING_STEP1 = "/auth/user/v1/user-onboarding/career";
const USER_ONBOARDING_STEP2 = "/auth/user/v1/user-onboarding/topics";
const USER_ONBOARDING_STEP3 = "/auth/user/v1/user-onboarding/education-level";
const Login = "/auth/user/v1/login";
const CREATE_ORGANISATION = "/auth/user/v1/organization/create";
const FORGET_PASSWORD = "/auth/user/v1/forget-password";
const VERIFY_OTP = "/auth/user/v1/verify-otp";
const RESET_PASSWORD = "/auth/user/v1/reset-password";
const SOCIAL_AUTH = "/auth/user/v1/auth/oauth-login-signup";
const CHANGE_PASSWORD = "/auth/user/v1/change-password";
const UPDATE_PROFILE = "/auth/user/v1/update-profile";
const GET_ORGANISATION_BY_ID = "/auth/user/v1/organization";

export const updateUserProfileApi = (payload: FormData) => {
  return patchApi(UPDATE_PROFILE, payload);
};

export const getOrganisationDetailsApi = (orgId: string) => {
  return getApi(`${GET_ORGANISATION_BY_ID}/${orgId}`);
};

export const changePassword = (payload: changePasswordProp) => {
  return putApi(CHANGE_PASSWORD, payload);
};

export const createUserApi = (payload: SignupPayload) => {
  return postApi(CREATE_USER, payload);
};
export const onboardingStep1 = (payload: OnBoardingUser) => {
  return patchApi(USER_ONBOARDING_STEP1, payload);
};
export const onboardingStep2 = (payload: OnBoardingUser) => {
  return patchApi(USER_ONBOARDING_STEP2, payload);
};
export const onboardingStep3 = (payload: OnBoardingUser) => {
  return patchApi(USER_ONBOARDING_STEP3, payload);
};

export const loginApi = (payload: { email: string; password: string }) => {
  return postApi(Login, payload);
};
export const createOrganisationApi = (payload: FormData) => {
  return postApi(CREATE_ORGANISATION, payload);
};
export const forgetPasswordApi = (payload: { email: string }) => {
  return postApi(FORGET_PASSWORD, payload);
};
export const verifyOtpApi = (payload: {
  otp: string;
  email?: string;
  user_id?: string;
}) => {
  return postApi(VERIFY_OTP, payload);
};
export const resetPasswordApi = (payload: {
  token: string;
  user_id: string;
  new_password: string;
  re_enter_new_password: string;
}) => {
  return postApi(RESET_PASSWORD, payload);
};
export const socialAuth = (payload: {
  token: string;
  provider: string;
  role_name?: string;
}) => {
  return postApi(SOCIAL_AUTH, payload);
};

// Create Course Api

const INSTRUCTOR_LISTING = "/auth/course/v1/instructors/dropdown";
const CREATE_COURSE_STEP1 = "/auth/course/v1/create/course-step-1";
const CREATE_COURSE_STEP2 = "/auth/course/v1/create/course-step-2";
const CREATE_COURSE_STEP3 = "/auth/course/v1/create/course-step-3";
const CREATE_COURSE_FINALSTEP = "/auth/course/v1/create/course-final-step";
const CREATE_LESSON = "/auth/course/v1/lesson/create";
const CREATE_SUBLESSON = "/auth/course/v1/Sublesson/create";
const USER_COURSE_LIST = "/auth/course/v1/get-enrolled-courses";
const COURSE_SUBLESSON_UPDATE = "/auth/course/v1/Sublesson/update";
const COURSE_LESSON_UPDATE = "/auth/course/v1/lesson/update";
const COURSE_SUBLESSON_DELETE = "/auth/course/v1/sublesson/delete";
const COURSE_LESSON_DELETE = "/auth/course/v1/lesson/delete";
const COURSE_LESSON_REORDER = "/auth/course/v1/lesson/reorder";
const COURSE_SUBLESSON_REORDER = "/auth/course/v1/sublesson/reorder";
const ALL_LESSON = "/auth/course/v1/get-sublesson-lesson";
const GET_ORGANISATION = "/auth/user/v1/organization";
const ADD_TO_FAVORITE = "/auth/course/v1/add-to-favorite";
const GET_FAVORITE_COURSES = "/auth/course/v1/get-favorite-courses";
const REMOVE_FROM_FAVORITE = "/auth/course/v1/remove-from-favorite";
const UPDATE_COURSE_STATUS = "/auth/course/v1/update-course";
const UPDATE_COURSE_STEP_1 = "/auth/course/v1/update/course-step-1";
const UPDATE_COURSE_STEP_2 = "/auth/course/v1/update/course-step-2";
const UPDATE_COURSE_STEP_3 = "/auth/course/v1/update/course-step-3";
const UPDATE_COURSE_STEP_4 = "/auth/course/v1/update/course-step-4";
const UPDATE_COURSE_STEP_5 = "/auth/course/v1/update/course-step-5";
const UPDATE_COURSE_STEP_6 = "/auth/course/v1/update/course-step-6";
const CREATE_BATCH = "/auth/course/v1/batch/create";
const UPDATE_BATCH = "/auth/course/v1/batch/update";
const DELETE_BATCH = "/auth/course/v1/batch/delete";

export const updateCourseStep6 = (payload: updateCourseStep6Prop) => {
  return putApi(UPDATE_COURSE_STEP_6, payload);
};

export const updateCourseStep5 = (payload: updateCourseStep5Prop) => {
  return putApi(UPDATE_COURSE_STEP_5, payload);
};
export const updateCourseStep4 = (payload: updateCourseStep4Prop) => {
  return putApi(UPDATE_COURSE_STEP_4, payload);
};

export const updateCourseStep3 = (payload: updateCourseStep3Prop) => {
  return putApi(UPDATE_COURSE_STEP_3, payload);
};
export const updateCourseStep2 = (payload: updateCourseStep2Prop) => {
  return putApi(UPDATE_COURSE_STEP_2, payload);
};
export const createLessonApi = (payload: FormData) => {
  return postApi(CREATE_LESSON, payload);
};
export const createSublessonApi = (payload: FormData) => {
  return postApi(CREATE_SUBLESSON, payload);
};

export const createBatchApi = (payload: { course_id: string; batchName: string; teacher: string | null }) => {
  return postApi(CREATE_BATCH, payload);
};
export const updateBatchApi = (payload: { course_id: string; batch_id: string; batchName: string; teacher: string | null }) => {
  return putApi(UPDATE_BATCH, payload);
};
export const deleteBatchApi = (courseId: string, batchId: string) => {
  return deleteApi(`${DELETE_BATCH}/${courseId}/${batchId}`);
};

export const updateCourseStep1 = (paylaod: FormData) => {
  return putApi(UPDATE_COURSE_STEP_1, paylaod);
};
export const updateCourseStatus = (payload: updateCourseStatusProp) => {
  return putApi(UPDATE_COURSE_STATUS, payload);
};

export const removeFromFavorite = (param: URLSearchParams) => {
  return deleteApi(`${REMOVE_FROM_FAVORITE}?${param}`);
};

export const addToFavorite = (payload: AddToFavoriteProp) => {
  return patchApi(ADD_TO_FAVORITE, payload);
};
export const getSavedCourses = () => {
  return getApi(GET_FAVORITE_COURSES);
};

export const getOrganisation = (id: string) => {
  return getApi(`${GET_ORGANISATION}/${id}`);
};

export const getAllLesson = (param: URLSearchParams) => {
  return getApi(`${ALL_LESSON}?${param}`);
};

export const getLessonsWithSublessonsApi = (courseId: string) => {
  const params = new URLSearchParams({ course_id: courseId });
  return getApi(`${ALL_LESSON}?${params}`);
};

export const updateSublesson = (payload: FormData) => {
  return putApi(COURSE_SUBLESSON_UPDATE, payload);
};
export const updateLesson = (payload: FormData) => {
  return putApi(COURSE_LESSON_UPDATE, payload);
};
export const deleteLesson = (lesson_id: string) => {
  return deleteApi(`${COURSE_LESSON_DELETE}/${lesson_id}`);
};
export const deleteSublesson = (sublesson_id: string) => {
  return deleteApi(`${COURSE_SUBLESSON_DELETE}/${sublesson_id}`);
};
export const reorderLessons = (
  course_id: string,
  orders: { lesson_id: string; order: number }[]
) => {
  return putApi(COURSE_LESSON_REORDER, { course_id, orders });
};
export const reorderSublessons = (
  lesson_id: string,
  orders: { sublesson_id: string; order: number }[]
) => {
  return putApi(COURSE_SUBLESSON_REORDER, { lesson_id, orders });
};

export const getInstructorListing = () => {
  return getApi(INSTRUCTOR_LISTING);
};

export const createStep1 = (payload: CreateCoursePayloadStep1) => {
  return postApi(CREATE_COURSE_STEP1, payload);
};

export const createStep2 = (payload: FormData) => {
  return postApi(CREATE_COURSE_STEP2, payload);
};

export const createStep3 = (payload: CreateCoursePayloadStep3) => {
  return postApi(CREATE_COURSE_STEP3, payload);
};

export const createFinalStep = (payload: CreateCoursePayloadStep4) => {
  return postApi(CREATE_COURSE_FINALSTEP, payload);
};

export const createLesson = (payload: FormData) => {
  return postApi(CREATE_LESSON, payload);
};

export const createSubLesson = (payload: FormData) => {
  return postApi(CREATE_SUBLESSON, payload);
};

export const purchaseCourseApi = (payload: { course_id: string; batch_id?: string }) =>
  postApi("/auth/course/v1/purchase", payload);

export const checkPurchaseAccessApi = (courseId: string) =>
  getApi(`/auth/course/v1/purchase/${courseId}/access`);

export const getStudentPurchasesApi = () =>
  getApi("/auth/course/v1/purchases");

export const getPurchaseDetailApi = (purchaseId: string) =>
  getApi(`/auth/course/v1/purchases/${purchaseId}`);

export const confirmCheckoutSessionApi = (sessionId: string) =>
  getApi(`/auth/course/v1/checkout/confirm?session_id=${sessionId}`);

// ─── Stripe Connect APIs ──────────────────────────────────────────────────────
export const createOrgConnectApi = (payload?: { organisationId?: string }) =>
  postApi("/auth/course/v1/stripe/connect/organisation", payload || {});

export const getOrgConnectStatusApi = (organisationId?: string) => {
  const query = organisationId ? `?organisationId=${organisationId}` : "";
  return getApi(`/auth/course/v1/stripe/connect/organisation/status${query}`);
};

export const getOrgDashboardLinkApi = (payload?: { organisationId?: string }) =>
  postApi("/auth/course/v1/stripe/connect/organisation/dashboard", payload || {});

export const createTeacherConnectApi = (payload?: { teacherId?: string }) =>
  postApi("/auth/course/v1/stripe/connect/teacher", payload || {});

export const getTeacherConnectStatusApi = (teacherId?: string) => {
  const query = teacherId ? `?teacherId=${teacherId}` : "";
  return getApi(`/auth/course/v1/stripe/connect/teacher/status${query}`);
};

export const getTeacherDashboardLinkApi = (payload?: { teacherId?: string }) =>
  postApi("/auth/course/v1/stripe/connect/teacher/dashboard", payload || {});

// ─── Earnings APIs ────────────────────────────────────────────────────────────
export const getOrgEarningsApi = (organisationId?: string) => {
  const query = organisationId ? `?organisationId=${organisationId}` : "";
  return getApi(`/auth/course/v1/earnings/organisation${query}`);
};

export const getTeacherEarningsApi = (teacherId?: string) => {
  const query = teacherId ? `?teacherId=${teacherId}` : "";
  return getApi(`/auth/course/v1/earnings/teacher${query}`);
};

export const getAdminEarningsApi = () =>
  getApi("/auth/course/v1/earnings/admin");

export const syncTeacherPayoutsApi = (payload?: { teacherId?: string }) =>
  postApi("/auth/course/v1/stripe/connect/teacher/sync-payouts", payload || {});

export const syncOrgPayoutsApi = (payload?: { organisationId?: string }) =>
  postApi("/auth/course/v1/stripe/connect/organisation/sync-payouts", payload || {});

export const retryAdminPayoutsApi = () =>
  postApi("/auth/course/v1/payment/admin/payouts/retry", {});

export const refundPurchaseApi = (purchaseId: string, payload?: { reason?: string }) =>
  postApi(`/auth/course/v1/refund/${purchaseId}`, payload || {});

export const userCourseList = (param: URLSearchParams) => {
  return getApi(`${USER_COURSE_LIST}?${param}`);
};

// Teacher Section Api

const GET_ALL_INSTRUCTOR = "/auth/course/v1/get-all-Instructor";
const DELETE_INSTRUCTOR = "/auth/course/v1/delete-instructor";
const CREATE_INSTRUCTOR = "/auth/course/v1/create-Instructor";
const GET_INSTRUCTOR = "/auth/course/v1/get-Instructor-by-id";
const UPDATE_INSTRUCTOR = "/auth/course/v1/instructor/update";

export const updateInstructor = (payload: FormData) => {
  return putApi(UPDATE_INSTRUCTOR, payload);
};
export const getInstructor = (param: URLSearchParams) => {
  return getApi(`${GET_INSTRUCTOR}?${param}`);
};
export const getAllInstructor = (param: URLSearchParams) => {
  return getApi(`${GET_ALL_INSTRUCTOR}?${param}`);
};
export const deleteInstructor = (instructor_id: string) => {
  return deleteApi(`${DELETE_INSTRUCTOR}/${instructor_id}`);
};
export const createInstrucotor = (payload: CreateIntructorProp) => {
  return postApi(CREATE_INSTRUCTOR, payload);
};

// Chat Api

const USER_CHAT_ROOM = "/communication/v1/user-chat-rooms";

export const chatRoom = () => {
  return getApi(USER_CHAT_ROOM);
};

export const getChatMessagesApi = (groupId: string) =>
  getApi(`/communication/v1/messages/${groupId}`);


// ─── Assignment APIs ─────────────────────────────────────────────────────────
const CREATE_ASSIGNMENT = "/auth/assignment/v1/create";
const GET_ASSIGNMENTS_BY_BATCH = "/auth/assignment/v1/by-batch";
const GET_ASSIGNMENT_DETAILS = "/auth/assignment/v1/details";
const GET_ASSIGNMENTS_BY_COURSE = "/auth/assignment/v1/by-course";
const UPDATE_ASSIGNMENT = "/auth/assignment/v1/update";
const DELETE_ASSIGNMENT = "/auth/assignment/v1/delete";
const GET_ASSIGNMENT_SUBMISSIONS = "/auth/assignment/v1";
const GRADE_SUBMISSION = "/auth/assignment/v1/submissions/grade";

export const createAssignmentApi = (payload: object) =>
  postApi(CREATE_ASSIGNMENT, payload);

export const getAssignmentsByBatchApi = (params: URLSearchParams) =>
  getApi(`${GET_ASSIGNMENTS_BY_BATCH}?${params}`);

export const getAssignmentDetailsApi = (id: string) =>
  getApi(`${GET_ASSIGNMENT_DETAILS}/${id}`);

export const getAssignmentsByCourseApi = (courseId: string) =>
  getApi(`${GET_ASSIGNMENTS_BY_COURSE}/${courseId}`);

export const updateAssignmentApi = (id: string, payload: object) =>
  putApi(`${UPDATE_ASSIGNMENT}/${id}`, payload);

export const deleteAssignmentApi = (id: string) =>
  deleteApi(`${DELETE_ASSIGNMENT}/${id}`);

export const getAssignmentSubmissionsApi = (id: string, params?: URLSearchParams) =>
  getApi(`${GET_ASSIGNMENT_SUBMISSIONS}/${id}/submissions${params ? '?' + params : ''}`);

export const getSubmissionDetailsApi = (id: string) =>
  getApi(`${GET_ASSIGNMENT_SUBMISSIONS}/submission-detail/${id}`);

export const gradeSubmissionApi = (payload: {
  submissionId: string;
  result?: string;
  feedback?: string;
}) => postApi(GRADE_SUBMISSION, payload);

// ─── Quiz APIs ────────────────────────────────────────────────────────────────
const CREATE_QUIZ = "/auth/quiz/v1/create";
const GET_QUIZZES_BY_BATCH = "/auth/quiz/v1/by-batch";
const GET_QUIZ_DETAILS = "/auth/quiz/v1/details";
const GET_QUIZZES_BY_COURSE = "/auth/quiz/v1/by-course";
const UPDATE_QUIZ = "/auth/quiz/v1/update";
const DELETE_QUIZ = "/auth/quiz/v1/delete";
const GET_QUIZ_SUBMISSIONS = "/auth/quiz/v1";
const GRADE_QUIZ_SUBMISSION = "/auth/quiz/v1/submissions/grade";

export const createQuizApi = (payload: object) =>
  postApi(CREATE_QUIZ, payload);

export const getQuizzesByBatchApi = (params: URLSearchParams) =>
  getApi(`${GET_QUIZZES_BY_BATCH}?${params}`);

export const getQuizDetailsApi = (id: string) =>
  getApi(`${GET_QUIZ_DETAILS}/${id}`);

export const getQuizzesByCourseApi = (courseId: string) =>
  getApi(`${GET_QUIZZES_BY_COURSE}/${courseId}`);

export const updateQuizApi = (id: string, payload: object) =>
  putApi(`${UPDATE_QUIZ}/${id}`, payload);

export const deleteQuizApi = (id: string) =>
  deleteApi(`${DELETE_QUIZ}/${id}`);

export const getQuizSubmissionsApi = (
  id: string,
  params?: URLSearchParams,
) =>
  getApi(
    `${GET_QUIZ_SUBMISSIONS}/${id}/submissions${params ? "?" + params : ""}`,
  );

export const gradeQuizSubmissionApi = (payload: {
  submissionId: string;
  feedback?: string;
}) => postApi(GRADE_QUIZ_SUBMISSION, payload);

// ─── Announcement APIs ────────────────────────────────────────────────────────
const CREATE_ANNOUNCEMENT = "/auth/announcement/v1/create";
const GET_ANNOUNCEMENTS_BY_COURSE = "/auth/announcement/v1/by-course";
const GET_ANNOUNCEMENTS_BY_COURSES = "/auth/announcement/v1/by-courses";
const GET_ANNOUNCEMENTS_BY_INSTRUCTOR = "/auth/announcement/v1/by-instructor";
const UPDATE_ANNOUNCEMENT = "/auth/announcement/v1/update";
const DELETE_ANNOUNCEMENT = "/auth/announcement/v1/delete";

export const getMyAnnouncementsApi = (params?: URLSearchParams) =>
  getApi(`/auth/announcement/v1/my-announcements${params ? '?' + params : ''}`);

export const getUnreadAnnouncementCountApi = () =>
  getApi("/auth/announcement/v1/unread-count");

export const markAnnouncementsAsReadApi = () =>
  postApi("/auth/announcement/v1/mark-all-read", {});

export const triggerDueDateCheckApi = () =>
  postApi("/auth/announcement/v1/trigger-due-date-check", {});

export const createAnnouncementApi = (payload: object) =>
  postApi(CREATE_ANNOUNCEMENT, payload);

export const getAnnouncementsByCourseApi = (courseId: string, params?: URLSearchParams) =>
  getApi(`${GET_ANNOUNCEMENTS_BY_COURSE}/${courseId}${params ? '?' + params : ''}`);

export const getAnnouncementsByCoursesApi = (payload: { courses: { courseId: string; batchId?: string }[] }) =>
  postApi(GET_ANNOUNCEMENTS_BY_COURSES, payload);

export const getAnnouncementsByInstructorApi = (params?: URLSearchParams) =>
  getApi(`${GET_ANNOUNCEMENTS_BY_INSTRUCTOR}${params ? '?' + params : ''}`);

export const updateAnnouncementApi = (id: string, payload: object) =>
  putApi(`${UPDATE_ANNOUNCEMENT}/${id}`, payload);

export const deleteAnnouncementApi = (id: string) =>
  deleteApi(`${DELETE_ANNOUNCEMENT}/${id}`);

// ─── Schedule APIs ────────────────────────────────────────────────────────────
const CREATE_SCHEDULE = "/auth/schedule/v1/create";
const GET_SCHEDULES = "/auth/schedule/v1/list";
const UPDATE_SCHEDULE = "/auth/schedule/v1/update";
const DELETE_SCHEDULE = "/auth/schedule/v1/delete";

export const createScheduleApi = (payload: object) =>
  postApi(CREATE_SCHEDULE, payload);

export const getSchedulesApi = (params?: URLSearchParams) =>
  getApi(`${GET_SCHEDULES}${params ? '?' + params : ''}`);

export const updateScheduleApi = (id: string, payload: object) =>
  putApi(`${UPDATE_SCHEDULE}/${id}`, payload);

export const deleteScheduleApi = (id: string) =>
  deleteApi(`${DELETE_SCHEDULE}/${id}`);

const UPDATE_SCHEDULE_RECORDING = "/auth/schedule/v1/recording";
export const updateScheduleRecordingApi = (
  id: string,
  payload: { recordingUrl: string; recordingName?: string }
) => putApi(`${UPDATE_SCHEDULE_RECORDING}/${id}`, payload);

// ─── Students APIs ────────────────────────────────────────────────────────────
const GET_STUDENTS_LIST = "/auth/course/v1/students/list";
const GET_STUDENT_DETAILS = "/auth/course/v1/students";
const GET_STUDENT_EVALUATIONS = "/auth/course/v1/student/evaluations";

export const getStudentsListApi = (params?: URLSearchParams) =>
  getApi(`${GET_STUDENTS_LIST}${params ? '?' + params : ''}`);

export const getStudentDetailsApi = (studentId: string) =>
  getApi(`${GET_STUDENT_DETAILS}/${studentId}/details`);

export const getStudentSubmissionsApi = (studentId: string) =>
  getApi(`${GET_STUDENT_DETAILS}/${studentId}/submissions`);

export const getStudentEvaluationsApi = (courseId?: string, batchId?: string) => {
  const params = new URLSearchParams();
  if (courseId) params.append("courseId", courseId);
  if (batchId) params.append("batchId", batchId);
  const qs = params.toString();
  return getApi(`${GET_STUDENT_EVALUATIONS}${qs ? '?' + qs : ''}`);
};

// ─── Course Progress APIs ──────────────────────────────────────────────────────
const COURSE_PROGRESS = "/auth/course/v1/progress";

export const getCourseProgressApi = (courseId: string, batchId: string) =>
  getApi(`${COURSE_PROGRESS}?course_id=${courseId}&batch_id=${batchId}`);

export const markLessonCompleteApi = (payload: {
  lesson_id: string;
  course_id: string;
  batch_id: string;
}) => postApi(`${COURSE_PROGRESS}/complete-lesson`, payload);

export const markMaterialCompleteApi = (payload: {
  material_url: string;
  course_id: string;
  batch_id: string;
}) => postApi(`${COURSE_PROGRESS}/complete-material`, payload);

export const getDashboardStatsApi = () =>
  getApi("/auth/course/v1/dashboard/stats");

export const getMyCertificatesApi = () => getApi("/certificate/v1/my");

// ─── Student Submission APIs ───────────────────────────────────────────────────
export const submitAssignmentApi = (
  assignmentId: string,
  payload: { submittedText: string },
) => postApi(`/auth/assignment/v1/${assignmentId}/submit`, payload);

export const submitQuizApi = (
  quizId: string,
  payload: {
    answers: {
      questionIndex: number;
      questionType: "mcq" | "essay";
      selectedOption?: string;
      submittedText?: string;
    }[];
  },
) => postApi(`/auth/quiz/v1/${quizId}/submit`, payload);

// ─── Course Translation APIs ──────────────────────────────────────────────────
export const getCourseTranslationsApi = (courseId: string) =>
  getApi(`/auth/course/v1/translations/${courseId}`);

export const updateCourseTranslationApi = (
  courseId: string,
  payload: {
    locale: string;
    course_name?: string;
    about_course?: string;
    description?: string;
    overview?: string;
    learning_points?: string[];
    skills_you_gain?: string[];
  },
) => putApi(`/auth/course/v1/translations/${courseId}`, payload);

export const regenerateCourseTranslationApi = (
  courseId: string,
  locale?: string,
) => postApi(`/auth/course/v1/translations/${courseId}/regenerate`, { locale });

// ─── Notification APIs ───────────────────────────────────────────────────────
export const getMyNotificationsApi = (unreadOnly = false) =>
  getApi(`/auth/notification/v1/my-notifications${unreadOnly ? "?unreadOnly=true" : ""}`);

export const markNotificationReadApi = (notificationId: string) =>
  putApi(`/auth/notification/v1/mark-read/${notificationId}`, {});

export const markAllNotificationsReadApi = () =>
  putApi("/auth/notification/v1/mark-all-read", {});

// ─── Chat Message Fallback API ───────────────────────────────────────────────
export const sendChatMessageApi = (groupId: string, message: string) =>
  postApi("/auth/communication/v1/send-message", { groupId, message });

// ─── Certificate Claim API ───────────────────────────────────────────────────
export const claimCertificateApi = (courseId: string) =>
  postApi("/auth/certificate/v1/claim", { courseId });

