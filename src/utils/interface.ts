import { DefaultOptionType } from "antd/es/cascader";
import { BaseOptionType } from "antd/es/select";
import { StaticImageData } from "next/image";
import React, { Dispatch, ReactNode, SetStateAction } from "react";

export interface CommonButtonProp {
  onClick?: () =>
    | void
    | Promise<void>
    | undefined
    | (() => void | undefined)
    | (() => Promise<void>)
    | ((values: unknown) => Promise<void>)
    | (() => { payload: boolean; type: "authmodal/setSignup" })
    | (() => { payload: boolean; type: "authmodal/setSignin" })
    | (() => {
        payload: string | undefined;
        type: "categories/setActiveCategory";
      });
  className?: string;
  text: string | ReactNode;
  icon?: ReactNode;
  bgColor?: string;
  type?: "submit" | "reset" | "button" | undefined;
  loading?: boolean;
  disable?: boolean;
  disabled?: boolean;
}

export interface Tab {
  key: string;
  label: string;
}

export interface TabSwitcherProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  minWidth?: string;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface SortByDropdownProps {
  sortField: string | null;
  sortOrder: string | null;
  setSortField: Dispatch<SetStateAction<string | null>>;
  setSortOrder: Dispatch<SetStateAction<string | null>>;
  sortOptions: SortOption[];
  allowClear?: boolean;
  className?: string;
}

export interface CommonSearchProp {
  onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  search: string;
  suffix?: boolean;
  borderRadius?: string;
  icon?: ReactNode;
  placeholder?: string;
}

export interface ChangePasswordProps {
  open: boolean;
  onCancel: () => void;
}

export interface ConfirmationModalProps {
  open: boolean;
  onCancel: () => void;
  title?: string;
  description?: string;
  onSubmit: () => void;
  icon?: React.ReactNode;
  iconBG?: string;
  loading?: boolean;
}

export interface CourseCardProps {
  title?: string;
  instructor?: string;
  students?: string | number;
  rating?: number;
  image?: string | undefined | StaticImageData;
  certificate?: boolean;
  data?: courseData;
  bgColor?: string;
  footerColor?: string;
  titleColor?: string;
  instructorColor?: string;
  className?: string;
  courseData?: courseData;
  veiwDetail?:
    | (() => void | undefined)
    | ((data: courseData) => void)
    | (() => Promise<void>)
    | ((values: courseData) => Promise<void>);
  handleAddFavorite?: (value: string) => Promise<void>;
  handleRemoveFavorite?: (value: string) => Promise<void>;
  handleRedirect?:
    | (() => void | undefined)
    | ((data: courseData) => void)
    | (() => Promise<void>)
    | ((values: courseData) => Promise<void>);
  onClick?: (value: courseData | undefined) => void;
}

export interface courseData {
  _id?: string;
  course_id: string;
  category_id: string;
  user_id?: string;
  course_image_url?: string;
  course_url?: string;
  enrolled_status?: boolean;
  is_enrolled?: boolean;
  base_price?: number;
  favorite?: boolean;
  favorite_status?: boolean;
  course_status?: "published" | "draft" | string;
  total?: number;
  course_name?: string;
  description?: string;
  course_price?: number;
  status?: "published" | "draft" | string;
  created_at?: string;
  instructor_name?: string;
  enrolled_user_count?: number;
  average_rating?: number;
  review_count?: number;
  category_name?: string;
  course_duration?: string;
  course_level?: string;
  course_schedule?: string;
  head_teacher_id?: string;
  head_teacher_name?: string;
  head_teacher?: string;
  instructor_image_url?: string;
  head_teacher_image_url?: string | null;
  live_class?: boolean;
  batches?: Batch[];
}

export interface Batch {
  _id: string;
  batchName: string;
  teacher?: string | null;
  startDate?: string;
  endDate?: string;
}

export interface Course {
  id: number;
  image: StaticImageData;
  instructor: string;
  title: string;
  students: string;
  rating: number;
  certificate?: boolean;
}

export interface Instructor {
  instructor_id: string;
  name: string;
}

export interface Category {
  category_id: string;
  category_name: string;
}

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  centered?: boolean;
}

export interface CommonLinkProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export interface MessageTime {
  seconds: number;
  nanoseconds?: number;
}

export interface MessageProp {
  sender_id: string;
  message_type: "text" | "image" | "video" | "file";
  message: string;
  message_time: MessageTime;
}

export interface ChatConversation {
  _id: string;
  names?: string;
  name?: string;
  avatar?: string;
  lastMessage?: MessageProp;
  unread_count?: {
    [userId: string]: number;
  };
}

export interface RecordedClass {
  id: string;
  topic: string;
  thumbnail: string;
  isLive: boolean;
  streamedDate: string;
  duration: string;
  watchLink: string;
  downloadLink: string;
}

export interface BadgeProps {
  status: string;
  className?: string;
  shape?: "round" | "rectangle";
}

export interface BreadcrubItemProp {
  title: string;
  href: string;
}

