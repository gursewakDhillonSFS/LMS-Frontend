import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillora.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/homepage",
          "/homepage/*",
          "/browse",
          "/browse/*",
          "/subscription",
          "/terms",
          "/privacy-policy",
          "/faq",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/teacher",
          "/teacher/*",
          "/instructor-panel",
          "/instructor-panel/*",
          "/instructor-chat",
          "/courses",
          "/courses/*",
          "/live-classes",
          "/live-classes/*",
          "/quizzes",
          "/quizzes/*",
          "/schedule",
          "/settings",
          "/students",
          "/teachers",
          "/my-courses",
          "/my-courses/*",
          "/my-certificate",
          "/my-certificate/*",
          "/my-explore",
          "/my-schedule",
          "/my-settings",
          "/chat",
          "/checkout",
          "/checkout/*",
          "/saved-courses",
          "/onboarding",
          "/onboarding/*",
          "/becomeInstructor/onboarding",
          "/setup-password",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
