import {
  AssignmentDetailTabEnum,
  CertificateTabEnum,
  ChatTabEnum,
  EvaluationTabEnum,
  QuizDetailTabEnum,
  UserCourseInternalTab,
  InstructorCourseDetailsTab,
  InstructorCourseTab,
  UserCourseTab,
  InstructorAnnouncementsDetailsTabEnum,
  ClassTabEnum,
  StudentTabEnum,
  InstructorEvaluationTabEnum,
  InstructorAssignmentDetailTabEnum,
  InstructorQuizTab,
  BatchTestTabs,
  InstructorAssignmentTab,
} from "./enums";
import { Onboarding1, Onboarding2, Onboarding3, Onboarding4 } from "./images";

export const categories = [
  { category_id: "2", category_name: "AI & Innovation" },
  { category_id: "3", category_name: "Animation" },
  { category_id: "4", category_name: "Creative Writing" },
  { category_id: "5", category_name: "Crafts" },
  { category_id: "6", category_name: "Drawing & Painting" },
  { category_id: "7", category_name: "Digital Illustration" },
  { category_id: "8", category_name: "Education" },
  { category_id: "9", category_name: "Film & Video" },
  { category_id: "10", category_name: "Graphic Design" },
  { category_id: "11", category_name: "Music" },
  { category_id: "12", category_name: "Marketing" },
  { category_id: "13", category_name: "UI/UX Design" },
];

export const stats = [
  { value: "16530+", label: "Total Courses" },
  { value: "5.1 crore+", label: "Total Enrollments" },
  { value: "44.4 lakh+", label: "Total Certifications" },
];

export const UserTab = [
  { label: "Active", key: UserCourseTab.Active },
  { label: "Completed", key: UserCourseTab.Completed },
];

export const NotificationTab = [
  { label: "Class Annoucement", key: "annoucement" },
  { label: "Chat", key: "chat" },
];
export const AssignmentTab = [
  { label: "Current Assignment", key: "current" },
  { label: "Past Assignment", key: "past" },
];

export const AssignmentDetailTabs = [
  {
    key: AssignmentDetailTabEnum.ASSIGNMENT_DETAILS,
    label: "Assignments Details",
  },
  {
    key: AssignmentDetailTabEnum.SCORE,
    label: "Score",
  },
];

export const InstructorAssignmentDetailTabs = [
  {
    key: InstructorAssignmentDetailTabEnum.ASSIGNMENT_DETAILS,
    label: "Assignments",
  },
  {
    key: InstructorAssignmentDetailTabEnum.SCORE,
    label: "Score",
  },
];

export const InstructorQuizOptions = [
  { label: "Ongoing", key: InstructorQuizTab.Ongoing },
  { label: "Past", key: InstructorQuizTab.Quizzes },
];
export const InstructorAssignmentOptions = [
  { label: "Ongoing", key: InstructorAssignmentTab.Ongoing },
  { label: "Past", key: InstructorAssignmentTab.Assignment },
];

export const BatchTestOptions = [
  {
    label: BatchTestTabs.QUIZZES_DETAILS,
    key: BatchTestTabs.QUIZZES_DETAILS,
  },
  {
    label: BatchTestTabs.STUDENTS,
    key: BatchTestTabs.STUDENTS,
  },
];

export const BatchAssignmentTestOptions = [
  {
    label: BatchTestTabs.ASSIGNMENT_DETAILS,
    key: BatchTestTabs.ASSIGNMENT_DETAILS,
  },
  {
    label: BatchTestTabs.STUDENTS,
    key: BatchTestTabs.STUDENTS,
  },
];

export const CertificateTabSwitcher = [
  {
    label: "My Certificates",
    key: CertificateTabEnum.CERTIFICATES,
  },
  {
    label: "Badges",
    key: CertificateTabEnum.BADGES,
  },
];

export const ChatTabOptions = [
  {
    key: ChatTabEnum.MEMBERS,
    label: "Members",
  },
  {
    key: ChatTabEnum.SETTINGS,
    label: "Settings",
  },
];

export const QuizDetailTabs = [
  {
    key: QuizDetailTabEnum.QUESTIONS,
    label: "Questions",
  },
  {
    key: QuizDetailTabEnum.SCORE,
    label: "Score",
  },
];

export const EvaluationTab = [
  {
    key: EvaluationTabEnum.PERFORMANCE,
    label: "Performance",
  },
  {
    key: EvaluationTabEnum.OVERALL_RESULT,
    label: "Overall Result",
  },
];
export const InstructorEvaluationTab = [
  {
    key: InstructorEvaluationTabEnum.OVERALL_RESULT,
    label: "Overall Result",
  },
  {
    key: InstructorEvaluationTabEnum.CERTIFICATE,
    label: "Certificate",
  },
];

export const UserInternalTab = [
  { key: UserCourseInternalTab.COURSES, label: "Courses" },
  { key: UserCourseInternalTab.LIVE_CLASSES, label: "Live classes" },
  { key: UserCourseInternalTab.ASSIGNMENTS, label: "Assignments" },
  { key: UserCourseInternalTab.QUIZZES, label: "Quizzes" },
  { key: UserCourseInternalTab.EVALUATIONS, label: "Evaluations" },
];

