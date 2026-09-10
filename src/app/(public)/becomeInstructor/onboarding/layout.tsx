import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Instructor Onboarding | Skillora",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BecomeInstructorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
