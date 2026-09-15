import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Onboarding | SkillBuild",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
