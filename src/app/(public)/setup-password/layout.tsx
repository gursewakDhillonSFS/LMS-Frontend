import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Setup Password | SkillBuild",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SetupPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