export interface InstructorCoursesCardProp {
  title?: string;
  students?: number;
  created_Date?: string;
  headTeacher?: {
    image: string | null;
    name: string;
  };
  liveClasses?: string;
  created_at?: string;
  course_status?: string;
  batches?: number;
  quizzes?: number;
  lastQuizDate?: string;
  assignment?: number;
  lastAssignmentDate?: string;
  image?: string;
  status?: string;
  review_count?: number;
  category_name?: string;
  enrolled_user_count?: number;
  course_duration?: string;
  course_name?: string;
  course_level?: string;
  course_schedule?: string;
  head_teacher_id?: string;
  head_teacher_name?: string;
  head_teacher_image_url?: string | null;
  live_class?: boolean;
}

export interface RequestedDemoProp {
  student: {
    name: string;
    image: string | null;
  };
  course: string;
  timeSlot: string;
}

interface User {
  image?: string | StaticImageData | null;
  name?: string;
}

export interface UserAvatarDisplayProps {
  user: User;
  showNameNextToAvatar?: boolean;
  textClass?: string;
}

export interface CreateCourseStep1Prop {
  key: string;
  label: string;
  type:
    | "input"
    | "select"
    | "date"
    | "phone"
    | "checkbox"
    | "textarea"
    | "time"
    | string;
  placeholder?: string;
  colSpan: number;
  prefix?: string | ReactNode;
  row?: number;
  options?: (BaseOptionType | DefaultOptionType)[];
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  mode?: "multiple" | "tags";
  disablePastDates?: boolean;
}

export interface StudyMaterial {
  type: string;
  name: string;
  size: number;
  url?: string;
}

export interface SubTopic {
  course_id?: string;
  lesson_name: string;
  description: string;
  studyMaterials?: StudyMaterial[];
}

export interface Lesson {
  course_id?: string | null;
  lesson_id?: string;
  lesson_url?: string;
  lesson_name: string;
  description: string;
  studyMaterials: StudyMaterial[] | [];
  unlockAfterPrevious: boolean;
  subTopics: SubTopic[] | [];
}

export type LessonsData = Lesson[];

export interface CourseInfoDataProp {
  about_course: string;
  demo_classes?: boolean;
  average_rating: number;
  course_id: string;
  course_image_url?: string;
  course_instructor?: string;
  course_instructor_image_url?: string;
  course_learning_points: string[];
  course_price: number;
  favorite: boolean;
  created_at: string;
  description: string;
  course_status?: string;
  meet_your_teacher: string | null;
  related_courses: courseData[];
  skills_you_gain: string[];
  review_count?: number;
  category_name?: string;
  category_id?: string;
  enrolled_user_count?: number;
  course_duration?: string;
  course_name?: string;
  course_level?: string;
  course_schedule?: string;
  head_teacher_id?: string;
  head_teacher_name?: string;
  head_teacher_image_url?: string | null;
  live_classes?: boolean;
  batch?: { _id: string; batchName: string; teacher: string | null }[];
  enrolled_status?: boolean;
  course_type?: string;
}

export interface CourseReview {
  review_id: string;
  course_id: string;
  user_id: string;
  user_name: string | null;
  created_at: string;
  rating: number;
  review: string;
}

export interface CourseReviewsResponse {
  average_rating: number;
  data: CourseReview[];
  review_count: number;
  message: string;
  status: boolean;
}

export interface StarCount {
  rating: string;
  count: number;
}

export interface AnnounementCardProps {
  courseName: string;
  dateTime: string;
  message: string;
}

export interface LiveClass {
  id: string;
  topic: string;
  date?: string;
  startTime: string;
  endTime?: string;
  isLive: boolean;
  joinLink?: string;
}

export interface Quiz {
  id: number;
  title: string;
  tags: string[];
  description: string;
  dueDate?: string;
  lastDate?: string;
  totalStudents?: number;
  submittedCount?: number;
  status?: "Start" | "Completed" | "Expired" | string;
  score?: string;
  submittedOn?: string;
  statusColor?: string;
}

export interface BatchModalProps {
  open: boolean;
  onClose: () => void;
  centered?: boolean;
  title: string;
  batchList: BatchItem[];
  courseData: { name: string; image: string | StaticImageData };
  handleRedirect: () => void;
  selectedBatch: number | null;
  setSelectedBatch: Dispatch<SetStateAction<number | null>>;
}

export interface BatchItem {
  id: number;
  name: string;
  assignments: number;
  lastQuizDate: string;
}

export interface createAssignmentSteps2Projects {
  projectName: string;
  description: string;
  objectives: string[];
  enableButton: boolean;
}

export interface MCQProp {
  question: string;
  options: string[];
  correctOption: string | null;
  marks: number;
}

export interface SignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  signup_type: "student" | "instructor";
}

export interface OnBoardingUser {
  user_id: string | undefined;
  topic?: string;
  career?: string;
  education_level?: string;
}



export interface OnboardingFormValues {
  goal: string;
  topics: string[];
  education: string;
}

