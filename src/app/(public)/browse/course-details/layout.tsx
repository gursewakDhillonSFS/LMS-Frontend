import type { Metadata } from "next";
import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skillbuild.com";

export const metadata: Metadata = {
  title: "Course Details & Curriculum | SkillBuild",
  description:
    "Explore comprehensive course curriculum, expert instructor profiles, student reviews, and verified certification requirements on SkillBuild.",
  alternates: {
    canonical: `${baseUrl}/browse/course-details`,
  },
  openGraph: {
    title: "Course Details & Curriculum | SkillBuild",
    description:
      "Explore comprehensive course curriculum, expert instructor profiles, student reviews, and verified certification requirements on SkillBuild.",
    url: `${baseUrl}/browse/course-details`,
    type: "website",
    siteName: "SkillBuild",
  },
  twitter: {
    card: "summary_large_image",
    title: "Course Details & Curriculum | SkillBuild",
    description:
      "Explore comprehensive course curriculum, expert instructor profiles, student reviews, and verified certification requirements on SkillBuild.",
  },
};

export default function CourseDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
