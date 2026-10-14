export enum CategoryEnum {
  ALL_Classes = "all",
}

export enum UserCourseTab {
  Active = "active",
  Completed = "completed",
}

export const NotificationTabEnum = {
  Announcement: "annoucement",
  Chat: "chat",
};

export enum EvaluationTabEnum {
  PERFORMANCE = "performance",
  OVERALL_RESULT = "overall-result",
}

export enum InstructorEvaluationTabEnum {
  OVERALL_RESULT = "overall-result",
  CERTIFICATE = "certificate",
}

export enum CertificateTabEnum {
  CERTIFICATES = "certificates",
  BADGES = "badges",
}

export enum SettingProfileTabEnum {
  PROFILE = "profile",
  NOTIFICATIONS = "notifications",
  MEMBERSHIP = "membership",
}

export enum InstructorSettingEnum {
  PROFILE = "profile",
  ORGANISATION = "organisation",
  NOTIFICATIONS = "notifications",
  PAYMENTS = "payments",
}

export enum QuizDetailTabEnum {
  QUESTIONS = "questions",
  SCORE = "score",
}
export const AssignmentTabEnum = {
  Current: "current",
  Past: "past",
};

export enum AssignmentDetailTabEnum {
  ASSIGNMENT_DETAILS = "assignment-details",
  SCORE = "score",
}

export enum InstructorAssignmentDetailTabEnum {
  ASSIGNMENT_DETAILS = "assignment-details",
  SCORE = "score",
}

export enum UserCourseInternalTab {
  COURSES = "courses",
  LIVE_CLASSES = "live-classes",
  ASSIGNMENTS = "assignments",
  QUIZZES = "quizzes",
  EVALUATIONS = "evaluations",
}

export enum Role {
  STUDENT = "student",
  INSTRUCTOR = "instructor",
  TEACHER = "teacher",
  ADMIN = "admin",
}

export enum RoutePaths {
  // Public Routes
  BecomeInstructor = "/becomeInstructor",
  Browse = "/browse",
  Homepage = "/",
  Onboarding = "/onboarding",

  // User Routes
  Dashboard = "/dashboard",
  MyCertificate = "/my-certificate",
  MyCourses = "/my-courses",
  Learn = "/learn",
  MyExplore = "/my-explore",
  MySchedule = "/my-schedule",
  MySettings = "/my-settings",
  SavedCourses = "/saved-courses",
  Checkout = "/checkout",
  PurchaseHistory = "/my-courses/purchases",

  // Admin
  AdminPanel = "/admin",
  AdminFinance = "/admin/finance",

  // Instructor Routes
  Announcements = "/announcements",
  Assignments = "/assignments",
  Courses = "/courses",
  InstructorPanel = "/instructor-panel",
  LiveClasses = "/live-classes",
  Quizzes = "/quizzes",
  Schedule = "/schedule",
  Settings = "/settings",
  Students = "/students",
  Teachers = "/teachers",
  InstructorEarnings = "/earnings",
  InstructorPayments = "/settings/payments",

  // Teacher Routes
  TeacherDashboard = "/teacher/dashboard",
  TeacherCourses = "/teacher/courses",
  TeacherStudents = "/teacher/students",
  TeacherSchedule = "/teacher/schedule",
  TeacherAssignments = "/teacher/assignments",
  TeacherQuizzes = "/teacher/quizzes",
  TeacherLiveClasses = "/teacher/live-classes",
  TeacherSettings = "/teacher/settings",
  TeacherEarnings = "/teacher/earnings",
}

export enum ChatTabEnum {
  MEMBERS = "members",
  SETTINGS = "settings",
}

export enum InstructorCourseTab {
  COURSES = "courses",
  REQUESTED_DEMO = "requested Demo",
}

export enum InstructorCourseDetailsTab {
  COURSE_INFO = "course Info",
  LESSON = "lesson",
  STUDENTS = "students",
  BATCH = "batch",
  TRANSLATIONS = "translations",
}

export enum InstructorAnnouncementsDetailsTabEnum {
  ANNOUNCEMENT = "announcement",
  DRAFT = "draft",
}

export enum ClassTabEnum {
  UPCOMING = "upcoming",
  PAST = "past",
}

export enum StudentTabEnum {
  STUDENT_INFO = "studentInfo",
  ASSIGNMENTS = "assignments",
  QUIZZES = "quizzes",
  EVALUATIONS = "evaluations",
}

export enum InstructorQuizTab {
  Ongoing = "ONGOING",
  Quizzes = "QUIZZES",
}

export enum InstructorAssignmentTab {
  Ongoing = "ONGOING",
  Assignment = "ASSIGNMENT",
}

export enum BatchTestTabs {
  QUIZZES_DETAILS = "Quizzes Details",
  ASSIGNMENT_DETAILS = "Assignment Details",
  STUDENTS = "Students",
}

export enum StatusEnum {
  PUBLISH = "published",
  UNPUBLISH = "unpublished",
  DRAFT = "draft",
}
