import React from "react";
import type { Metadata } from "next";
import SubscriptionWrapper from "@/modules/subscription/SubscriptionWrapper";
import JsonLd, { getBreadcrumbSchema } from "@/components/JsonLd";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillora.com";

export const metadata: Metadata = {
  title: "Skillora Pro Membership — Unlimited Access to All Courses",
  description:
    "Unlock unlimited access to 1,000+ courses, hands-on projects, verified certificates, and mentor support with Skillora Pro.",
  keywords: [
    "Skillora Pro",
    "course subscription",
    "unlimited learning",
    "tech certificates",
    "coding membership",
  ],
  alternates: {
    canonical: `${baseUrl}/subscription`,
  },
  openGraph: {
    title: "Skillora Pro Membership — Unlimited Access to All Courses",
    description:
      "Unlock unlimited access to 1,000+ courses, hands-on projects, verified certificates, and mentor support with Skillora Pro.",
    url: `${baseUrl}/subscription`,
    type: "website",
    siteName: "Skillora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skillora Pro Membership — Unlimited Access to All Courses",
    description:
      "Unlock unlimited access to 1,000+ courses, hands-on projects, verified certificates, and mentor support with Skillora Pro.",
  },
};

const SubscriptionPage = () => {
  const breadcrumbs = getBreadcrumbSchema(
    [
      { name: "Home", item: "/" },
      { name: "Skillora Pro", item: "/subscription" },
    ],
    baseUrl
  );

  return (
    <>
      <JsonLd id="subscription-breadcrumbs-schema" data={breadcrumbs} />
      <SubscriptionWrapper />
    </>
  );
};

export default SubscriptionPage;
