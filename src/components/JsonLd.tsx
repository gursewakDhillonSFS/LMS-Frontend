import React from "react";

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
  id?: string;
}

/**
 * Type-safe JSON-LD Script tag injector for Next.js (Schema.org)
 */
export default function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Organization Schema generator
 */
export function getOrganizationSchema(baseUrl: string = "https://skillora.com") {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${baseUrl}/#organization`,
    name: "Skillora",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/images/logo.png`,
      caption: "Skillora Logo",
    },
    description:
      "Master in-demand skills in software development, data science, AI, and design with industry-leading courses and verified certifications.",
    sameAs: [
      "https://twitter.com/skillora",
      "https://linkedin.com/company/skillora",
      "https://github.com/skillora",
    ],
  };
}

/**
 * WebSite Schema with Sitelinks Searchbox
 */
export function getWebSiteSchema(baseUrl: string = "https://skillora.com") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: "Skillora",
    url: baseUrl,
    description: "Master In-Demand Tech, Design & Business Skills",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/browse?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };
}

/**
 * Breadcrumb Schema generator
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; item: string }>,
  baseUrl: string = "https://skillora.com"
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith("http") ? crumb.item : `${baseUrl}${crumb.item}`,
    })),
  };
}

/**
 * Course Schema generator
 */
export interface CourseSchemaParams {
  name: string;
  description: string;
  providerName?: string;
  courseUrl: string;
  imageUrl?: string;
  price?: number | string;
  currency?: string;
  ratingValue?: number;
  reviewCount?: number;
  category?: string;
  level?: string;
  datePublished?: string;
}

export function getCourseSchema(params: CourseSchemaParams, baseUrl: string = "https://skillora.com") {
  const fullCourseUrl = params.courseUrl.startsWith("http")
    ? params.courseUrl
    : `${baseUrl}${params.courseUrl}`;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: params.name,
    description: params.description,
    provider: {
      "@type": "Organization",
      name: params.providerName || "Skillora",
      sameAs: baseUrl,
    },
    url: fullCourseUrl,
    image: params.imageUrl,
    occupationalCredentialAwarded: "Certificate of Completion",
    educationalLevel: params.level || "Beginner to Advanced",
    about: params.category,
    ...(params.ratingValue
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: params.ratingValue.toString(),
            reviewCount: (params.reviewCount || 10).toString(),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    offers: [
      {
        "@type": "Offer",
        category: "Subscription",
        price: params.price ? params.price.toString() : "0",
        priceCurrency: params.currency || "USD",
        url: fullCourseUrl,
        availability: "https://schema.org/InStock",
      },
    ],
  };
}

/**
 * FAQPage Schema generator
 */
export function getFAQPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