export interface CreateCoursePayloadStep1 {
  course_name: string;
  head_teacher: string;
  duration: string;
  course_type: "free" | "paid";
  course_price: number;
  demo_class: boolean;
  category_id: string;
  course_schedule: string;
  live_classes: boolean;
  organisation_id?: string;
}

export interface CreateCoursePayloadStep3 {
  course_id: string;
  about_course: string;
  instructor_id: string;
  description: string;
}
export interface CreateCoursePayloadStep4 {
  course_id: string;
  overview: string;
}
export interface PostAnnouncementFormData {
  course: string;
  batch: string;
  announcement: string;
  isScheduled?: boolean;
  scheduleDate?: string | null;
  scheduleTime?: string | null;
}
export interface StudentRecord {
  key: string;
  name: string;
  image_url?: string;
  avatar?: string;
  email: string;
  batch?: string;
  course?: string;
  dateOfSubmit?: string;
  qualification?: string;
  result?: string;
  status: string;
  gender?: string;
  dob?: string;
  marital_status?: string;
  phone_number?: string;
  expert_in?: string[];
}
export interface InstructorRecord {
  instructor_id: string;
  key: string;
  name: string;
  image_url?: string;
  email: string;
  batch?: string;
  course?: string;
  current_courses?: string[];
  dateOfSubmit?: string;
  qualification?: string;
  result?: string;
  status: string;
  gender?: string;
  dob?: string;
  marital_status?: string;
  phone_number?: string;
  expert_in?: string[];
}

export interface StudentTableDataProps {
  key: string;
  name: string;
  email: string;
  batch: string;
  progress: string;
  status: string;
  avatar: string;
}

export interface CreateIntructorProp {
  First_name: string;
  Last_name: string;
  gender: string;
  dob: string;
  marital_status: string;
  email: string;
  phone_number: string;
  qualification: string;
  expert_in: string[];
}

export interface EnrolledCourseProp {
  course_id: string;
  user_id: string;
  course_name: string;
  course_image_url: string;
  progress: number;
  enrolled_at: string;
  instructor_id: string;
  name: string;
  instructor_url: string;
}

export interface changePasswordProp {
  old_password?: string;
  current_password?: string;
  new_password: string;
  re_enter_new_password?: string;
}

export interface AddToFavoriteProp {
  course_id: string;
  favorite: boolean;
}

export interface updateCourseStatusProp {
  course_id: string;
  course_name: string;
  description: string;
  status: "published" | "unpublished" | string;
}
export interface updateCourseStep2Prop {
  course_id: string;
  learning_points: string[];
}
export interface updateCourseStep3Prop {
  course_id: string;
  skills_you_gain: string[];
  category_id?: string;
}
export interface updateCourseStep4Prop {
  course_id: string;
  about_course: string;
}
export interface updateCourseStep5Prop {
  course_id: string;
  instructor_id: string;
  description: string;
}
export interface updateCourseStep6Prop {
  course_id: string;
  overview: string;
}

export interface EditCourseFormValues {
  course_name?: string;
  head_teacher?: string;
  duration?: string;
  course_type?: "free" | "paid";
  course_price?: number;
  demo_class?: boolean;
  category_id?: string;
  course_schedule?: "morning" | "evening";
  live_classes?: boolean;
  about_course?: string;
  instructor_id?: string;
  description?: string;
  learning_points?: string[];
  skills_you_gain?: string[];
  organisation_id?: string;
}

export interface CoursePurchase {
  _id: string;
  studentId: string | { _id: string; full_name?: string; email?: string };
  courseId: string | courseData;
  batchId?: string;
  organisationId: string;
  teacherId?: string;
  grossAmountCents: number;
  platformFeePercent: number;
  platformFeeCents: number;
  organisationShareCents: number;
  teacherShareCents: number;
  teacherRevenuePercent: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  purchasedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt?: string;
}

export interface OrganisationEarning {
  _id: string;
  organisationId: string;
  courseId: string | { _id: string; course_name?: string };
  purchaseId: string | CoursePurchase;
  grossAmountCents: number;
  platformFeeCents: number;
  earningCents: number;
  currency: string;
  status: "pending" | "available" | "processing" | "paid" | "reversed";
  createdAt?: string;
}

export interface TeacherEarning {
  _id: string;
  teacherId: string;
  organisationId: string;
  courseId: string | { _id: string; course_name?: string };
  purchaseId: string | CoursePurchase;
  earningCents: number;
  currency: string;
  status: "pending" | "available" | "processing" | "paid" | "reversed";
  createdAt?: string;
}

export interface FinancialDocument {
  _id: string;
  type: "student_purchase" | "organisation_earning" | "teacher_earning" | "payout" | "refund";
  referenceId: string;
  ownerId: string;
  ownerType: "student" | "organisation" | "teacher" | "admin";
  amountCents: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  documentUrl?: string;
  createdAt?: string;
}

export interface StripeConnectStatus {
  connected: boolean;
  connect_status: "pending" | "active" | "restricted" | "disabled";
  account_id?: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
}
