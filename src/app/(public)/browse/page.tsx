import BrowseWrapper from "@/modules/browse/BrowseWrapper";
import React from "react";
import type { Metadata } from "next";
import JsonLd, { getBreadcrumbSchema } from "@/components/JsonLd";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skillora.com";

export const metadata: Metadata = {
  title: "Browse Online Courses & Certifications | Skillora",
  description:
    "Explore hundreds of top-rated online courses in Web Development, Data Science, AI, UI/UX Design, and Digital Marketing. Learn from industry leaders at your own pace.",
  keywords: [
    "browse courses",
    "online certifications",
    "software engineering courses",
    "learn python",
    "learn javascript",
    "design bootcamps",
    "Skillora courses",
  ],
  alternates: {
    canonical: `${baseUrl}/browse`,
  },
  openGraph: {
    title: "Browse Online Courses & Certifications | Skillora",
    description:
      "Explore hundreds of top-rated online courses in Web Development, Data Science, AI, UI/UX Design, and Digital Marketing.",
    url: `${baseUrl}/browse`,
    type: "website",
    siteName: "Skillora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Online Courses & Certifications | Skillora",
    description:
      "Explore hundreds of top-rated online courses in Web Development, Data Science, AI, UI/UX Design, and Digital Marketing.",
  },
};

const Browse = () => {
  const breadcrumbSchema = getBreadcrumbSchema(
    [
      { name: "Home", item: "/" },
      { name: "Browse Courses", item: "/browse" },
    ],
    baseUrl
  );

  return (
    <div>
      <JsonLd id="browse-breadcrumbs-schema" data={breadcrumbSchema} />
      <BrowseWrapper />
    </div>
  );
};

export default Browse;
