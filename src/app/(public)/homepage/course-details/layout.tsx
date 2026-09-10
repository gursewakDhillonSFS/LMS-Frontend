import type { Metadata } from "next";
import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skillora.com";

export const metadata: Metadata = {
  title: "Course Details & Curriculum | Skillora",
  description:
    "Explore comprehensive course curriculum, expert instructor profiles, student reviews, and verified certification requirements on Skillora.",
  alternates: {
    canonical: `${baseUrl}/homepage/course-details`,
  },
  openGraph: {
    title: "Course Details & Curriculum | Skillora",
    description:
      "Explore comprehensive course curriculum, expert instructor profiles, student reviews, and verified certification requirements on Skillora.",
    url: `${baseUrl}/homepage/course-details`,
    type: "website",
    siteName: "Skillora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Course Details & Curriculum | Skillora",
    description:
      "Explore comprehensive course curriculum, expert instructor profiles, student reviews, and verified certification requirements on Skillora.",
  },
};

export default function HomepageCourseDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
