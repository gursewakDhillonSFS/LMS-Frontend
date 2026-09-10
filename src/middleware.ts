import { NextRequest, NextResponse } from "next/server";
import { Role, RoutePaths } from "./utils/enums";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role_name")?.value;
  const userOnboarding = request.cookies.get("user_onboarding")?.value;
  const instructorOnboarding = request.cookies.get(
    "instructor_onboarding"
  )?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/setup-password")) {
    return NextResponse.next();
  }

  const publicRoutes = [
    "/",
    "/becomeInstructor",
    "/browse",
    "/homepage",
    "/onboarding",
    "/subscription",
    "/setup-password",
  ];

  const userRoutes = [
    "/dashboard",
    "/my-certificate",
    "/my-courses",
    "/my-explore",
    "/my-schedule",
    "/my-settings",
    "/chat",
    "/checkout",
    "/saved-courses",
  ];

  const instructorRoutes = [
    "/announcements",
    "/assignments",
    "/courses",
    "/instructor-panel",
    "/live-classes",
    "/quizzes",
    "/schedule",
    "/settings",
    "/students",
    "/teachers",
    "/instructor-chat",
  ];

  const teacherRoutes = ["/teacher"];
  const adminRoutes = ["/admin"];

  if (pathname === "/homepage") {
    return NextResponse.redirect(new URL("/", request.url), 308);
  }

  if (pathname === "/becomeInstructor") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isPublic =
    pathname === "/" ||
    publicRoutes.some((route) => route !== "/" && pathname.startsWith(route));
  const isUser = userRoutes.some((route) => pathname.startsWith(route));
  const isInstructor = instructorRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isTeacher = teacherRoutes.some((route) => pathname.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if (token && isPublic) {
    let url = "/";
    if (role === Role?.STUDENT) {
      const isStillOnboarding =
        userOnboarding === "1" || userOnboarding === "2" || userOnboarding === "3";
      url = isStillOnboarding
        ? RoutePaths?.Onboarding
        : RoutePaths?.Dashboard;
    } else if (role === Role?.TEACHER) {
      url = RoutePaths?.TeacherDashboard;
    } else if (role === Role?.ADMIN) {
      url = RoutePaths?.AdminPanel;
    } else {
      const isStillOnboarding =
        instructorOnboarding === "1" || instructorOnboarding === "2";
      url = isStillOnboarding
        ? `${RoutePaths?.BecomeInstructor}/onboarding`
        : RoutePaths?.InstructorPanel;
    }

    if (pathname !== url) {
      return NextResponse.redirect(new URL(url, request.url));
    } else {
      return NextResponse.next();
    }
  }

  if (!token && isPublic) {
    return NextResponse.next();
  }

  if (!token && (isUser || isInstructor || isTeacher || isAdmin)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && role) {
    let onboardingRedirectUrl = null;

    if (role === Role?.STUDENT) {
      if (!(userOnboarding === "undefined")) {
        onboardingRedirectUrl = RoutePaths?.Onboarding;
      }
    } else if (role === Role?.INSTRUCTOR) {
      if (!(instructorOnboarding === "undefined")) {
        onboardingRedirectUrl = `${RoutePaths?.BecomeInstructor}/onboarding`;
      }
    }

    if (onboardingRedirectUrl && pathname !== onboardingRedirectUrl) {
      return NextResponse.redirect(new URL(onboardingRedirectUrl, request.url));
    }

    if (role === Role?.STUDENT && isUser) return NextResponse.next();
    if (role === Role?.INSTRUCTOR && isInstructor) return NextResponse.next();
    if (role === Role?.TEACHER && isTeacher) return NextResponse.next();
    if (role === Role?.ADMIN && isAdmin) return NextResponse.next();

    let defaultUrl = RoutePaths?.Homepage;
    if (role === Role?.STUDENT) {
      defaultUrl = RoutePaths?.Dashboard;
    } else if (role === Role?.TEACHER) {
      defaultUrl = RoutePaths?.TeacherDashboard;
    } else if (role === Role?.INSTRUCTOR) {
      defaultUrl = RoutePaths?.InstructorPanel;
    } else if (role === Role?.ADMIN) {
      defaultUrl = RoutePaths?.AdminPanel;
    }

    return NextResponse.redirect(new URL(defaultUrl, request.url));
  }
}
export const config = {
  matcher: [
    "/",
    "/becomeInstructor/:path*",
    "/browse/:path*",
    "/homepage/:path*",
    "/onboarding",
    "/subscription/:path*",
    "/setup-password",
    "/dashboard/:path*",
    "/my-certificate/:path*",
    "/my-courses/:path*",
    "/my-explore/:path*",
    "/my-schedule/:path*",
    "/my-settings/:path*",
    "/saved-courses/:path*",
    "/chat",
    "/checkout/:path*",
    "/announcements/:path*",
    "/assignments/:path*",
    "/courses/:path*",
    "/instructor-panel/:path*",
    "/instructor-chat/:path*",
    "/live-classes/:path*",
    "/quizzes/:path*",
    "/schedule/:path*",
    "/settings/:path*",
    "/students/:path*",
    "/teachers/:path*",
    "/teacher/:path*",
    "/admin/:path*",
  ],
};