export const badgeSections = [
  {
    title: "🎯 Completion & Progress Badges",
    subtitle:
      "These reward students for completing lessons, modules, or full courses.",
    badges: [
      { title: "First Step Taken", icon: "/icons/step.png" },
      { title: "Lesson Finisher", icon: "/icons/lesson.png" },
      { title: "Module Master", icon: "/icons/lock.png" },
      { title: "Course Conqueror", icon: "/icons/lock.png" },
      { title: "Track Traveler", icon: "/icons/lock.png" },
      { title: "Curriculum Climber", icon: "/icons/lock.png" },
      { title: "Daily Doer", icon: "/icons/lock.png" },
      { title: "Completion King/Queen", icon: "/icons/lock.png" },
      { title: "Learning Streaker", icon: "/icons/lock.png" },
      { title: "Ultimate Learner", icon: "/icons/lock.png" },
    ],
  },
  {
    title: "💎 Skill-Based Badges",
    subtitle:
      "These recognize subject-specific or topic-based accomplishments.",
    badges: [
      { title: "Math Magician", icon: "/icons/lock.png" },
      { title: "Code Cracker", icon: "/icons/lock.png" },
      { title: "Science Explorer", icon: "/icons/lock.png" },
      { title: "Word Wizard", icon: "/icons/lock.png" },
      { title: "History Hunter", icon: "/icons/lock.png" },
      { title: "Critical Thinker", icon: "/icons/lock.png" },
      { title: "Art Aficionado", icon: "/icons/lock.png" },
      { title: "Data Detective", icon: "/icons/lock.png" },
      { title: "Language Lover", icon: "/icons/lock.png" },
      { title: "Tech Trailblazer", icon: "/icons/lock.png" },
      { title: "Financial Wiz", icon: "/icons/lock.png" },
      { title: "Health Hero", icon: "/icons/lock.png" },
      { title: "AI Master", icon: "/icons/lock.png" },
      { title: "Design Wiz", icon: "/icons/design.png" },
    ],
  },
  {
    title: "🔥 Engagement & Participation Badges",
    subtitle: "These reward active users and community contributors.",
    badges: [
      { title: "Quiz Whiz", icon: "/icons/lock.png" },
      { title: "Discussion Dynamo", icon: "/icons/lock.png" },
      { title: "Curiosity Champion", icon: "/icons/lock.png" },
      { title: "Challenge Chaser", icon: "/icons/lock.png" },
      { title: "Fast Finisher", icon: "/icons/lock.png" },
      { title: "Perfect Attendance", icon: "/icons/lock.png" },
    ],
  },
];

export const InstructorCoursesTabs = [
  { label: "Courses", key: InstructorCourseTab.COURSES },
  { label: "Requested Demo", key: InstructorCourseTab.REQUESTED_DEMO },
];

export const InstructorCoursesDetailsTabs = [
  { label: "Course Info", key: InstructorCourseDetailsTab.COURSE_INFO },
  { label: "Lesson", key: InstructorCourseDetailsTab.LESSON },
  { label: "Students", key: InstructorCourseDetailsTab.STUDENTS },
  { label: "Batch", key: InstructorCourseDetailsTab.BATCH },
  { label: "Translations", key: InstructorCourseDetailsTab.TRANSLATIONS },
];

export const InstructorAnnouncementTabs = [
  {
    label: "Announcement",
    key: InstructorAnnouncementsDetailsTabEnum.ANNOUNCEMENT,
  },
  { label: "Draft", key: InstructorAnnouncementsDetailsTabEnum.DRAFT },
];

export const classTabOptions = [
  {
    label: "My Upcoming Classes",
    key: ClassTabEnum.UPCOMING,
  },
  {
    label: "Past Classes",
    key: ClassTabEnum.PAST,
  },
];

export const studentTabOption = [
  {
    label: "Student Info",
    key: StudentTabEnum.STUDENT_INFO,
  },
  {
    label: "Assignments",
    key: StudentTabEnum.ASSIGNMENTS,
  },
  {
    label: "Quizzes",
    key: StudentTabEnum.QUIZZES,
  },
  {
    label: "Evaluations",
    key: StudentTabEnum.EVALUATIONS,
  },
];

export const TagColors: Record<string, string> = {
  MCQ: "bg-[#5EB85C]",
  "Time Based": "bg-[#FF4F23]",
  Essay: "bg-[#C125FF]",
};

export const goalOptions = [
  {
    text: "Start my career",
    image: Onboarding1,
  },
  {
    text: "Change my career",
    image: Onboarding2,
  },
  {
    text: "Grow in my current role",
    image: Onboarding3,
  },
  {
    text: "Explore topics outside of work",
    image: Onboarding4,
  },
];

export const educationOptions = [
  "Less than high school diploma (or equivalent)",
  "High school diploma (or equivalent)",
  "Some college, but no degree",
  "Associate Degree (e.g., AA, AS)",
  "Bachelor's degree (e.g., BA, AB, BS)",
  "Master's degree (e.g., MA, MS, MEng, MEd, MSW, MBA)",
  "Professional school degree (e.g., MD, DDS, DVM, LLB, JD)",
  "Doctorate degree (e.g., PhD, EdD)",
];
